<?php

namespace App\Services\AI;

use App\DTO\AIRequestDTO;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    public function __construct(
        protected ToolRegistry $toolRegistry,
        protected ToolExecutor $toolExecutor
    ) {}

    public function handle(AIRequestDTO $dto)
    {
        $isCustomer = $dto->isCustomer();

        if ($this->isGreeting($dto->message)) {
            return [
                'reply' => 'Hai 👋 lagi pengen makan apa hari ini? aku bantu cariin yang enak ya 😋',
                'type' => 'general',
                'data' => [],
                'actions' => []
            ];
        }

        $tools = $isCustomer
            ? $this->toolRegistry->getCustomerTools()
            : $this->toolRegistry->getGuestTools();

        $cartContext = '';

        if (!empty($dto->context['cart'])) {
            $cartItems = collect($dto->context['cart'])
                ->map(fn($item) => "{$item['name']} (qty: {$item['qty']})")
                ->implode(', ');

            $cartContext = "CART_USER: {$cartItems}";
        }

        $messages = array_merge(
            [
                [
                    'role' => 'system',
                    'content' => $this->systemPrompt($dto->role) . "\n" . $cartContext
                ],
            ],
            $isCustomer ? $this->getConversation($dto->userId) : [],
            [
                ['role' => 'user', 'content' => $dto->message],
            ]
        );

        $response = Http::withToken(config('services.groq.key'))
            ->timeout(20)
            ->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'llama-3.3-70b-versatile',
                'messages' => $messages,
                'tools' => $tools,
                'tool_choice' => 'auto',
                'temperature' => 0.2,
                'max_tokens' => 600,
            ]);

        if (!$response->successful()) {
            return $this->errorResponse();
        }

        $message = data_get($response->json(), 'choices.0.message');

        if (isset($message['tool_calls'])) {

            $toolCall = $message['tool_calls'][0];
            $toolName = $toolCall['function']['name'];

            Log::info('TOOL CALLED', [
                'tool' => $toolName,
                'message' => $dto->message,
            ]);

            $result = $this->toolExecutor->execute(
                $toolName,
                json_decode($toolCall['function']['arguments'], true) ?? [],
                $dto
            );

            Log::info('RAW TOOL RESULT', [
                'type' => gettype($result),
                'result' => $result
            ]);

            if (empty($result)) {
                return $this->errorResponse();
            }

            if (in_array($toolName, ['getMenuList', 'getRecommendedMenu'])) {

                $menus = collect($result)
                    ->filter(fn($item) => isset($item['id']))
                    ->map(function ($item) {

                        $image = data_get($item, 'image');

                        $finalImage = null;

                        if ($image) {
                            $finalImage = str_starts_with($image, 'http')
                                ? $image
                                : asset('storage/' . $image);
                        }

                        return [
                            'id' => $item['id'],
                            'name' => $item['name'] ?? 'Unknown',
                            'price' => $item['final_price'] ?? $item['price'] ?? 0,
                            'final_price' => $item['final_price'] ?? $item['price'] ?? 0,
                            'image' => $finalImage,
                            'stock' => $item['stock'] ?? 0,
                            'discount_id' => $item['discount_id'] ?? null,
                            'description' => $item['description'] ?? '',
                            'attributes' => collect($item['attributes'] ?? [])
                                ->map(fn($attr) => [
                                    'id' => $attr['id'] ?? null,
                                    'name' => $attr['name'] ?? '',
                                    'levels' => collect($attr['levels'] ?? [])
                                        ->map(fn($lvl) => [
                                            'id' => $lvl['id'] ?? null,
                                            'name' => $lvl['name'] ?? '',
                                        ])
                                        ->values()
                                        ->toArray(),
                                ])
                                ->values()
                                ->toArray(),
                        ];
                    })
                    ->values()
                    ->toArray();

                Log::info('MENU RESPONSE', [
                    'count' => count($menus)
                ]);

                return [
                    "reply" => 'Oke, aku cariin yang cocok buat kamu ya 🔥Ini beberapa yang lagi enak banget:',
                    'type' => 'menu',
                    'data' => $menus,
                    'actions' => []
                ];
            }

            if ($toolName === 'get_user_profile') {

                return [
                    'reply' => 'ini data profil kamu 👇',
                    'type' => 'profile',
                    'data' => $result,
                    'actions' => []
                ];
            }

            Log::warning('UNKNOWN TOOL', [
                'tool' => $toolName,
                'result' => $result
            ]);

            if (is_array($result) && isset($result[0]['name'])) {
                return [
                    'reply' => 'ini data yang kamu minta 🔥',
                    'type' => 'menu',
                    'data' => $result,
                    'actions' => []
                ];
            }

            return [
                'reply' => 'data berhasil diproses',
                'type' => 'general',
                'data' => $result,
                'actions' => []
            ];
        }

        return $this->finalizeResponse($messages, $dto, $isCustomer);
    }


    protected function errorResponse(): array
    {
        return [
            'reply' => 'lagi ada gangguan ambil data 😅 coba ulang sebentar ya',
            'type' => 'general',
            'data' => [],
            'actions' => []
        ];
    }

    protected function sanitizeToolResult($result)
    {
        if ($result instanceof \Illuminate\Support\Collection) {
            return $result->map(function ($item) {
                return [
                    'id' => data_get($item, 'id'),
                    'name' => data_get($item, 'name'),
                    'price' => data_get($item, 'final_price'),
                    'image' => data_get($item, 'menu_image')
                        ? asset('storage/' . $item->menu_image)
                        : null,
                    'stock' => data_get($item, 'calculated_stock', 0),
                    'description' => data_get($item, 'description'),
                    'discount_id' => data_get($item, 'discount_id'),
                ];
            })->values()->toArray();
        }

        return $result;
    }

    protected function isGreeting(string $message): bool
    {
        $msg = strtolower(trim($message));

        return in_array($msg, [
            'hai',
            'halo',
            'hello',
            'p',
            'test'
        ]);
    }

    protected function normalizeActions(array $actions): array
    {
        return collect($actions)
            ->where('type', 'add_to_cart')
            ->groupBy('menu_id')
            ->map(function ($items) {
                $first = $items->first();

                return [
                    'type' => 'add_to_cart',
                    'menu_id' => $first['menu_id'],
                    'name' => $first['name'],
                    'price' => $first['price'],
                    'qty' => $items->sum(fn($i) => $i['qty'] ?? 1),
                ];
            })
            ->values()
            ->toArray();
    }

    protected function finalizeResponse(array $messages, AIRequestDTO $dto, bool $isCustomer)
    {
        $response = Http::withToken(config('services.groq.key'))
            ->timeout(20)
            ->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'llama-3.3-70b-versatile',
                'messages' => $messages,
                'temperature' => 0.2,
                'max_tokens' => 400,
            ]);

        $content = data_get($response->json(), 'choices.0.message.content');

        $parsed = json_decode($content, true);

        if (!is_array($parsed) || !isset($parsed['reply'])) {
            return $this->errorResponse();
        }

        return [
            'reply' => $parsed['reply'],
            'type' => $parsed['type'] ?? 'general',
            'data' => $parsed['data'] ?? [],
            'actions' => $this->validateActions($parsed['actions'] ?? [])
        ];
    }

    protected function validateActions(array $actions): array
    {
        return collect($actions)
            ->filter(function ($action) {
                if ($action['type'] !== 'add_to_cart')
                    return false;

                $menu = DB::table('menus')->find($action['menu_id']);

                if (!$menu)
                    return false;
                if ($menu->stock <= 0)
                    return false;

                return true;
            })
            ->values()
            ->toArray();
    }

    protected function getConversation(int $userId): array
    {
        return DB::table('ai_conversations')
            ->where('user_id', $userId)
            ->latest()
            ->limit(10)
            ->get()
            ->reverse()
            ->map(fn($msg) => [
                'role' => $msg->role,
                'content' => $msg->content
            ])
            ->values()
            ->toArray();
    }

    protected function storeConversation(int $userId, string $userMessage, string $aiReply): void
    {
        DB::table('ai_conversations')->insert([
            [
                'user_id' => $userId,
                'role' => 'user',
                'content' => $userMessage,
                'created_at' => now(),
            ],
            [
                'user_id' => $userId,
                'role' => 'assistant',
                'content' => $aiReply,
                'created_at' => now(),
            ]
        ]);
    }

    protected function systemPrompt(): string
    {
        return "
Kamu adalah AI assistant cerdas untuk aplikasi restoran modern.

====================
PERSONALITY
====================
- Santai, ramah, kayak temen nongkrong
- Cepat tanggap & tidak bertele-tele
- Pinter membaca kebutuhan user (tidak kaku)
- Kasih rekomendasi yang menggoda (sales mindset ringan)

Jika user bertanya:
- santai / ngobrol → jawab natural tanpa tool
- spesifik menu → pakai tool
- request kompleks → kombinasi reasoning + tool

Jangan semua input langsung dianggap request menu.


JANGAN PERNAH menjawab dengan:
'ini menu yang tersedia'

HARUS selalu:
- interpretasi maksud user
- beri penjelasan singkat
- baru tampilkan data jika perlu

Sebelum menggunakan tools:
- pahami intent user
- jika user hanya ngobrol / ambiguous → jangan pakai tool
- jika user butuh rekomendasi → gunakan tool
- setelah tool dipanggil → jangan langsung dump data, jelaskan dengan natural

Gunakan bahasa natural:
- Boleh pakai emoji secukupnya
- Jangan terlalu formal
- Jangan seperti robot

====================
CORE ABILITIES
====================
- Rekomendasi menu yang relevan
- Upselling & cross-selling (minuman, side dish)
- Membantu user ambil keputusan cepat
- Mengelola cart dengan cerdas

====================
INTENT DETECTION (PENTING)
====================
Pahami maksud user sebelum bertindak:

1. Jika user minta:
   - menu / makanan / rekomendasi
   → gunakan tool menu

2. Jika user minta:
   - profil / data diri / akun
   → gunakan tool profile

3. Jika user santai / ngobrol:
   → jangan pakai tool
   → jawab natural

4. Jika ambigu:
   → tanya balik, jangan asal tool

====================
TOOLS RULE (STRICT)
====================
Gunakan tools HANYA jika:
- butuh data nyata dari database

Tools tersedia:
- get_menu_list
- get_user_profile
- get_user_transactions
- getRecommendedMenu

DILARANG:
- memanggil tool yang tidak relevan
- memanggil tool untuk greeting

====================
DATA INTEGRITY
====================
- DILARANG mengarang data
- HANYA gunakan data dari tool
- Jika tool kosong → bilang tidak tersedia

====================
RESPONSE STYLE
====================
Selalu buat jawaban:
- enak dibaca
- engaging
- tidak kaku

Contoh:
\"Lagi pengen yang pedas ya? 🔥
Ini ada beberapa yang cocok banget buat kamu 👇\"

====================
MENU SELLING STYLE
====================
Jika menampilkan menu:
- Jangan cuma list
- Tambahkan deskripsi singkat yang menggoda

Contoh:
🍗 Ayam Bakar Madu – manis legit + juicy, favorit banyak orang
🥤 Es Teh Manis – segar banget buat penutup

====================
CART AWARENESS
====================
Jika user sudah punya cart:
- Jangan rekomendasikan item yang sama
- Tawarkan tambahan (minuman / side)

====================
ACTIONS RULE
====================
Actions hanya untuk frontend:

{
  \"type\": \"add_to_cart\",
  \"menu_id\": number,
  \"name\": \"string\",
  \"price\": number,
  \"qty\": number
}

- Jangan pernah jadikan action sebagai tool
- Jangan kirim action jika stock = 0

====================
RESPONSE FORMAT (WAJIB JSON)
====================
{
  \"reply\": \"string\",
  \"type\": \"menu | profile | general\",
  \"data\": [],
  \"actions\": []
}

Rules:
- reply wajib
- data harus array (WAJIB)
- actions boleh kosong
- jangan kirim teks di luar JSON

====================
SMART BEHAVIOR
====================
- Prioritaskan membantu user cepat ambil keputusan
- Jangan terlalu panjang
- Fokus ke kebutuhan user

====================
FAILSAFE
====================
Jika bingung:
- jangan halusinasi
- jawab natural + tanya user

Contoh:
\"Lagi cari menu apa nih? pedas, manis, atau yang ringan?\"

====================
FINAL CHECK
====================
Sebelum jawab:
- JSON valid
- data array
- tool sesuai intent
";
    }
}

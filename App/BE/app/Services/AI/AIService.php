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
        $message = strtolower(trim($dto->message));

        // =========================
        // 0. GREETING FAST PATH
        // =========================
        if ($this->isGreeting($message)) {
            return [
                'reply' => 'Halo 👋 mau cari menu apa hari ini?',
                'type' => 'general',
                'data' => [],
                'actions' => []
            ];
        }

        // =========================
        // 1. INTENT DETECTION
        // =========================
        $intent = $this->detectIntent($message);

        $data = [];
        $type = 'general';

        // =========================
        // 2. HANDLE INTENT
        // =========================
        switch ($intent['intent']) {

            case 'menu_list':
                $data = $this->toolExecutor->execute('getMenuList', [], $dto);
                $type = 'menu';
                break;

            case 'recommendation':
                $data = $this->toolExecutor->execute(
                    'getRecommendedMenu',
                    $intent['filters'] ?? [],
                    $dto
                );
                $type = 'menu';
                break;

            case 'profile':
                $data = $this->toolExecutor->execute('get_user_profile', [], $dto);
                $type = 'profile';
                break;

            case 'follow_up':
                $context = $this->getLastContext($dto->userId);

                if (!$context) {
                    return $this->fallback("Maksudnya yang mana ya? 😅");
                }

                // 🔥 refresh context biar chaining jalan
                $this->storeContext($dto->userId, $context['type'], $context['data']);

                return [
                    'reply' => 'Ini yang tadi kamu maksud 👇',
                    'type' => $context['type'],
                    'data' => $context['data'],
                    'actions' => []
                ];

            default:
                return [
                    'reply' => 'Lagi pengen makan apa nih? 🔥',
                    'type' => 'general',
                    'data' => [],
                    'actions' => []
                ];
        }

        // =========================
        // 3. SANITIZE TOOL RESULT
        // =========================
        $data = $this->sanitizeToolResult($data);

        // =========================
        // 4. VALIDASI DATA (FIXED)
        // =========================
        if (!is_array($data) || count($data) === 0) {
            return [
                'reply' => 'Belum nemu yang cocok 😅 mau coba yang lain?',
                'type' => 'general',
                'data' => [],
                'actions' => []
            ];
        }

        // =========================
        // 5. NORMALIZE MENU
        // =========================
        if ($type === 'menu') {
            $data = $this->formatMenu($data);
        }

        // =========================
        // 6. SAVE CONTEXT
        // =========================
        $this->storeContext($dto->userId, $type, $data);

        // =========================
        // 7. BUILD RESPONSE
        // =========================
        $response = [
            'reply' => $this->buildReply($intent),
            'type' => $type,
            'data' => $data,
            'actions' => []
        ];

        // =========================
        // 8. SAVE CONVERSATION
        // =========================
        $this->storeConversation(
            $dto->userId,
            $dto->message,
            $response['reply']
        );

        return $response;
    }

    protected function formatMenu(array $menus): array
    {
        return collect($menus)
            ->filter(fn($item) => isset($item['id']))
            ->map(function ($item) {

                $image = data_get($item, 'image');
                return [
                    'id' => $item['id'],
                    'name' => $item['name'] ?? 'Unknown',
                    'price' => $item['final_price'] ?? $item['price'] ?? 0,
                    'final_price' => $item['final_price'] ?? $item['price'] ?? 0,
                    'original_price' => $item['original_price'] ?? $item['price'] ?? 0,
                    'description' => $item['description'] ?? '',
                    'stock' => $item['stock'] ?? 0,
                    'image' => $image,

                    'discount' => data_get($item, 'discount') ? [
                        'id' => data_get($item, 'discount.id'),
                        'type' => data_get($item, 'discount.type'),
                        'value' => data_get($item, 'discount.value'),
                    ] : null,

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
    }

    protected function buildReply(array $intent): string
    {
        switch ($intent['intent']) {

            case 'menu_list':
                return 'Ini dia menu yang bisa kamu pilih 🍽️';

            case 'recommendation':
                if (!empty($intent['filters']['spicy'])) {
                    return 'Lagi pengen yang pedas ya 🔥 ini rekomendasi buat kamu 👇';
                }
                return 'Ini beberapa rekomendasi yang lagi enak banget 😋';

            case 'profile':
                return 'Ini data profil kamu 👇';

            default:
                return 'Siap, aku bantu ya 👍';
        }
    }

    protected function fallback(string $message = 'Terjadi kesalahan, coba lagi ya'): array
    {
        return [
            'reply' => $message,
            'type' => 'general',
            'data' => [],
            'actions' => []
        ];
    }

    protected function detectIntent(string $msg): array
    {
        if (
            str_contains($msg, 'menu') ||
            str_contains($msg, 'makanan') ||
            str_contains($msg, 'ada apa') ||
            str_contains($msg, 'list')
        ) {
            return ['intent' => 'menu_list'];
        }

        if (
            str_contains($msg, 'pedas') ||
            str_contains($msg, 'rekomendasi') ||
            str_contains($msg, 'enak') ||
            str_contains($msg, 'best')
        ) {
            return [
                'intent' => 'recommendation',
                'filters' => [
                    'spicy' => str_contains($msg, 'pedas')
                ]
            ];
        }

        if (
            str_contains($msg, 'profil') ||
            str_contains($msg, 'akun')
        ) {
            return ['intent' => 'profile'];
        }

        if (in_array($msg, ['mana', 'lagi', 'yang tadi'])) {
            return ['intent' => 'follow_up'];
        }

        return ['intent' => 'general'];
    }

    protected function storeContext($userId, $type, $data)
    {
        DB::table('ai_contexts')->insert([
            'user_id' => $userId,
            'type' => $type,
            'data' => json_encode($data),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    protected function getLastContext($userId)
    {
        $ctx = DB::table('ai_contexts')
            ->where('user_id', $userId)
            ->latest()
            ->first();

        if (!$ctx) return null;

        return [
            'type' => $ctx->type,
            'data' => json_decode($ctx->data, true)
        ];
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

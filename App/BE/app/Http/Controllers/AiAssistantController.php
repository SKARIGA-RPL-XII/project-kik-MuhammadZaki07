<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Menu;
use App\Models\ChatHistory;
use Exception;

class AiAssistantController extends Controller
{
    private function getSystemPrompt()
    {
        $menus = Menu::with('category')->get()->map(function ($menu) {
            return [
                'name' => $menu->name,
                'price' => $menu->final_price,
                'category' => $menu->category->name ?? 'Lainnya',
                'description' => $menu->description,
                'is_available' => $menu->calculated_stock > 0
            ];
        })->values();

        return "
IDENTITY:
GagalBot = AI restoran. Santai, bantu user pilih & pesan.

DATA:
Menu: {$menus->toJson()}

IMPORTANT:
- HANYA gunakan data di atas
- DILARANG halu
- is_available=false = habis
- is_available=true = bisa dipesan

CONTEXT:
- Ingat percakapan terakhir
- 'mau/ya/oke' = setuju dengan menu terakhir
- Jangan ulang dari awal

STATE:
- Simpan menu terakhir yg direkomendasikan

FLOW:
1. show_menu
2. recommend
3. confirm
4. order

RESPONSE:
WAJIB JSON VALID:
{
  \"message\": \"string\",
  \"action\": \"show_menu | recommend | confirm | order | none\",
  \"data\": []
}

RULES:
- Maks 2 kalimat
- Santai
- Jangan bilang semua habis kalau tidak

OUT:
{
  \"message\": \"Fokus gue ke makanan ya 😅 Mau liat menu?\",
  \"action\": \"none\",
  \"data\": []
}
";
    }

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        $sessionId = $request->user()
            ? $request->user()->id
            : session()->getId();

        // 🔥 Ambil history (lebih panjang)
        $history = ChatHistory::where('session_id', $sessionId)
            ->latest()
            ->limit(10)
            ->get()
            ->reverse();

        // 🔥 Build messages
        $messages = [
            [
                'role' => 'system',
                'content' => $this->getSystemPrompt()
            ]
        ];

        foreach ($history as $chat) {
            $messages[] = [
                'role' => $chat->role,
                'content' => $chat->message // sudah JSON
            ];
        }

        $messages[] = [
            'role' => 'user',
            'content' => strip_tags($request->message)
        ];

        try {
            $response = Http::withToken(env('GROQ_API_KEY'))
                ->timeout(30)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.3-70b-versatile',
                    'messages' => $messages,
                    'temperature' => 0.5,
                    'response_format' => ['type' => 'json_object']
                ]);

            if (!$response->ok()) {
                throw new Exception("API Error");
            }

            $content = $response->json()['choices'][0]['message']['content'];
            $aiData = json_decode($content, true);

            // 🔥 VALIDASI JSON (anti error)
            if (!$aiData || !isset($aiData['message'])) {
                throw new Exception("Invalid AI Response");
            }

            // 🔥 SIMPAN HISTORY (FULL JSON)
            ChatHistory::create([
                'session_id' => $sessionId,
                'role' => 'user',
                'message' => $request->message
            ]);

            ChatHistory::create([
                'session_id' => $sessionId,
                'role' => 'assistant',
                'message' => json_encode($aiData)
            ]);

            return response()->json($aiData);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Waduh error bro 😭 coba lagi',
                'action' => 'none',
                'data' => []
            ], 500);
        }
    }
}

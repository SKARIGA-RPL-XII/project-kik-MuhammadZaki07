<?php

namespace App\Http\Controllers;

use App\DTO\AIRequestDTO;
use App\Services\AI\AIService;
use Illuminate\Http\Request;

class AIController extends Controller
{
    public function chat(Request $request, AIService $aiService)
    {
        $request->validate([
            'message' => 'required|string|max:1000'
        ]);

        $user = $request->user()->load('role');

        if (!$user || !$user->is_active) {
            return response()->json([
                'reply' => 'Unauthorized'
            ], 403);
        }

        $dto = new AIRequestDTO(
            message: trim($request->message),
            role: $user->role?->name ?? 'guest',
            userId: $user->id,
            context: [
                'cart' => $request->input('cart', [])
            ]
        );

        return response()->json(
            $aiService->handle($dto)
        );
    }

    public function guestChat(Request $request, AIService $aiService)
    {
        $request->validate([
            'message' => 'required|string|max:500'
        ]);

        $dto = new AIRequestDTO(
            message: trim($request->message),
            role: 'guest',
            userId: 0
        );

        return response()->json(
            $aiService->handle($dto)
        );
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\MidtransService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    public function callback(Request $request)
    {
        Log::info('MIDTRANS CALLBACK HIT', $request->all());
        try {
            $this->midtransService->handleNotification($request->all());
            return response()->json(['message' => 'Webhook processed']);
        } catch (Exception $e) {
            Log::error('MIDTRANS CALLBACK ERROR', [
                'msg' => $e->getMessage()
            ]);
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}

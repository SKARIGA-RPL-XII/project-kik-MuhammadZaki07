<?php

namespace App\Actions\AI;

use App\DTO\AIRequestDTO;
use App\Models\User;

class GetUserProfile
{
    public function handle(AIRequestDTO $dto)
    {
        $user = User::with('badge')
            ->select('id', 'username', 'email', 'badge_id')
            ->find($dto->userId);

        if (!$user) {
            return 'data tidak tersedia dari sistem';
        }

        return [
            'name' => $user->username,
            'email' => $user->email,
            'badge' => $user->badge?->name,
            'total_spend' => $user->total_spend,
        ];
    }
}

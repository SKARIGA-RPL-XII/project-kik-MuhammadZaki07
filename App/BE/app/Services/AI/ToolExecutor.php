<?php

namespace App\Services\AI;

use App\Actions\AI\GetMenuList;
use App\Actions\AI\GetRecommendedMenu;
use App\Actions\AI\GetUserProfile;
use App\Actions\AI\GetUserTransactions;
use App\DTO\AIRequestDTO;
use Exception;

class ToolExecutor
{
    public function execute(string $tool, array $args, AIRequestDTO $dto)
    {
        return match ($tool) {
            'getUserProfile' => app(GetUserProfile::class)->handle($dto),
            'getUserTransactions' => app(GetUserTransactions::class)->handle($dto),
            'getMenuList' => app(GetMenuList::class)->handle(),
            'getRecommendedMenu' => app(GetRecommendedMenu::class)->handle($dto),
            default => throw new Exception('Tool tidak ditemukan'),
        };
    }
}

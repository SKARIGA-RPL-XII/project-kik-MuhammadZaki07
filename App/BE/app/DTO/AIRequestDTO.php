<?php

namespace App\DTO;

class AIRequestDTO
{
    public function __construct(
        public readonly string $message,
        public readonly string $role,
        public readonly int $userId,
        public readonly ?array $context = null,
    ) {}

    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}

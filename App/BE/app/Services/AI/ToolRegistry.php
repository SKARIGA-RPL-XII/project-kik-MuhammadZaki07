<?php

namespace App\Services\AI;

class ToolRegistry
{
    public function getCustomerTools(): array
    {
        return [
            $this->userProfile(),
            $this->transactions(),
            $this->menuList(),
            $this->recommendedMenu(),
        ];
    }

    public function getGuestTools(): array
    {
        return [
            $this->menuList(),
            $this->recommendedMenu(),
        ];
    }

    protected function userProfile()
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => 'getUserProfile',
                'description' => 'Ambil profil user login',
                'parameters' => [
                    'type' => 'object',
                    'properties' => new \stdClass(),
                ]
            ]
        ];
    }

    protected function transactions()
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => 'getUserTransactions',
                'description' => 'Ambil transaksi terakhir user',
                'parameters' => [
                    'type' => 'object',
                    'properties' => new \stdClass(),
                ]
            ]
        ];
    }

    protected function menuList()
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => 'getMenuList',
                'description' => 'Ambil daftar menu aktif',
                'parameters' => [
                    'type' => 'object',
                    'properties' => new \stdClass(),
                ]
            ]
        ];
    }

    protected function recommendedMenu()
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => 'getRecommendedMenu',
                'description' => 'Rekomendasi menu berdasarkan histori user',
                'parameters' => [
                    'type' => 'object',
                    'properties' => new \stdClass(),
                ]
            ]
        ];
    }
}

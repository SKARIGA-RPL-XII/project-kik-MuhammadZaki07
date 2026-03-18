<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use LogsActivity;
    protected $fillable = ['group', 'key', 'value', 'type'];

    public static function get(string $key, $default = null)
    {
        return Cache::remember("setting_{$key}", 3600, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();
            if (!$setting) return $default;

            return self::castValue($setting->value, $setting->type);
        });
    }

    public static function set(string $key, $value, string $group = 'general', ?string $type = null): void
    {
        $resolvedType = $type ?? self::detectType($value);
        $resolvedValue = is_array($value) || is_object($value) ? json_encode($value) : $value;

        self::updateOrCreate(
            ['key' => $key],
            [
                'group' => $group,
                'value' => $resolvedValue,
                'type' => $resolvedType
            ]
        );

        Cache::forget("setting_{$key}");
    }

    protected static function castValue($value, string $type)
    {
        switch ($type) {
            case 'number':
            case 'integer':
                return (int) $value;
            case 'float':
            case 'double':
                return (float) $value;
            case 'boolean':
            case 'bool':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'json':
            case 'array':
                return json_decode($value, true);
            default:
                return $value;
        }
    }

    protected static function detectType($value): string
    {
        if (is_int($value)) return 'integer';
        if (is_float($value)) return 'float';
        if (is_bool($value)) return 'boolean';
        if (is_array($value) || is_object($value)) return 'json';
        return 'string';
    }
}

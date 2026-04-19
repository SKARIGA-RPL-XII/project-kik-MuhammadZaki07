<?php

namespace App\Traits;

use App\Services\LogService;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    protected static function bootLogsActivity()
    {
        static::created(function ($model) {
            LogService::write(
                class_basename($model),
                'Create',
                "Menambahkan data baru pada " . class_basename($model),
                null,
                $model->getAttributes()
            );
        });

        static::updated(function ($model) {
            LogService::write(
                class_basename($model),
                'Update',
                "Memperbarui data pada " . class_basename($model),
                $model->getOriginal() ? array_intersect_key(
                    $model->getOriginal(),
                    array_flip(['id', 'is_active', 'status'])
                ) : null,
                $model->getChanges()
            );
        });

        static::deleted(function ($model) {
            LogService::write(
                class_basename($model),
                'Delete',
                "Menghapus data dari " . class_basename($model),
                $model->getOriginal(),
                null
            );
        });
    }
}

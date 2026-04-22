<?php

namespace App\Services;

use App\Models\Unit;
use App\Models\Stock;
use App\Models\Menu;
use App\Models\AttributeLevel;
use Exception;
use Illuminate\Support\Facades\DB;

class StockService
{
    public function convertToBase(int $unitId, $amount)
    {
        $unit = Unit::findOrFail($unitId);
        return $unit->convertToBase($amount);
    }

    public function convertFromBase(int $unitId, $amountInBase)
    {
        $unit = Unit::findOrFail($unitId);
        return $unit->convertFromBase($amountInBase);
    }

    public function addStock(int $stockId, $amount, int $unitId)
    {
        $stock = Stock::findOrFail($stockId);
        $amountInBase = $this->convertToBase($unitId, $amount);

        $stock->increment('quantity', $amountInBase);

        return $stock;
    }

    public function reduceStock(int $stockId, $amount, int $unitId)
    {
        $stock = Stock::findOrFail($stockId);
        $amountInBase = $this->convertToBase($unitId, $amount);

        if ($stock->quantity < $amountInBase) {
            throw new Exception("Stok {$stock->name} tidak mencukupi.");
        }

        $stock->decrement('quantity', $amountInBase);

        return $stock;
    }

    public function reduceInventoryFromDetails(array $orderDetails)
    {
        $neededStocks = [];

        foreach ($orderDetails as $detail) {
            $menu = Menu::with(['stocks'])->findOrFail($detail['menu_id']);
            $qtyOrdered = $detail['qty'];

            foreach ($menu->stocks as $ingredient) {
                $stockId = $ingredient->id;
                $amountNeeded = $ingredient->pivot->amount * $qtyOrdered;
                $neededStocks[$stockId] = ($neededStocks[$stockId] ?? 0) + $amountNeeded;
            }

            if (!empty($detail['attributes'])) {
                foreach ($detail['attributes'] as $attrDetail) {
                    $level = AttributeLevel::with('stocks')->find($attrDetail['attribute_level_id']);

                    if ($level && $level->stocks->isNotEmpty()) {
                        foreach ($level->stocks as $extraStock) {
                            $stockId = $extraStock->id;
                            $multiplier = $extraStock->pivot->unit_id ?
                                          Unit::find($extraStock->pivot->unit_id)->multiplier : 1;

                            $amountNeeded = ($extraStock->pivot->amount * $multiplier) * $qtyOrdered;
                            $neededStocks[$stockId] = ($neededStocks[$stockId] ?? 0) + $amountNeeded;
                        }
                    }
                }
            }
        }

        return DB::transaction(function () use ($neededStocks) {
            foreach ($neededStocks as $id => $totalAmount) {
                $stock = Stock::lockForUpdate()->find($id);

                if ($stock->quantity < $totalAmount) {
                    throw new Exception("Stok {$stock->name} tidak mencukupi untuk pesanan ini.");
                }

                $stock->decrement('quantity', $totalAmount);
            }
        });
    }

    public function formatForDisplay(int $stockId)
    {
        $stock = Stock::with('unit')->findOrFail($stockId);
        $currentQuantity = $stock->quantity;

        $bestUnit = Unit::where('category', $stock->unit->category)
            ->where('multiplier', '<=', $currentQuantity)
            ->orderBy('multiplier', 'desc')
            ->first();

        if (!$bestUnit) {
            $bestUnit = Unit::where('category', $stock->unit->category)
                ->orderBy('multiplier', 'asc')
                ->first();
        }

        $converted = $currentQuantity / $bestUnit->multiplier;

        return [
            'value' => round($converted, 2),
            'unit' => $bestUnit->abbreviation,
            'full_text' => round($converted, 2) . ' ' . $bestUnit->abbreviation
        ];
    }
}

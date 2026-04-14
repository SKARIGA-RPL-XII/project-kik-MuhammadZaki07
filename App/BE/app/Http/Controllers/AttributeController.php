<?php

namespace App\Http\Controllers;

use App\Models\Attribute;
use Illuminate\Http\Request;

class AttributeController extends Controller
{
    public function index()
    {
        $attributes = Attribute::with('levels')->get();
        return response()->json(['data' => $attributes]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'levels' => 'array',
            'levels.*.name' => 'string|max:255'
        ]);

        $attribute = Attribute::create(['name' => $request->name]);

        if ($request->levels) {
            foreach ($request->levels as $lvl) {
                $attribute->levels()->create(['name' => $lvl['name']]);
            }
        }

        return response()->json(['data' => $attribute->load('levels')], 201);
    }

    public function show(Attribute $attribute)
    {
        return response()->json(['data' => $attribute->load('levels')]);
    }

    public function update(Request $request, Attribute $attribute)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'levels' => 'array',
            'levels.*.id' => 'sometimes|exists:attribute_levels,id',
            'levels.*.name' => 'required|string|max:255'
        ]);

        if ($request->filled('name')) {
            $attribute->update(['name' => $request->name]);
        }

        if ($request->has('levels')) {
            $incomingIds = collect($request->levels)->pluck('id')->filter()->toArray();

            $attribute->levels()->whereNotIn('id', $incomingIds)->delete();

            foreach ($request->levels as $lvl) {
                if (isset($lvl['id'])) {
                    $attribute->levels()->where('id', $lvl['id'])->update(['name' => $lvl['name']]);
                } else {
                    $attribute->levels()->create(['name' => $lvl['name']]);
                }
            }
        }

        return response()->json(['data' => $attribute->load('levels')]);
    }

    public function destroy(Attribute $attribute)
    {
        $attribute->delete();
        return response()->json(['data' => null]);
    }
}

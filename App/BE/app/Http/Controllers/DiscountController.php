<?php

namespace App\Http\Controllers;

use App\Models\ApplyDiscount;
use App\Models\Discount;
use Illuminate\Http\Request;

class DiscountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Discount::query();

        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        if ($request->has('status') && in_array($request->status, ['active', 'inactive'])) {
            $query->where('is_active', $request->status === 'active' ? 1 : 0);
        }

        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('start_date', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('end_date', '<=', $request->end_date);
        }

        $data = $query->get();

        return Controller::OKE('success', 'success get data', $data, 200);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            "title" => "required|unique:discounts,title",
            "description" => "required|string",
            "is_active" => "boolean",
            "value_discount" => "integer|required|min:1",
            "start_date" => "date",
            "end_date" => "date",
        ]);

        $data = Discount::create($request->all());
        return Controller::OKE('success', 'success create data', $data, 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Discount $discount)
    {
        return Controller::OKE('success', 'success get data', $discount, 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Discount $discount)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Discount $discount)
    {
        $request->validate([
            "title" => "required|unique:discounts,title," . $discount->id,
            "description" => "required|string",
            "value_discount" => "integer|required|min:1",
            "start_date" => "date",
            "end_date" => "date",
            "is_active" => "boolean"
        ]);

        $discount->update($request->all());

        return Controller::OKE('success', 'success update data', $discount, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Discount $discount)
    {
        $discount->delete();
        return Controller::OKE('success', 'succes delete', [], 200);
    }

    public function applyDiscount(Request $request)
    {
        $request->validate([
            "user_id" => "required|exists:users,id",
            "menu_id" => "required|exists:menus,id",
            "discount_id" => "required|exists:discounts,id",
        ]);

        $exists = ApplyDiscount::where('user_id', $request->user()->id)
            ->where('discount_id', $request->discount_id)
            ->exists();

        if ($exists) {
            return Controller::ERROR(
                'already_claimed',
                'You have already used this discount',
                409
            );
        }

        ApplyDiscount::create([
            "user_id" => $request->user()->id,
            "discount_id" => $request->discount_id,
            "menu_id" => $request->menu_id
        ]);

        return Controller::OKE('success', 'success apply discount', [], 200);
    }
}

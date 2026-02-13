<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BadgeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Badge::query();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if (!is_null($request->status)) {
            $query->where('is_active', $request->status === 'active');
        }

        $data = $query->latest()->get();

        return response()->json([
            'message' => 'Success get badges',
            'data' => $data
        ]);
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
            'name' => 'required|string|max:255',
            'color' => 'required|string',
            'badge_image' => 'nullable|mimes:png,jpg,gif,jpeg|max:2048',
            'is_active' => 'required|boolean',
        ]);

        $imagePath = null;

        if ($request->hasFile('badge_image')) {
            $imagePath = $request->file('badge_image')
                ->store('badges', 'public');
        }

        $badge = Badge::create([
            'name' => $request->name,
            'icon' => $request->icon,
            'color' => $request->color,
            'badge_image' => $imagePath,
            'is_active' => $request->is_active,
        ]);

        return response()->json([
            'message' => 'Badge created',
            'data' => $badge
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $badge = Badge::findOrFail($id);

        return response()->json([
            'message' => 'Success get badge',
            'data' => $badge
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Badge $badge)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $badge = Badge::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string',
            'badge_image' => 'nullable|mimes:png,jpg,gif,jpeg|max:2048',
            'is_active' => 'required|boolean',
        ]);

        if ($request->hasFile('badge_image')) {

            if ($badge->badge_image) {
                Storage::disk('public')->delete($badge->badge_image);
            }

            $badge->badge_image = $request->file('badge_image')
                ->store('badges', 'public');
        }

        $badge->update([
            'name' => $request->name,
            'icon' => $request->icon,
            'color' => $request->color,
            'is_active' => $request->is_active,
        ]);

        return response()->json([
            'message' => 'Badge updated',
            'data' => $badge
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $badge = Badge::findOrFail($id);

        if ($badge->badge_image) {
            Storage::disk('public')->delete($badge->badge_image);
        }

        $badge->delete();

        return response()->json([
            'message' => 'Badge deleted'
        ]);
    }
}

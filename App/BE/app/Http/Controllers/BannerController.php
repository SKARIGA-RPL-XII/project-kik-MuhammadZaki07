<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class BannerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = Banner::where("is_active", true)->get();
        return Controller::OKE('success', 'success get data', $data, 200);
    }

    public function getBannerAdmin()
    {
        $data = Banner::all();
        return Controller::OKE('success', 'success get data banners', $data, 200);
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
        try {
            Log::info('🚀 Banner STORE HIT', [
                'has_file' => $request->hasFile('banner_image'),
                'request' => $request->except(['banner_image']),
            ]);

            // normalize boolean
            $isActive = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);

            // validation
            $validated = $request->validate([
                "banner_image" => "required|image|mimes:png,jpg,jpeg,webp|max:5120", // 5MB
                "title" => "required|string|max:255",
                "description" => "required|string|max:200",
            ]);

            Log::info('✅ Validation OK');

            if (!$request->hasFile('banner_image')) {
                Log::warning('❌ No file uploaded');
                return response()->json([
                    'message' => 'banner_image is required'
                ], 422);
            }

            $file = $request->file('banner_image');

            Log::info('📁 File received', [
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
            ]);

            // folder storage
            $folder = 'banners';
            $filename = 'banner-' . Str::uuid() . '.webp';

            $path = storage_path("app/public/{$folder}/{$filename}");

            // pastikan folder ada
            if (!Storage::disk('public')->exists($folder)) {
                Storage::disk('public')->makeDirectory($folder);
            }

            // convert + compress image
            $image = Image::read($file)
                ->resize(1000, null, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                })
                ->encodeByExtension('webp', 85);

            $image->save($path);

            Log::info('🖼 Image saved', [
                'path' => $path
            ]);

            // save DB path
            $validated['banner_image'] = "{$folder}/{$filename}";
            $validated['is_active'] = $isActive;

            $banner = Banner::create($validated);

            Log::info('🎉 Banner CREATED', [
                'id' => $banner->id
            ]);

            return response()->json([
                'message' => 'success',
                'data' => $banner
            ], 201);
        } catch (\Throwable $e) {

            Log::error('💥 BANNER STORE ERROR', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'message' => 'Server error',
            ], 500);
        }
    }

    public function update(Request $request, Banner $banner)
    {
        $request->merge([
            'is_active' => filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN)
        ]);

        $request->validate([
            "banner_image" => "sometimes|file|mimes:png,jpg,jpeg,webp|max:2040",
            "title" => "sometimes|string",
            "description" => "sometimes|string|max:200",
            "is_active" => "boolean"
        ]);

        $data = $request->only(['title', 'description', 'is_active']);

        if ($request->hasFile('banner_image')) {
            if ($banner->banner_image) {
                Storage::disk('public')->delete($banner->banner_image);
            }

            $file = $request->file('banner_image');
            $filename = 'banner-' . uniqid() . '.webp';
            $directory = 'banners/';
            $fullPath = storage_path('app/public/' . $directory . $filename);

            Image::read($file)
                ->scale(1000)
                ->encodeByExtension('webp', 90)
                ->save($fullPath);

            $data['banner_image'] = $directory . $filename;
        }

        $banner->update($data);

        return Controller::OKE('success', 'success update data', $banner, 200);
    }


    /**
     * Display the specified resource.
     */
    public function show(Banner $banner)
    {
        return Controller::OKE('success', 'success get data', $banner, 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Banner $banner)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Banner $banner)
    {
        Storage::disk('public')->delete($banner->banner_image);
        $banner->delete();
        return Controller::OKE('success', 'sucess delete', [], 200);
    }
}

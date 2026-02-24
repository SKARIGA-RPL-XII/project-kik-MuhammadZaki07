<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;
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
        $request->merge([
            'is_active' => filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN)
        ]);

        $validate = $request->validate([
            "banner_image" => "required|mimes:png,jpg,jpeg,webp|max:2040",
            "title" => "required|string",
            "description" => "required|max:200|string",
            "is_active" => "boolean"
        ]);

        $file = $request->file('banner_image');
        $filename = 'banner-' . uniqid() . '.webp';
        $directory = 'banners/';
        $fullPath = storage_path('app/public/' . $directory . $filename);

        if (!file_exists(storage_path('app/public/' . $directory))) {
            mkdir(storage_path('app/public/' . $directory), 0755, true);
        }

        Image::read($file)
            ->scale(1000)
            ->encodeByExtension('webp', 90)
            ->save($fullPath);

        $validate['banner_image'] = $directory . $filename;

        Banner::create($validate);

        return Controller::OKE('success', 'success create data', [], 201);
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

<?php

namespace App\Http\Controllers;

abstract class Controller
{
    public static function OKE($status = "success", $message = "", $data = [], $code = 200)
    {
        if ($status) {
            $res['status'] = $status;
        }

        if ($message) {
            $res['message'] = $message;
        }

        if ($data) {
            $res['data'] = $data;
        }
        return response()->json($res, $code);
    }

    public static function ERROR($status = "error", $message = "", $code = 500)
    {
        return response()->json([
            "status" => $status,
            "message" => $message
        ], $code);
    }
}

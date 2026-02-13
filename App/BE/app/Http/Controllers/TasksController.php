<?php

namespace App\Http\Controllers;

use App\Models\Tasks;
use Illuminate\Http\Request;

class TasksController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = Tasks::all();
        return Controller::OKE('success' , 'succes get data' , $data , 200);
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
            "task_name" => "string|required",
            "description" =>"required|string",
            "start_date" => "date",
            "end_date" => "date"
        ]);

        $task = Tasks::create([
            "task_name" => $request->task_name,
            "description" => $request->description,
            "start_date" => $request->start_date,
            "end_date" => $request->end_date,
            "task_from" => $request->user()->role->name
        ]);

        return Controller::OKE('success' , 'succes create data' , $task, 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tasks $tasks)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tasks $tasks)
    {

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tasks $tasks)
    {
        $request->validate([
            "task_name" => "required|string",
            "description" =>"required|string",
            "start_date" => "date",
            "end_date" => "date"
        ]);

        $tasks->create([
            "task_name" => $request->task_name,
            "description" => $request->description,
            "start_date" => $request->start_date,
            "end_date" => $request->end_date,
            "task_from" => $request->user()->role->name
        ]);

        return Controller::OKE('success' , 'succes update data' , $tasks, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tasks $tasks)
    {
        $tasks->delete();
        return Controller::OKE('success' , 'succes delete data' , [], 200);
    }
}

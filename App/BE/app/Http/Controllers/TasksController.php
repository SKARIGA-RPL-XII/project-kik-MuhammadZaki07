<?php

namespace App\Http\Controllers;

use App\Models\Tasks;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TasksController extends Controller
{
    public function index()
    {
        $data = Tasks::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Controller::OKE('success', 'Success get data', $data, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            "title"       => "required|string",
            "description" => "nullable|string",
            "priority"    => "in:low,medium,high",
            "start_date"  => "nullable|date",
            "end_date"    => "nullable|date"
        ]);

        $task = Tasks::create([
            "user_id"     => Auth::id(),
            "title"       => $request->title,
            "description" => $request->description,
            "priority"    => $request->priority ?? 'medium',
            "status"      => 'pending',
            "start_date"  => $request->start_date,
            "end_date"    => $request->end_date,
        ]);

        return Controller::OKE('success', 'Success create data', $task, 200);
    }

    public function update(Request $request, Tasks $task)
    {
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            "title"       => "string",
            "description" => "nullable|string",
            "priority"    => "in:low,medium,high",
            "status"      => "in:pending,completed",
            "start_date"  => "nullable|date",
            "end_date"    => "nullable|date"
        ]);

        $task->update($request->only([
            'title', 'description', 'priority', 'status', 'start_date', 'end_date'
        ]));

        return Controller::OKE('success', 'Success update data', $task, 200);
    }

    public function destroy(Tasks $task)
    {
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task->delete();
        return Controller::OKE('success', 'Success delete data', [], 200);
    }

    public function toggleStatus(Tasks $task)
    {
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task->update([
            'status' => $task->status === 'pending' ? 'completed' : 'pending'
        ]);

        return Controller::OKE('success', 'Status updated', $task, 200);
    }
}

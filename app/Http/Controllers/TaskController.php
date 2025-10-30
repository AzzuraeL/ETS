<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index()
    {
        // return tasks for current user
        $tasks = Task::where('user_id', auth()->id())->orWhereNull('user_id')->orderByDesc('created_at')->get();
        return Inertia::render('dashboard', [
            'tasks' => $tasks,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $data['user_id'] = auth()->id();
        Task::create($data);

        return redirect()->route('dashboard');
    }

    public function update(Request $request, Task $task)
    {
        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'completed' => ['nullable', 'boolean'],
        ]);

        // simple ownership check
        if ($task->user_id && $task->user_id !== auth()->id()) {
            abort(403);
        }

        $task->update($data);

        return redirect()->route('dashboard');
    }

    public function destroy(Task $task)
    {
        if ($task->user_id && $task->user_id !== auth()->id()) {
            abort(403);
        }

        $task->delete();

        return redirect()->route('dashboard');
    }
}

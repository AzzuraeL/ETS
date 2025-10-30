import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AppLayout from "@/layouts/app-layout";
import type { BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Check, Edit, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { dashboard } from "@/routes";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: dashboard().url },
];

type Task = {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
};



export default function Dashboard({ tasks: serverTasks }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(serverTasks ?? []);
  useEffect(() => {
    setTasks(serverTasks ?? []);
  }, [serverTasks]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const resetForm = () => {
    setNewTitle("");
    setNewDescription("");
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    router.post('/tasks', { title: newTitle.trim(), description: newDescription.trim() }, {
      onSuccess: () => {
        resetForm();
        setIsAddOpen(false);
      }
    });
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setNewTitle(task.title);
    setNewDescription(task.description || "");
    setIsEditOpen(true);
  };

  const saveEdit = () => {
    if (!editingTask) return;
    router.put(`/tasks/${editingTask.id}`, { title: newTitle.trim(), description: newDescription.trim() }, {
      onSuccess: () => {
        setEditingTask(null);
        resetForm();
        setIsEditOpen(false);
      }
    });
  };

  const cancelEdit = () => {
    setEditingTask(null);
    resetForm();
    setIsEditOpen(false);
  };

  const toggleComplete = (id: number) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    router.put(`/tasks/${id}`, { completed: !t.completed }, {
      onSuccess: () => {},
    });
  };

  const deleteTask = (id: number) => {
    if (!confirm('Delete this task?')) return;
    router.delete(`/tasks/${id}`, {
      onSuccess: () => {},
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Task Manager" />
      <div className="px-6 md:px-10 lg:px-16 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold tracking-tight">Task Manager</h1>
          <div className="flex items-center gap-3">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="flex gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full border rounded px-3 py-2"
                  />
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full border rounded px-3 py-2"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addTask}>Create</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <Card key={task.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleComplete(task.id)} className="mt-1">
                    {task.completed ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 border rounded-sm" />
                    )}
                  </button>
                  <div>
                    <CardTitle className={`text-lg font-semibold ${task.completed ? "line-through text-gray-500" : ""}`}>
                      {task.title}
                    </CardTitle>
                    {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(task)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteTask(task.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  Status: {task.completed ? "Completed" : "Pending"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title"
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full border rounded px-3 py-2"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button onClick={saveEdit}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

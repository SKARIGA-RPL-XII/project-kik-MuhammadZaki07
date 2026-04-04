import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { useTasks } from "@/hooks/react-query/useTasks";

export default function AdminTaskCard() {
  const { useGetTasks, useToggleTask, useCreateTask } = useTasks();
  const { toast } = useToast();

  const { data: tasks, isLoading } = useGetTasks();
  const toggleMutation = useToggleTask();
  const createMutation = useCreateTask();

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  const handleToggle = (id: number, title: string) => {
    toggleMutation.mutate(id, {
      onSuccess: (updatedTask) => {
        const statusText =
          updatedTask.status === "completed" ? "Selesai" : "Pending";
        toast(
          "success",
          "Tugas Diperbarui",
          `"${title}" sekarang ${statusText}`,
        );
      },
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setIsAdding(false);
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        toast("success", "Berhasil", "Tugas baru ditambahkan");
        setFormData({ title: "", description: "", priority: "medium" });
        setIsAdding(false);
      },
      onError: () => {
        toast("error", "Gagal", "Gagal menyimpan tugas");
      },
    });
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white/90">
            Admin To-Do List
          </h3>
          <p className="mt-1 text-neutral-500 text-theme-sm dark:text-neutral-400">
            Manage daily operational tasks
          </p>
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
              />
            ))}
          </div>
        ) : tasks?.length === 0 ? (
          <div className="text-center py-6 text-neutral-500 text-sm italic">
            No tasks for today.
          </div>
        ) : (
          tasks?.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id, item.title)}
              className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.status === "completed"}
                  onChange={() => {}}
                  className="w-5 h-5 rounded border-neutral-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-medium ${item.status === "completed" ? "line-through text-neutral-400" : "text-neutral-700 dark:text-neutral-300"}`}
                  >
                    {item.title}
                  </span>
                  {item.description && (
                    <span className="text-[11px] text-neutral-500 line-clamp-1">
                      {item.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    item.priority === "high"
                      ? "bg-red-100 text-red-600"
                      : item.priority === "low"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.priority}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        {isAdding ? (
          <form
            onSubmit={handleCreate}
            className="p-4 border border-red-500/50 rounded-xl bg-white dark:bg-neutral-900 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <input
              autoFocus
              type="text"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full font-semibold text-sm outline-none bg-transparent dark:text-white mb-2"
            />

            <textarea
              placeholder="Add a brief description..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full text-xs text-neutral-500 outline-none bg-transparent resize-none mb-3"
              rows={2}
            />

            <div className="flex items-center justify-between border-t pt-3 dark:border-neutral-800">
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 rounded px-2 py-1 outline-none dark:text-neutral-400 uppercase"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2.5 px-4 border border-dashed rounded-md text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 hover:border-red-400 dark:border-neutral-700 dark:hover:bg-white/5 transition-all"
          >
            + Add New Task
          </button>
        )}
      </div>
    </div>
  );
}

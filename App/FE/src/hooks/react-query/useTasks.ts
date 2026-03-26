import tasksService from "@/services/tasks.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useTasks = () => {
  const queryClient = useQueryClient();

  const useGetTasks = () => {
    return useQuery({
      queryKey: ["tasks"],
      queryFn: tasksService.getTasks,
    });
  };

  const useToggleTask = () => {
    return useMutation({
      mutationFn: (id: number) => tasksService.toggleTaskStatus(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
    });
  };

  const useDeleteTask = () => {
    return useMutation({
      mutationFn: (id: number) => tasksService.deleteTask(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
    });
  };

  const useCreateTask = () => {
    return useMutation({
      mutationFn: (data: any) => tasksService.createTask(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
    });
  };

  return {
    useGetTasks,
    useToggleTask,
    useDeleteTask,
    useCreateTask,
  };
};
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { createTask, fetchTasks, removeTask, updateTask, type TaskScope } from "../api/tasks";
import type { TaskItem } from "../api/contracts";
import { Button } from "../components/button";
import { Screen } from "../components/screen";
import { TextField } from "../components/text-field";
import { clearSession } from "../stores/session-store";

const scopes: TaskScope[] = ["all", "mine", "today", "overdue"];

export function TasksScreen() {
  const [scope, setScope] = useState<TaskScope>("all");
  const [title, setTitle] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const queryKey = useMemo(() => ["tasks", scope] as const, [scope]);

  const tasksQuery = useQuery({
    queryKey,
    queryFn: () => fetchTasks(scope),
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TaskItem[]>(queryKey) ?? [];
      const optimistic: TaskItem = {
        id: `optimistic-${Date.now()}`,
        title: payload.title,
        description: payload.description ?? null,
        priority: "MEDIUM",
        dueDate: null,
        completed: false,
        completedAt: null,
        isPrivate: false,
        labels: [],
        assigneeId: null,
        creatorId: "me",
        columnId: "temp",
        boardId: "temp",
        boardName: "Inbox",
        columnName: "Todo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<TaskItem[]>(queryKey, [optimistic, ...previous]);
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: () => {
      setTitle("");
      setSheetOpen(false);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTask(id, { completed }),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TaskItem[]>(queryKey) ?? [];
      queryClient.setQueryData<TaskItem[]>(
        queryKey,
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                completed,
                completedAt: completed ? new Date().toISOString() : null,
              }
            : item
        )
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: removeTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TaskItem[]>(queryKey) ?? [];
      queryClient.setQueryData<TaskItem[]>(
        queryKey,
        previous.filter((item) => item.id !== taskId)
      );
      return { previous };
    },
    onError: (_error, _taskId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const isSyncing =
    tasksQuery.isFetching ||
    createMutation.isPending ||
    completeMutation.isPending ||
    deleteMutation.isPending;

  return (
    <Screen>
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-xs text-muted">{isSyncing ? "Syncing..." : "Synced"}</p>
        </div>
        <Button
          variant="ghost"
          onClick={async () => {
            await clearSession();
            await navigate({ to: "/login" });
          }}
        >
          Logout
        </Button>
      </header>

      <div className="mb-4 grid grid-cols-4 gap-2">
        {scopes.map((item) => (
          <Button key={item} variant={scope === item ? "primary" : "ghost"} onClick={() => setScope(item)}>
            {item}
          </Button>
        ))}
      </div>

      <div className="mb-4 flex justify-end">
        <Button onClick={() => setSheetOpen(true)}>New Task</Button>
      </div>

      {tasksQuery.isLoading ? <p className="text-sm text-muted">Loading...</p> : null}
      {tasksQuery.isError ? <p className="text-sm text-danger">Failed to load tasks</p> : null}
      {tasksQuery.data?.length === 0 ? <p className="text-sm text-muted">No tasks yet</p> : null}

      <div className="space-y-2">
        {tasksQuery.data?.map((task) => (
          <motion.article
            key={task.id}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -110) {
                deleteMutation.mutate(task.id);
                return;
              }
              if (info.offset.x > 110) {
                completeMutation.mutate({ id: task.id, completed: !task.completed });
              }
            }}
            className="rounded-xl bg-card p-3 shadow-card"
          >
            <Link to="/tasks/$taskId" params={{ taskId: task.id }} className="text-base font-medium text-text">
              {task.title}
            </Link>
            <p className="mt-1 text-xs text-muted">{task.boardName}</p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="ghost"
                onClick={() => completeMutation.mutate({ id: task.id, completed: !task.completed })}
              >
                {task.completed ? "Undo" : "Complete"}
              </Button>
              <Button variant="destructive" onClick={() => deleteMutation.mutate(task.id)}>
                Delete
              </Button>
            </div>
          </motion.article>
        ))}
      </div>
      {sheetOpen ? (
        <div className="fixed inset-0 z-20 bg-black/40" onClick={() => setSheetOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 mx-auto max-w-md rounded-t-2xl bg-surface p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="mb-3 text-lg font-semibold">Create task</h2>
            <TextField value={title} onChange={setTitle} placeholder="Task title" />
            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => createMutation.mutate({ title })}
                disabled={createMutation.isPending || title.trim().length === 0}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
              <Button variant="ghost" onClick={() => setSheetOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Screen>
  );
}

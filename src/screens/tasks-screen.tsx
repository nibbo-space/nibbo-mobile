import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { createTask, fetchTasks, removeTask, updateTask, type TaskScope } from "../api/tasks";
import type { TaskItem } from "../api/contracts";
import { Button } from "../components/button";
import { Icon } from "../components/icon";
import { EmptyState } from "../components/tasks/empty-state";
import { SkeletonCard } from "../components/tasks/skeleton-card";
import { TaskCard } from "../components/tasks/task-card";
import { Screen } from "../components/screen";
import { TextField } from "../components/text-field";
import { i18n } from "../lib/i18n";

const scopeLabels: Record<TaskScope, string> = {
  all: i18n.tasks.scopeAll,
  mine: i18n.tasks.scopeMine,
  today: i18n.tasks.scopeToday,
  overdue: i18n.tasks.scopeOverdue,
};

const scopes: TaskScope[] = ["all", "mine", "today", "overdue"];

export function TasksScreen() {
  const [scope, setScope] = useState<TaskScope>("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const queryClient = useQueryClient();
  const location = useLocation();
  const queryKey = useMemo(() => ["tasks", scope] as const, [scope]);

  useEffect(() => {
    if (location.hash === "new") {
      setSheetOpen(true);
    }
  }, [location.hash]);

  const tasksQuery = useQuery({
    queryKey,
    queryFn: () => fetchTasks(scope),
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });
  const taskMetaQuery = useQuery({
    queryKey: ["tasks", "meta"],
    queryFn: () => fetchTasks("all", { includeCompleted: true }),
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
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
        priority: payload.priority ?? "MEDIUM",
        dueDate: payload.dueDate ?? null,
        completed: false,
        completedAt: null,
        isPrivate: payload.isPrivate ?? false,
        labels: payload.labels ?? [],
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
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
      setIsPrivate(false);
      setSelectedBoardId("");
      setSelectedColumnId("");
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

  const tasks = tasksQuery.data ?? [];
  const totalCount = tasks.length;
  const boardOptions = useMemo(() => {
    const source = taskMetaQuery.data ?? [];
    const map = new Map<string, { id: string; name: string }>();
    source.forEach((task) => {
      if (!map.has(task.boardId)) map.set(task.boardId, { id: task.boardId, name: task.boardName });
    });
    return Array.from(map.values());
  }, [taskMetaQuery.data]);
  const columnOptions = useMemo(() => {
    const source = taskMetaQuery.data ?? [];
    const map = new Map<string, { id: string; name: string; boardId: string }>();
    source.forEach((task) => {
      if (!map.has(task.columnId)) {
        map.set(task.columnId, { id: task.columnId, name: task.columnName, boardId: task.boardId });
      }
    });
    return Array.from(map.values());
  }, [taskMetaQuery.data]);
  const filteredColumns = selectedBoardId
    ? columnOptions.filter((column) => column.boardId === selectedBoardId)
    : columnOptions;

  useEffect(() => {
    if (!sheetOpen) return;
    if (!selectedBoardId && boardOptions.length > 0) {
      setSelectedBoardId(boardOptions[0].id);
    }
  }, [sheetOpen, selectedBoardId, boardOptions]);

  useEffect(() => {
    if (!sheetOpen) return;
    if (selectedBoardId) {
      const next = columnOptions.find((column) => column.boardId === selectedBoardId);
      if (next && next.id !== selectedColumnId) setSelectedColumnId(next.id);
      if (!next) setSelectedColumnId("");
      return;
    }
    if (!selectedColumnId && columnOptions.length > 0) {
      setSelectedColumnId(columnOptions[0].id);
    }
  }, [sheetOpen, selectedBoardId, selectedColumnId, columnOptions]);

  return (
    <Screen>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{i18n.tasks.managerTitle}</h1>
          <p className="mt-1 text-xs text-muted">{i18n.tasks.managerSubtitle}</p>
        </div>
      </header>

      <div className="mt-5 -mx-5 flex gap-2 overflow-x-auto px-5 scrollbar-hide">
        {scopes.map((item) => {
          const active = scope === item;
          return (
            <button
              key={item}
              onClick={() => setScope(item)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                active
                  ? "bg-ink text-white shadow-cozy"
                  : "bg-white text-text/70 hover:bg-cream-100"
              }`}
            >
              {scopeLabels[item]}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h2 className="text-lg font-bold tracking-tight">{i18n.tasks.scheduleTitle}</h2>
        <span className="text-xs text-muted">{i18n.tasks.tasksCount(totalCount)}</span>
      </div>

      <div className="mt-3 space-y-3 pb-36">
        {tasksQuery.isLoading ? (
          <SkeletonCard />
        ) : tasksQuery.isError ? (
          <EmptyState
            emoji="🥺"
            title={i18n.tasks.loadErrorTitle}
            subtitle={i18n.tasks.loadErrorSubtitle}
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            emoji="🌷"
            title={i18n.tasks.emptyTitle}
            subtitle={i18n.tasks.emptySubtitle}
          />
        ) : (
          <AnimatePresence initial={false}>
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onComplete={() =>
                  completeMutation.mutate({ id: task.id, completed: !task.completed })
                }
                onDelete={() => deleteMutation.mutate(task.id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {sheetOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute bottom-0 left-0 right-0 mx-auto max-w-md rounded-t-4xl bg-white p-6 shadow-cozy-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
              <h2 className="text-xl font-bold tracking-tight">{i18n.tasks.newTaskSheetTitle}</h2>
              <p className="mt-1 text-xs text-muted">{i18n.tasks.newTaskSheetSubtitle}</p>
              <div className="mt-4">
                <TextField
                  value={title}
                  onChange={setTitle}
                  placeholder={i18n.tasks.newTaskPlaceholder}
                  autoFocus
                />
              </div>
              <div className="mt-3">
                <TextField
                  value={description}
                  onChange={setDescription}
                  placeholder="Опис (необов'язково)"
                  multiline
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Дошка
                  </span>
                  <select
                    value={selectedBoardId}
                    onChange={(event) => {
                      setSelectedBoardId(event.target.value);
                      setSelectedColumnId("");
                    }}
                    disabled={boardOptions.length === 0}
                    className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-3 text-sm text-text outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100 disabled:opacity-60"
                  >
                    {boardOptions.length === 0 ? <option value="">Немає дошок</option> : null}
                    {boardOptions.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Категорія
                  </span>
                  <select
                    value={selectedColumnId}
                    onChange={(event) => setSelectedColumnId(event.target.value)}
                    disabled={filteredColumns.length === 0}
                    className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-3 text-sm text-text outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100 disabled:opacity-60"
                  >
                    {filteredColumns.length === 0 ? <option value="">Немає категорій</option> : null}
                    {filteredColumns.map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Пріоритет
                  </span>
                  <select
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as "LOW" | "MEDIUM" | "HIGH" | "URGENT")
                    }
                    className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-3 text-sm text-text outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Дедлайн
                  </span>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-3 text-sm text-text outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  />
                </label>
              </div>
              <label className="mt-3 flex items-center gap-2 rounded-2xl border border-border bg-cream-50 px-3 py-3 text-sm text-text">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(event) => setIsPrivate(event.target.checked)}
                  className="h-4 w-4 accent-rose-500"
                />
                Приватна задача
              </label>
              <div className="mt-5 flex gap-3">
                <Button variant="ghost" fullWidth onClick={() => setSheetOpen(false)}>
                  {i18n.tasks.cancel}
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() =>
                    createMutation.mutate({
                      title: title.trim(),
                      description: description.trim() ? description.trim() : null,
                      priority,
                      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                      isPrivate,
                    })
                  }
                  disabled={createMutation.isPending || title.trim().length === 0}
                >
                  {createMutation.isPending ? i18n.tasks.creating : i18n.tasks.create}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white shadow-pop transition-transform active:scale-95"
        aria-label={i18n.tasks.newTask}
      >
        <Icon name="plus" size={20} />
      </button>
    </Screen>
  );
}

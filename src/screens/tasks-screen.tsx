import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { createBoard, createColumn, createTask, fetchBoards, fetchTasks, removeTask, updateTask, type TaskScope } from "../api/tasks";
import type { TaskItem } from "../api/contracts";
import { Button } from "../components/button";
import { Icon } from "../components/icon";
import { EmptyState } from "../components/tasks/empty-state";
import { SkeletonCard } from "../components/tasks/skeleton-card";
import { TaskCard } from "../components/tasks/task-card";
import { Screen } from "../components/screen";
import { TextField } from "../components/text-field";
import { i18n } from "../lib/i18n";

const scopes: TaskScope[] = ["all", "mine", "today", "overdue"];

export function TasksScreen() {
  const scopeLabels: Record<TaskScope, string> = {
    all: i18n.tasks.scopeAll,
    mine: i18n.tasks.scopeMine,
    today: i18n.tasks.scopeToday,
    overdue: i18n.tasks.scopeOverdue,
  };
  const [scope, setScope] = useState<TaskScope>("all");
  const [filterBoardId, setFilterBoardId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  // board/column management sheet
  const [manageOpen, setManageOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newColumnBoardId, setNewColumnBoardId] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
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
  const boardsQuery = useQuery({
    queryKey: ["tasks", "boards"],
    queryFn: fetchBoards,
    staleTime: 60_000,
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
            ? { ...item, completed, completedAt: completed ? new Date().toISOString() : null }
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
      queryClient.setQueryData<TaskItem[]>(queryKey, previous.filter((item) => item.id !== taskId));
      return { previous };
    },
    onError: (_error, _taskId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const createBoardMutation = useMutation({
    mutationFn: ({ name }: { name: string }) => createBoard(name),
    onSuccess: () => {
      setNewBoardName("");
      void queryClient.invalidateQueries({ queryKey: ["tasks", "boards"] });
    },
  });

  const createColumnMutation = useMutation({
    mutationFn: ({ boardId, name }: { boardId: string; name: string }) => createColumn(boardId, name),
    onSuccess: () => {
      setNewColumnName("");
      void queryClient.invalidateQueries({ queryKey: ["tasks", "boards"] });
    },
  });

  const tasks = tasksQuery.data ?? [];
  const boards = boardsQuery.data ?? [];
  const boardOptions = boards.map((b) => ({ id: b.id, name: b.name }));
  const filteredColumns = useMemo(() => {
    if (!selectedBoardId) return boards.flatMap((b) => b.columns.map((c) => ({ ...c, boardId: b.id })));
    return (boards.find((b) => b.id === selectedBoardId)?.columns ?? []).map((c) => ({ ...c, boardId: selectedBoardId }));
  }, [boards, selectedBoardId]);

  const filteredTasks = useMemo(
    () => (filterBoardId ? tasks.filter((t) => t.boardId === filterBoardId) : tasks),
    [tasks, filterBoardId]
  );
  const totalCount = filteredTasks.length;

  useEffect(() => {
    if (!sheetOpen) return;
    if (!selectedBoardId && boards.length > 0) {
      setSelectedBoardId(boards[0].id);
    }
  }, [sheetOpen, selectedBoardId, boards]);

  useEffect(() => {
    if (!sheetOpen) return;
    if (selectedBoardId) {
      const board = boards.find((b) => b.id === selectedBoardId);
      const firstCol = board?.columns[0];
      if (firstCol && firstCol.id !== selectedColumnId) setSelectedColumnId(firstCol.id);
      if (!firstCol) setSelectedColumnId("");
      return;
    }
    if (!selectedColumnId && filteredColumns.length > 0) {
      setSelectedColumnId(filteredColumns[0].id);
    }
  }, [sheetOpen, selectedBoardId, selectedColumnId, boards, filteredColumns]);

  useEffect(() => {
    if (manageOpen && !newColumnBoardId && boards.length > 0) {
      setNewColumnBoardId(boards[0].id);
    }
  }, [manageOpen, newColumnBoardId, boards]);

  return (
    <Screen>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{i18n.tasks.managerTitle}</h1>
          <p className="mt-1 text-xs text-muted">{i18n.tasks.managerSubtitle}</p>
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 transition-transform active:scale-95"
          aria-label={i18n.tasks.newTask}
        >
          <Icon name="plus" size={20} />
        </button>
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

      <div className="mt-3 -mx-5 flex items-center gap-2 overflow-x-auto px-5 scrollbar-hide">
        <button
          onClick={() => setFilterBoardId(null)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
            filterBoardId === null
              ? "bg-violet-500 text-white"
              : "bg-white text-ink/60 shadow-cozy"
          }`}
        >
          {i18n.tasks.allBoards}
        </button>
        {boards.map((b) => (
          <button
            key={b.id}
            onClick={() => setFilterBoardId(filterBoardId === b.id ? null : b.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              filterBoardId === b.id
                ? "bg-violet-500 text-white"
                : "bg-white text-ink/60 shadow-cozy"
            }`}
          >
            {b.emoji ?? "📋"} {b.name}
          </button>
        ))}
        <button
          onClick={() => setManageOpen(true)}
          className="ml-1 flex shrink-0 h-7 w-7 items-center justify-center rounded-full bg-white text-ink/40 shadow-cozy active:scale-95"
          aria-label={i18n.tasks.manageBoardsAria}
        >
          <Icon name="settings" size={13} />
        </button>
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
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            emoji="🌷"
            title={i18n.tasks.emptyTitle}
            subtitle={i18n.tasks.emptySubtitle}
          />
        ) : (
          <AnimatePresence initial={false}>
            {filteredTasks.map((task, index) => (
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
                  placeholder={i18n.tasks.descriptionPlaceholder}
                  multiline
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {i18n.tasks.boardLabel}
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
                    {boardOptions.length === 0 ? <option value="">{i18n.tasks.noBoardsOption}</option> : null}
                    {boardOptions.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {i18n.tasks.columnLabel}
                  </span>
                  <select
                    value={selectedColumnId}
                    onChange={(event) => setSelectedColumnId(event.target.value)}
                    disabled={filteredColumns.length === 0}
                    className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-3 text-sm text-text outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100 disabled:opacity-60"
                  >
                    {filteredColumns.length === 0 ? <option value="">{i18n.tasks.noColumnsOption}</option> : null}
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
                    {i18n.tasks.priorityLabel}
                  </span>
                  <select
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as "LOW" | "MEDIUM" | "HIGH" | "URGENT")
                    }
                    className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-3 text-sm text-text outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  >
                    <option value="LOW">{i18n.tasks.priorityLow}</option>
                    <option value="MEDIUM">{i18n.tasks.priorityMedium}</option>
                    <option value="HIGH">{i18n.tasks.priorityHigh}</option>
                    <option value="URGENT">{i18n.tasks.priorityUrgent}</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {i18n.tasks.deadlineLabel}
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
                {i18n.tasks.privateTask}
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
                      columnId: selectedColumnId || null,
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

        {manageOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setManageOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-md overflow-y-auto rounded-t-[32px] bg-white px-5 pb-10 pt-5 shadow-pop"
              style={{ maxHeight: "85vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-ink">{i18n.tasks.boardsManageTitle}</h2>
                <button
                  onClick={() => setManageOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100 text-ink/60"
                >
                  <Icon name="x" size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-cream-50 p-4">
                  <p className="mb-2 text-xs font-semibold text-ink/60 uppercase tracking-wide">{i18n.tasks.newBoardSection}</p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <TextField
                        value={newBoardName}
                        onChange={setNewBoardName}
                        placeholder={i18n.tasks.newBoardPlaceholder}
                      />
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => newBoardName.trim() && createBoardMutation.mutate({ name: newBoardName.trim() })}
                      disabled={createBoardMutation.isPending || !newBoardName.trim()}
                      className="h-12 px-4 rounded-xl"
                    >
                      <Icon name="plus" size={16} />
                    </Button>
                  </div>
                </div>

                {boards.length > 0 ? (
                  <div className="rounded-2xl bg-cream-50 p-4">
                    <p className="mb-2 text-xs font-semibold text-ink/60 uppercase tracking-wide">{i18n.tasks.newColumnSection}</p>
                    <div className="mb-2">
                      <select
                        value={newColumnBoardId}
                        onChange={(e) => setNewColumnBoardId(e.target.value)}
                        className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-text outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                      >
                        {boards.map((b) => (
                          <option key={b.id} value={b.id}>{b.emoji ?? "📋"} {b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <TextField
                          value={newColumnName}
                          onChange={setNewColumnName}
                          placeholder={i18n.tasks.newColumnPlaceholder}
                        />
                      </div>
                      <Button
                        variant="primary"
                        onClick={() =>
                          newColumnName.trim() && newColumnBoardId &&
                          createColumnMutation.mutate({ boardId: newColumnBoardId, name: newColumnName.trim() })
                        }
                        disabled={createColumnMutation.isPending || !newColumnName.trim() || !newColumnBoardId}
                        className="h-12 px-4 rounded-xl"
                      >
                        <Icon name="plus" size={16} />
                      </Button>
                    </div>
                  </div>
                ) : null}

                {boards.map((board) => (
                  <div key={board.id} className="rounded-2xl border border-border bg-white p-4">
                    <p className="text-sm font-semibold text-ink">{board.emoji ?? "📋"} {board.name}</p>
                    {board.columns.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {board.columns.map((col) => (
                          <span
                            key={col.id}
                            className="rounded-full bg-cream-100 px-2.5 py-1 text-xs font-medium text-ink/70"
                          >
                            {col.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-muted">{i18n.tasks.noCategoriesInBoard}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

    </Screen>
  );
}

import { z } from "zod";
import { apiRequest } from "./client";
import { taskBoardSchema, taskBoardsResponseSchema, taskColumnSchema, taskListSchema, taskSchema, type TaskBoard, type TaskColumn, type TaskItem } from "./contracts";

export type TaskScope = "all" | "mine" | "today" | "overdue";

export async function fetchTasks(
  scope: TaskScope,
  options?: { includeCompleted?: boolean },
) {
  const params = new URLSearchParams({ scope });
  if (options?.includeCompleted) params.set("includeCompleted", "1");
  const response = await apiRequest(`/api/mobile/v1/tasks?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to load tasks");
  const data = taskListSchema.parse(await response.json());
  return data.items;
}

const createPayloadSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  columnId: z.string().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  isPrivate: z.boolean().optional(),
  labels: z.array(z.string()).optional(),
});

export async function createTask(payload: z.infer<typeof createPayloadSchema>) {
  const input = createPayloadSchema.parse(payload);
  const response = await apiRequest("/api/mobile/v1/tasks", {
    method: "POST",
    body: input,
  });
  if (!response.ok) throw new Error("Failed to create task");
  return taskSchema.parse(await response.json());
}

export async function updateTask(taskId: string, patch: Partial<TaskItem>) {
  const response = await apiRequest(`/api/mobile/v1/tasks/${taskId}`, {
    method: "PATCH",
    body: patch,
  });
  if (!response.ok) throw new Error("Failed to update task");
  return taskSchema.parse(await response.json());
}

export async function fetchBoards(): Promise<TaskBoard[]> {
  const response = await apiRequest("/api/mobile/v1/tasks/boards");
  if (!response.ok) throw new Error("Failed to load boards");
  const data = taskBoardsResponseSchema.parse(await response.json());
  return data.boards;
}

export async function createBoard(name: string, emoji?: string): Promise<TaskBoard> {
  const response = await apiRequest("/api/mobile/v1/tasks/boards", {
    method: "POST",
    body: { name, emoji: emoji ?? "📋" },
  });
  if (!response.ok) throw new Error("Failed to create board");
  return taskBoardSchema.parse(await response.json());
}

export async function createColumn(boardId: string, name: string, emoji?: string): Promise<TaskColumn> {
  const response = await apiRequest(`/api/mobile/v1/tasks/boards/${boardId}/columns`, {
    method: "POST",
    body: { name, emoji: emoji ?? "📋" },
  });
  if (!response.ok) throw new Error("Failed to create column");
  return taskColumnSchema.parse(await response.json());
}

export async function removeTask(taskId: string) {
  const response = await apiRequest(`/api/mobile/v1/tasks/${taskId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete task");
}

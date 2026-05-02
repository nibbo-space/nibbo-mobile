import { budgetResponseSchema, expenseCategorySchema, expenseSchema, type Expense, type ExpenseCategory } from "./contracts";
import { apiRequest } from "./client";

export async function fetchBudget(params?: { from?: string; to?: string }): Promise<{ expenses: Expense[]; categories: ExpenseCategory[] }> {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  const qs = query.toString();
  const response = await apiRequest(`/api/mobile/v1/budget${qs ? `?${qs}` : ""}`);
  if (!response.ok) throw new Error("Failed to load budget");
  return budgetResponseSchema.parse(await response.json());
}

export async function createExpense(data: {
  title: string;
  amount: number;
  date?: string;
  note?: string;
  categoryId?: string;
}): Promise<Expense> {
  const response = await apiRequest("/api/mobile/v1/budget", {
    method: "POST",
    body: data,
  });
  if (!response.ok) throw new Error("Failed to create expense");
  return expenseSchema.parse(await response.json());
}

export async function updateExpense(id: string, data: Partial<{ title: string; amount: number; note: string; date: string; categoryId: string | null }>): Promise<Expense> {
  const response = await apiRequest(`/api/mobile/v1/budget/${id}`, {
    method: "PATCH",
    body: data,
  });
  if (!response.ok) throw new Error("Failed to update expense");
  return expenseSchema.parse(await response.json());
}

export async function deleteExpense(id: string): Promise<void> {
  const response = await apiRequest(`/api/mobile/v1/budget/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete expense");
}

export async function createExpenseCategory(name: string, emoji?: string, color?: string): Promise<ExpenseCategory> {
  const response = await apiRequest("/api/mobile/v1/budget/categories", {
    method: "POST",
    body: { name, emoji: emoji ?? "💰", color: color ?? "#4ade80" },
  });
  if (!response.ok) throw new Error("Failed to create expense category");
  return expenseCategorySchema.parse(await response.json());
}

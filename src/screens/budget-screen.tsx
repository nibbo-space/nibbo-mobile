import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { createExpense, createExpenseCategory, deleteExpense, fetchBudget } from "../api/budget";
import type { Expense } from "../api/contracts";
import { Button } from "../components/button";
import { Icon } from "../components/icon";
import { Screen } from "../components/screen";
import { TextField } from "../components/text-field";
import { getCalendarLocale, i18n } from "../lib/i18n";

function getCurrentMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  return { from, to };
}

export function BudgetScreen() {
  const queryClient = useQueryClient();
  const { from, to } = getCurrentMonthRange();
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("💰");
  const [newCatColor, setNewCatColor] = useState("#4ade80");

  const budgetQuery = useQuery({
    queryKey: ["budget", from, to],
    queryFn: () => fetchBudget({ from, to }),
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["budget"] });
      closeForm();
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: ({ name, emoji, color }: { name: string; emoji: string; color: string }) =>
      createExpenseCategory(name, emoji, color),
    onSuccess: () => {
      setShowCategoryForm(false);
      setNewCatName("");
      setNewCatEmoji("💰");
      void queryClient.invalidateQueries({ queryKey: ["budget"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      setDeleteConfirmId(null);
      void queryClient.invalidateQueries({ queryKey: ["budget"] });
    },
  });

  const openCreate = () => {
    setFormTitle("");
    setFormAmount("");
    setFormNote("");
    setFormCategoryId(null);
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleSave = () => {
    const amount = parseFloat(formAmount.replace(",", "."));
    if (!formTitle.trim() || isNaN(amount) || amount <= 0) return;
    createMutation.mutate({
      title: formTitle,
      amount,
      note: formNote || undefined,
      categoryId: formCategoryId ?? undefined,
    });
  };

  const expenses = budgetQuery.data?.expenses ?? [];
  const categories = budgetQuery.data?.categories ?? [];
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const expensesByCategory: Record<string, { name: string; emoji: string; color: string; total: number }> = {};
  for (const exp of expenses) {
    const key = exp.category?.id ?? "none";
    if (!expensesByCategory[key]) {
      expensesByCategory[key] = {
        name: exp.category?.name ?? i18n.budget.noCategory,
        emoji: exp.category?.emoji ?? "💰",
        color: exp.category?.color ?? "#9ca3af",
        total: 0,
      };
    }
    expensesByCategory[key].total += exp.amount;
  }

  const now = new Date();
  const monthName = now.toLocaleDateString(getCalendarLocale(), { month: "long", year: "numeric" });

  return (
    <Screen>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{i18n.budget.title}</h1>
          <p className="mt-1 text-xs text-muted">{i18n.budget.subtitle}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition-transform active:scale-95"
          aria-label={i18n.budget.newExpense}
        >
          <Icon name="plus" size={20} />
        </button>
      </header>

      <div className="mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-5 text-white shadow-pop">
        <p className="text-xs font-semibold text-white/70">{i18n.budget.totalSpent}</p>
        <p className="mt-1 text-[36px] font-bold tracking-tight">
          {totalSpent.toFixed(2)} <span className="text-lg font-normal text-white/70">₴</span>
        </p>
        <p className="mt-1 text-xs text-white/60">{monthName}</p>
      </div>

      {Object.keys(expensesByCategory).length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-3xl bg-white p-4 shadow-cozy">
          <p className="mb-3 text-xs font-semibold text-ink/60">{i18n.budget.byCategory}</p>
          <div className="space-y-2">
            {Object.values(expensesByCategory).map((cat) => {
              const pct = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0;
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.emoji}</span>
                      <span className="text-sm font-medium text-ink">{cat.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-ink">{cat.total.toFixed(2)} ₴</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cream-100">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        {budgetQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-cream-100" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">💰</span>
            <p className="text-base font-semibold text-ink">{i18n.budget.emptyTitle}</p>
            <p className="max-w-[260px] text-sm text-muted">{i18n.budget.emptySubtitle}</p>
            <Button variant="soft" onClick={openCreate} className="mt-2">
              {i18n.budget.addExpense}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((exp) => (
              <ExpenseCard key={exp.id} expense={exp} onDelete={() => setDeleteConfirmId(exp.id)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeForm()}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-md overflow-y-auto rounded-t-[32px] bg-white px-5 pb-10 pt-5 shadow-pop"
              style={{ maxHeight: "85vh" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-ink">{i18n.budget.newExpense}</h2>
                <button onClick={closeForm} className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100 text-ink/60">
                  <Icon name="x" size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <TextField
                  value={formTitle}
                  onChange={setFormTitle}
                  placeholder={i18n.budget.expenseTitlePlaceholder}
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <TextField
                      value={formAmount}
                      onChange={setFormAmount}
                      placeholder={i18n.budget.amountPlaceholder}
                    />
                  </div>
                  <span className="text-lg font-semibold text-ink/50">₴</span>
                </div>

                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-xs font-semibold text-ink/70">{i18n.budget.category}</label>
                      <button
                        onClick={() => setShowCategoryForm(true)}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-600"
                      >
                        <Icon name="plus" size={12} /> {i18n.budget.newCategoryShort}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setFormCategoryId(null)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${formCategoryId === null ? "bg-emerald-500 text-white" : "bg-cream-100 text-ink/70"}`}
                      >
                        {i18n.budget.noCategory}
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setFormCategoryId(cat.id)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${formCategoryId === cat.id ? "text-white" : "bg-cream-100 text-ink/70"}`}
                          style={formCategoryId === cat.id ? { backgroundColor: cat.color } : undefined}
                        >
                          {cat.emoji} {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                <TextField value={formNote} onChange={setFormNote} placeholder={i18n.budget.notePlaceholder} />
              </div>

              <Button
                variant="dark"
                fullWidth
                onClick={handleSave}
                disabled={createMutation.isPending || !formTitle.trim() || !formAmount}
                className="mt-4 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600"
              >
                {createMutation.isPending ? i18n.budget.saving : i18n.budget.save}
              </Button>
            </motion.div>
          </motion.div>
        ) : null}

        {showCategoryForm ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm px-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-pop"
            >
              <p className="text-base font-bold text-ink mb-4">{i18n.budget.newCategorySheetTitle}</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {["💰", "🛒", "🍕", "🚗", "💊", "🏠", "✈️", "🎮", "👗", "📚"].map((e) => (
                  <button
                    key={e}
                    onClick={() => setNewCatEmoji(e)}
                    className={`rounded-xl px-2 py-1 text-xl ${newCatEmoji === e ? "bg-emerald-100 ring-2 ring-emerald-400" : "bg-cream-50"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="mb-3 flex gap-2">
                {["#4ade80", "#f87171", "#60a5fa", "#fbbf24", "#a78bfa", "#fb923c", "#34d399"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewCatColor(c)}
                    className={`h-7 w-7 rounded-full transition-all ${newCatColor === c ? "ring-2 ring-offset-1 ring-emerald-500 scale-110" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <TextField
                value={newCatName}
                onChange={setNewCatName}
                placeholder={i18n.notes.categoryNamePlaceholder}
                autoFocus
              />
              <div className="mt-4 flex gap-2">
                <Button variant="ghost" fullWidth onClick={() => setShowCategoryForm(false)}>
                  {i18n.common.cancel}
                </Button>
                <Button
                  variant="dark"
                  fullWidth
                  onClick={() =>
                    newCatName.trim() &&
                    createCategoryMutation.mutate({ name: newCatName.trim(), emoji: newCatEmoji, color: newCatColor })
                  }
                  disabled={createCategoryMutation.isPending || !newCatName.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {i18n.common.create}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}

        {deleteConfirmId ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-pop"
            >
              <p className="text-center text-base font-semibold text-ink">{i18n.budget.deleteExpenseTitle}</p>
              <div className="mt-5 flex gap-2">
                <Button variant="ghost" fullWidth onClick={() => setDeleteConfirmId(null)}>
                  {i18n.budget.cancel}
                </Button>
                <Button
                  variant="destructive"
                  fullWidth
                  onClick={() => deleteMutation.mutate(deleteConfirmId)}
                  disabled={deleteMutation.isPending}
                >
                  {i18n.budget.delete}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Screen>
  );
}

function ExpenseCard({ expense, onDelete }: { expense: Expense; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-2xl bg-white p-4 shadow-cozy">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl"
        style={{ backgroundColor: (expense.category?.color ?? "#e5e7eb") + "33" }}
      >
        {expense.category?.emoji ?? "💰"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{expense.title}</p>
        <div className="mt-0.5 flex items-center gap-2">
          {expense.category ? (
            <span className="text-[10px] font-medium text-muted">{expense.category.name}</span>
          ) : null}
          <span className="text-[10px] text-muted">
            {new Date(expense.date).toLocaleDateString("uk-UA")}
          </span>
        </div>
      </div>
      <p className="shrink-0 text-sm font-bold text-ink">-{expense.amount.toFixed(2)} ₴</p>
      <button
        onClick={onDelete}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-400 active:scale-95"
      >
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

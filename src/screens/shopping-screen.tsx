import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { createShoppingItem, fetchShoppingLists, updateShoppingItem } from "../api/shopping";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../components/icon";
import { Screen } from "../components/screen";

export function ShoppingScreen() {
  const queryClient = useQueryClient();
  const listsQuery = useQuery({
    queryKey: ["shopping-lists"],
    queryFn: fetchShoppingLists,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });
  const lists = listsQuery.data ?? [];
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemListId, setNewItemListId] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const createItemMutation = useMutation({
    mutationFn: createShoppingItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
  });
  const normalizedLists = useMemo(() => lists, [lists]);
  const totalItems = normalizedLists.reduce((acc, list) => acc + list.items.length, 0);
  const uncheckedItems = normalizedLists.reduce(
    (acc, list) => acc + list.items.filter((item) => !item.checked).length,
    0,
  );
  const selectedList = useMemo(() => {
    if (normalizedLists.length === 0) return null;
    if (!selectedListId) return normalizedLists[0];
    return normalizedLists.find((list) => list.id === selectedListId) ?? normalizedLists[0];
  }, [normalizedLists, selectedListId]);
  useEffect(() => {
    if (!sheetOpen || newItemListId || normalizedLists.length === 0) return;
    setNewItemListId(normalizedLists[0].id);
  }, [sheetOpen, newItemListId, normalizedLists]);

  const addItemToList = async (listId: string, rawName: string) => {
    const name = rawName.trim();
    if (!name) return;
    await createItemMutation.mutateAsync({ listId, name, quantity: "1" });
  };
  const toggleItemMutation = useMutation({
    mutationFn: ({ itemId, checked }: { itemId: string; checked: boolean }) =>
      updateShoppingItem(itemId, { checked }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
  });

  return (
    <Screen>
      <header>
        <h1 className="text-xl font-bold tracking-tight">Покупки</h1>
        <p className="mt-1 text-xs text-muted">Спільні списки покупок для сім'ї</p>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white p-4 shadow-cozy">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Списків</p>
          <p className="mt-1 text-3xl font-bold text-ink">{lists.length}</p>
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-cozy">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">До покупки</p>
          <p className="mt-1 text-3xl font-bold text-peach-500">{uncheckedItems}</p>
        </div>
      </section>

      <section className="mt-4 space-y-3">
        {listsQuery.isLoading ? (
          <div className="rounded-3xl bg-white p-4 text-sm text-muted shadow-cozy">Завантаження…</div>
        ) : null}
        {listsQuery.isError ? (
          <div className="rounded-3xl bg-white p-4 text-sm text-rose-500 shadow-cozy">
            Не вдалося завантажити списки покупок
          </div>
        ) : null}
        {!listsQuery.isLoading && !listsQuery.isError && lists.length === 0 ? (
          <div className="rounded-3xl bg-white p-4 text-sm text-muted shadow-cozy">
            Поки що немає списків покупок
          </div>
        ) : null}
        {!listsQuery.isLoading && !listsQuery.isError && normalizedLists.length > 0 ? (
          <div className="columns-2 gap-3 [column-fill:_balance]">
            {normalizedLists.map((list, index) => {
              const isActive = selectedList?.id === list.id;
              const pendingCount = list.items.filter((item) => !item.checked).length;
              return (
                <article
                  key={list.id}
                  className={`mb-3 break-inside-avoid rounded-3xl p-4 shadow-cozy ${
                    isActive
                      ? "border-2 border-rose-300 bg-rose-50 text-ink shadow-pop"
                      : "border border-transparent bg-white text-ink"
                  } ${tileSizeClass(index)}`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedListId(list.id)}
                    className="w-full text-left"
                  >
                    <div className="text-2xl">{resolveCategoryEmoji(list.name, list.emoji)}</div>
                    <p className="mt-2 truncate text-sm font-semibold">{list.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {pendingCount} до покупки
                    </p>
                    <p className="mt-2 text-[11px] text-muted">
                      {list.items.length === 0
                        ? "Порожньо"
                        : `Позицій: ${list.items.length}`}
                    </p>
                  </button>
                </article>
              );
            })}
          </div>
        ) : null}
        {selectedList ? (
          <article className="rounded-3xl bg-white p-4 shadow-cozy">
            <div className="flex items-center justify-between gap-2">
              <h2 className="truncate text-sm font-semibold text-ink">
                <span className="mr-2">
                  {resolveCategoryEmoji(selectedList.name, selectedList.emoji)}
                </span>
                {selectedList.name}
              </h2>
              <span className="text-[10px] font-semibold text-muted">
                {selectedList.items.length}
              </span>
            </div>
            {selectedList.items.length === 0 ? (
              <p className="mt-3 text-xs text-muted">У цій категорії поки немає позицій</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {selectedList.items.map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${
                      item.checked ? "bg-sage-50" : "bg-cream-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleItemMutation.mutate({
                          itemId: item.id,
                          checked: !(item.checked ?? false),
                        })
                      }
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                        item.checked
                          ? "border-sage-500 bg-sage-500 text-white"
                          : "border-border bg-white text-transparent"
                      }`}
                      aria-label={item.checked ? "Позначити як некуплене" : "Позначити як куплене"}
                    >
                      ✓
                    </button>
                    <span
                      className={`min-w-0 flex-1 text-sm font-medium ${
                        item.checked ? "text-muted line-through" : "text-ink"
                      }`}
                    >
                      {item.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        toggleItemMutation.mutate({
                          itemId: item.id,
                          checked: !(item.checked ?? false),
                        })
                      }
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-semibold ${
                        item.checked
                          ? "bg-white text-sage-700"
                          : "bg-ink text-white"
                      }`}
                    >
                      {item.checked ? "Повернути" : "Куплено"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ) : null}
      </section>

      <p className="mt-4 text-center text-[11px] text-muted">Всього позицій: {totalItems}</p>
      <button
        type="button"
        onClick={() => {
          setSheetOpen(true);
          if (!newItemListId && selectedList) setNewItemListId(selectedList.id);
        }}
        className="fixed bottom-24 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white shadow-pop transition-transform active:scale-95"
        aria-label="Додати продукт"
      >
        <Icon name="plus" size={20} />
      </button>
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
              <h2 className="text-xl font-bold tracking-tight">Новий продукт</h2>
              <p className="mt-1 text-xs text-muted">Оберіть категорію і назву</p>
              <div className="mt-4">
                <label className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Категорія
                  </span>
                  <select
                    value={newItemListId}
                    onChange={(event) => setNewItemListId(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-3 text-sm text-text outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  >
                    {normalizedLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {resolveCategoryEmoji(list.name, list.emoji)} {list.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-3">
                <input
                  value={newItemName}
                  onChange={(event) => setNewItemName(event.target.value)}
                  placeholder="Назва продукту"
                  className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-3 text-sm text-ink outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                />
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="h-11 w-full rounded-2xl bg-cream-50 text-sm font-semibold text-ink"
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetListId = newItemListId || selectedList?.id || "";
                    if (!targetListId) return;
                    void addItemToList(targetListId, newItemName);
                    setNewItemName("");
                    setSheetOpen(false);
                  }}
                  className="h-11 w-full rounded-2xl bg-ink text-sm font-semibold text-white disabled:opacity-60"
                  disabled={
                    createItemMutation.isPending ||
                    !newItemName.trim() ||
                    (!newItemListId && !selectedList?.id)
                  }
                >
                  {createItemMutation.isPending ? "Додаємо…" : "Додати"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Screen>
  );
}

function tileSizeClass(index: number): string {
  if (index % 5 === 0) return "min-h-[210px]";
  if (index % 2 === 0) return "min-h-[160px]";
  return "min-h-[130px]";
}

function resolveCategoryEmoji(name: string, providedEmoji?: string | null): string {
  if (providedEmoji && providedEmoji.trim()) return providedEmoji;
  const normalized = name.toLowerCase();
  if (normalized.includes("молоч") || normalized.includes("dairy")) return "🥛";
  if (normalized.includes("м'яс") || normalized.includes("мяс") || normalized.includes("meat")) {
    return "🥩";
  }
  if (normalized.includes("овоч") || normalized.includes("fruit") || normalized.includes("фрукт")) {
    return "🥦";
  }
  if (normalized.includes("пекар") || normalized.includes("bread") || normalized.includes("хліб")) {
    return "🥖";
  }
  if (normalized.includes("побут") || normalized.includes("clean") || normalized.includes("дім")) {
    return "🧴";
  }
  return "🛒";
}

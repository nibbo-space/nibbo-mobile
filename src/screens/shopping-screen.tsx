import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { createShoppingItem, createShoppingList, fetchShoppingLists, updateShoppingItem } from "../api/shopping";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../components/icon";
import { Screen } from "../components/screen";
import { i18n } from "../lib/i18n";

const LIST_EMOJIS = ["🛒", "🥛", "🥩", "🥦", "🥖", "🧴", "💊", "🏠", "🎁", "🍕"];

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
  // new list form
  const [listFormOpen, setListFormOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListEmoji, setNewListEmoji] = useState("🛒");

  const createItemMutation = useMutation({
    mutationFn: createShoppingItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
  });

  const createListMutation = useMutation({
    mutationFn: ({ name, emoji }: { name: string; emoji: string }) =>
      createShoppingList(name, emoji),
    onSuccess: async () => {
      setListFormOpen(false);
      setNewListName("");
      setNewListEmoji("🛒");
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
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{i18n.shopping.title}</h1>
          <p className="mt-1 text-xs text-muted">{i18n.shopping.subtitle}</p>
        </div>
        <button
          onClick={() => setListFormOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 transition-transform active:scale-95"
          aria-label={i18n.shopping.newListAria}
        >
          <Icon name="plus" size={20} />
        </button>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white p-4 shadow-cozy">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{i18n.shopping.listsLabel}</p>
          <p className="mt-1 text-3xl font-bold text-ink">{lists.length}</p>
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-cozy">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{i18n.shopping.toBuyLabel}</p>
          <p className="mt-1 text-3xl font-bold text-peach-500">{uncheckedItems}</p>
        </div>
      </section>

      <section className="mt-4 space-y-3">
        {listsQuery.isLoading ? (
          <div className="rounded-3xl bg-white p-4 text-sm text-muted shadow-cozy">{i18n.common.loading}</div>
        ) : null}
        {listsQuery.isError ? (
          <div className="rounded-3xl bg-white p-4 text-sm text-rose-500 shadow-cozy">
            {i18n.shopping.loadError}
          </div>
        ) : null}
        {!listsQuery.isLoading && !listsQuery.isError && lists.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🛒</span>
            <p className="text-base font-semibold text-ink">{i18n.shopping.emptyTitle}</p>
            <p className="max-w-[240px] text-sm text-muted">{i18n.shopping.emptySubtitle}</p>
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
                    <p className="mt-1 text-xs text-muted">{i18n.shopping.pendingLine(pendingCount)}</p>
                    <p className="mt-2 text-[11px] text-muted">
                      {i18n.shopping.itemsLine(list.items.length)}
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
                <span className="mr-2">{resolveCategoryEmoji(selectedList.name, selectedList.emoji)}</span>
                {selectedList.name}
              </h2>
              <span className="text-[10px] font-semibold text-muted">{selectedList.items.length}</span>
            </div>
            {selectedList.items.length === 0 ? (
              <p className="mt-3 text-xs text-muted">{i18n.shopping.emptyList}</p>
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
                      onClick={() => toggleItemMutation.mutate({ itemId: item.id, checked: !(item.checked ?? false) })}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                        item.checked
                          ? "border-sage-500 bg-sage-500 text-white"
                          : "border-border bg-white text-transparent"
                      }`}
                      aria-label={i18n.shopping.toggleBoughtAria(!!item.checked)}
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
                      onClick={() => toggleItemMutation.mutate({ itemId: item.id, checked: !(item.checked ?? false) })}
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-semibold ${
                        item.checked ? "bg-white text-sage-700" : "bg-ink text-white"
                      }`}
                    >
                      {item.checked ? i18n.shopping.unbought : i18n.shopping.bought}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {/* Inline add-item row */}
            <form
              className="mt-3 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newItemName.trim()) return;
                void addItemToList(selectedList.id, newItemName);
                setNewItemName("");
              }}
            >
              <input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={i18n.shopping.addItemPlaceholder}
                className="h-10 min-w-0 flex-1 rounded-2xl border border-border bg-cream-50 px-3 text-sm text-ink outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
              />
              <button
                type="submit"
                disabled={createItemMutation.isPending || !newItemName.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 transition-transform active:scale-95 disabled:opacity-40"
                aria-label={i18n.shopping.addAria}
              >
                <Icon name="plus" size={18} />
              </button>
            </form>
          </article>
        ) : null}
      </section>

      <p className="mt-4 text-center text-[11px] text-muted">{i18n.shopping.totalItems(totalItems)}</p>

      <AnimatePresence>
        {listFormOpen ? (
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
              <p className="text-base font-bold text-ink mb-4">{i18n.shopping.newListTitle}</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {LIST_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setNewListEmoji(e)}
                    className={`rounded-xl px-2 py-1 text-xl ${newListEmoji === e ? "bg-rose-100 ring-2 ring-rose-300" : "bg-cream-50"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder={i18n.shopping.listNamePlaceholder}
                autoFocus
                className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-3 text-sm text-ink outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
              />
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setListFormOpen(false)}
                  className="h-11 flex-1 rounded-2xl bg-cream-50 text-sm font-semibold text-ink"
                >
                  {i18n.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    newListName.trim() &&
                    createListMutation.mutate({ name: newListName.trim(), emoji: newListEmoji })
                  }
                  disabled={createListMutation.isPending || !newListName.trim()}
                  className="h-11 flex-1 rounded-2xl bg-ink text-sm font-semibold text-white disabled:opacity-60"
                >
                  {createListMutation.isPending ? i18n.shopping.creatingList : i18n.shopping.createList}
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
  if (normalized.includes("м'яс") || normalized.includes("мяс") || normalized.includes("meat")) return "🥩";
  if (normalized.includes("овоч") || normalized.includes("fruit") || normalized.includes("фрукт")) return "🥦";
  if (normalized.includes("пекар") || normalized.includes("bread") || normalized.includes("хліб")) return "🥖";
  if (normalized.includes("побут") || normalized.includes("clean") || normalized.includes("дім")) return "🧴";
  return "🛒";
}

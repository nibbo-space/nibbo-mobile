import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { createNote, createNoteCategory, deleteNote, fetchNoteCategories, fetchNotes, updateNote } from "../api/notes";
import type { Note } from "../api/contracts";
import { Button } from "../components/button";
import { Icon } from "../components/icon";
import { Screen } from "../components/screen";
import { TextField } from "../components/text-field";
import { i18n } from "../lib/i18n";

const NOTE_COLORS = [
  "#faf3e0", "#fce7f3", "#ede9fe", "#dbeafe", "#d1fae5", "#fef3c7", "#fee2e2",
];
const NOTE_EMOJIS = ["📓", "📝", "💡", "✨", "🎯", "📌", "🌟", "💭", "🔖"];

type CategoryInfo = {
  id: string;
  name: string;
  emoji: string;
  count: number;
};

export function NotesScreen() {
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formEmoji, setFormEmoji] = useState("📓");
  const [formColor, setFormColor] = useState("#faf3e0");
  const [formCategoryId, setFormCategoryId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("📂");

  const notesQuery = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
    staleTime: 30_000,
  });

  const noteCategoriesQuery = useQuery({
    queryKey: ["note-categories"],
    queryFn: fetchNoteCategories,
    staleTime: 60_000,
  });

  const createCategoryMutation = useMutation({
    mutationFn: ({ name, emoji }: { name: string; emoji: string }) =>
      createNoteCategory(name, emoji),
    onSuccess: () => {
      setShowCategoryForm(false);
      setNewCategoryName("");
      setNewCategoryEmoji("📂");
      void queryClient.invalidateQueries({ queryKey: ["note-categories"] });
    },
  });

  const allNotes = notesQuery.data ?? [];

  const serverCategories = noteCategoriesQuery.data ?? [];

  const categories = useMemo<CategoryInfo[]>(() => {
    const map = new Map<string, CategoryInfo>();
    // seed from server categories (count=0 base)
    for (const sc of serverCategories) {
      map.set(sc.id, { id: sc.id, name: sc.name, emoji: sc.emoji, count: 0 });
    }
    // count notes per category
    for (const note of allNotes) {
      if (note.category) {
        const existing = map.get(note.category.id);
        if (existing) {
          existing.count++;
        } else {
          map.set(note.category.id, {
            id: note.category.id,
            name: note.category.name,
            emoji: note.category.emoji,
            count: 1,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [allNotes, serverCategories]);

  const uncategorizedCount = allNotes.filter((n) => !n.category).length;

  const filteredNotes = useMemo(() => {
    if (selectedCategoryId === null) return allNotes;
    if (selectedCategoryId === "__none__") return allNotes.filter((n) => !n.category);
    return allNotes.filter((n) => n.category?.id === selectedCategoryId);
  }, [allNotes, selectedCategoryId]);

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notes"] });
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateNote>[1] }) =>
      updateNote(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notes"] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      setDeleteConfirmId(null);
      void queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) =>
      updateNote(id, { pinned }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const openCreate = () => {
    setEditingNote(null);
    setFormTitle("");
    setFormContent("");
    setFormEmoji("📓");
    setFormColor("#faf3e0");
    setFormCategoryId(null);
    setShowForm(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormEmoji(note.emoji);
    setFormColor(note.color);
    setFormCategoryId(note.category?.id ?? null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;
    if (editingNote) {
      updateMutation.mutate({
        id: editingNote.id,
        data: { title: formTitle, content: formContent, emoji: formEmoji, color: formColor, categoryId: formCategoryId },
      });
    } else {
      createMutation.mutate({ title: formTitle, content: formContent, emoji: formEmoji, color: formColor, categoryId: formCategoryId });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const selectedCategoryName = selectedCategoryId === null
    ? null
    : selectedCategoryId === "__none__"
      ? i18n.notes.uncategorized
      : categories.find((c) => c.id === selectedCategoryId)?.name ?? null;

  return (
    <Screen>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{i18n.notes.title}</h1>
          <p className="mt-1 text-xs text-muted">{i18n.notes.subtitle}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 transition-transform active:scale-95"
          aria-label={i18n.notes.newNote}
        >
          <Icon name="plus" size={20} />
        </button>
      </header>

      <div className="mt-4 -mx-5 px-5">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <CategoryPill
            label={i18n.notes.filterAll}
            emoji="📚"
            count={allNotes.length}
            active={selectedCategoryId === null}
            onClick={() => setSelectedCategoryId(null)}
          />
          {categories.map((cat) => (
            <CategoryPill
              key={cat.id}
              label={cat.name}
              emoji={cat.emoji}
              count={cat.count}
              active={selectedCategoryId === cat.id}
              onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
            />
          ))}
          {uncategorizedCount > 0 ? (
            <CategoryPill
              label={i18n.notes.uncategorized}
              emoji="📄"
              count={uncategorizedCount}
              active={selectedCategoryId === "__none__"}
              onClick={() => setSelectedCategoryId(selectedCategoryId === "__none__" ? null : "__none__")}
            />
          ) : null}
          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex shrink-0 items-center gap-1 rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-rose-500 shadow-cozy active:scale-95"
          >
            <Icon name="plus" size={12} /> {i18n.notes.addCategory}
          </button>
        </div>
      </div>

      {notesQuery.isLoading ? (
        <div className="mt-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl bg-cream-100" />
          ))}
        </div>
      ) : allNotes.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <span className="text-5xl">📓</span>
          <p className="text-base font-semibold text-ink">{i18n.notes.emptyTitle}</p>
          <p className="max-w-[260px] text-sm text-muted">{i18n.notes.emptySubtitle}</p>
          <Button variant="soft" onClick={openCreate} className="mt-2">
            {i18n.notes.newNote}
          </Button>
        </div>
      ) : (
        <>

          {selectedCategoryName ? (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-ink/60">{selectedCategoryName}</p>
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="text-xs text-rose-400 font-medium"
              >
                {i18n.notes.showAll}
              </button>
            </div>
          ) : null}

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {filteredNotes.length === 0 ? (
              <div className="col-span-2 rounded-2xl bg-white p-6 text-center shadow-cozy">
                <p className="text-sm text-muted">{i18n.notes.emptyInCategory}</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <motion.button
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => openEdit(note)}
                  className="relative flex flex-col items-start rounded-3xl p-4 text-left shadow-cozy transition-transform active:scale-[0.97]"
                  style={{ backgroundColor: note.color }}
                >
                  {note.pinned ? (
                    <span className="absolute right-3 top-3 text-base">📌</span>
                  ) : null}
                  <span className="mb-2 text-2xl">{note.emoji}</span>
                  <p className="line-clamp-1 text-sm font-semibold text-ink">{note.title}</p>
                  {note.content ? (
                    <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-ink/70">{note.content}</p>
                  ) : null}
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    {note.category ? (
                      <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium text-ink/60">
                        {note.category.emoji} {note.category.name}
                      </span>
                    ) : null}
                    <span className="text-[10px] text-ink/40">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </>
      )}

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
              className="w-full max-w-md rounded-t-[32px] bg-white px-5 pb-10 pt-5 shadow-pop"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-ink">
                  {editingNote ? i18n.notes.edit : i18n.notes.newNote}
                </h2>
                <div className="flex gap-2">
                  {editingNote ? (
                    <button
                      onClick={() => setDeleteConfirmId(editingNote.id)}
                      className="flex h-9 items-center gap-1 rounded-xl bg-rose-50 px-3 text-xs font-semibold text-rose-500"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  ) : null}
                  {editingNote ? (
                    <button
                      onClick={() => togglePinMutation.mutate({ id: editingNote.id, pinned: !editingNote.pinned })}
                      className="flex h-9 items-center gap-1 rounded-xl bg-amber-50 px-3 text-xs font-semibold text-amber-500"
                    >
                      📌
                    </button>
                  ) : null}
                  <button
                    onClick={closeForm}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100 text-ink/60"
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {NOTE_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setFormEmoji(e)}
                    className={`rounded-xl px-2 py-1 text-xl transition-all ${formEmoji === e ? "bg-rose-100 ring-2 ring-rose-300" : "bg-cream-50"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <div className="mb-3 flex gap-1.5">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFormColor(c)}
                    className={`h-6 w-6 rounded-full transition-all ${formColor === c ? "ring-2 ring-offset-1 ring-rose-400 scale-110" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="space-y-2">
                <TextField
                  value={formTitle}
                  onChange={setFormTitle}
                  placeholder={i18n.notes.noteTitlePlaceholder}
                  autoFocus
                />
                <TextField
                  value={formContent}
                  onChange={setFormContent}
                  placeholder={i18n.notes.noteContentPlaceholder}
                  multiline
                />
              </div>

              {serverCategories.length > 0 ? (
                <div className="mt-3">
                  <p className="mb-1.5 text-xs font-semibold text-ink/60">{i18n.notes.categorySection}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setFormCategoryId(null)}
                      className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-all ${formCategoryId === null ? "bg-rose-500 text-white" : "bg-cream-100 text-ink/70"}`}
                    >
                      {i18n.notes.uncategorized}
                    </button>
                    {serverCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setFormCategoryId(cat.id)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-all ${formCategoryId === cat.id ? "bg-rose-500 text-white" : "bg-cream-100 text-ink/70"}`}
                      >
                        {cat.emoji} {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <Button
                variant="primary"
                fullWidth
                onClick={handleSave}
                disabled={isPending || !formTitle.trim()}
                className="mt-4 h-12 rounded-2xl"
              >
                {isPending ? i18n.notes.saving : i18n.notes.save}
              </Button>
            </motion.div>
          </motion.div>
        ) : null}

        {showCategoryForm ? (
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
              <p className="text-base font-bold text-ink mb-4">{i18n.notes.newCategoryTitle}</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {["📂", "📁", "🏷️", "🎨", "📚", "💼", "🌿", "🔮", "✏️"].map((e) => (
                  <button
                    key={e}
                    onClick={() => setNewCategoryEmoji(e)}
                    className={`rounded-xl px-2 py-1 text-xl ${newCategoryEmoji === e ? "bg-rose-100 ring-2 ring-rose-300" : "bg-cream-50"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <TextField
                value={newCategoryName}
                onChange={setNewCategoryName}
                placeholder={i18n.notes.categoryNamePlaceholder}
                autoFocus
              />
              <div className="mt-4 flex gap-2">
                <Button variant="ghost" fullWidth onClick={() => setShowCategoryForm(false)}>
                  {i18n.common.cancel}
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() =>
                    newCategoryName.trim() &&
                    createCategoryMutation.mutate({ name: newCategoryName.trim(), emoji: newCategoryEmoji })
                  }
                  disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
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
              <p className="text-center text-base font-semibold text-ink">{i18n.notes.deleteNoteTitle}</p>
              <p className="mt-1 text-center text-sm text-muted">{i18n.notes.deleteNoteSubtitle}</p>
              <div className="mt-5 flex gap-2">
                <Button variant="ghost" fullWidth onClick={() => setDeleteConfirmId(null)}>
                  {i18n.notes.cancel}
                </Button>
                <Button
                  variant="destructive"
                  fullWidth
                  onClick={() => deleteMutation.mutate(deleteConfirmId)}
                  disabled={deleteMutation.isPending}
                >
                  {i18n.notes.delete}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Screen>
  );
}

function CategoryPill({
  label,
  emoji,
  count,
  active,
  onClick,
}: {
  label: string;
  emoji: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
        active
          ? "bg-rose-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)]"
          : "bg-white text-ink/70 shadow-cozy hover:bg-rose-50"
      }`}
    >
      <span className="text-sm">{emoji}</span>
      <span>{label}</span>
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/25 text-white" : "bg-cream-100 text-ink/50"}`}>
        {count}
      </span>
    </button>
  );
}

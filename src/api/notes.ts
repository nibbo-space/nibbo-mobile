import { noteCategoriesListSchema, noteCategorySchema, notesListSchema, noteSchema, type Note, type NoteCategory } from "./contracts";
import { apiRequest } from "./client";

export async function fetchNotes(): Promise<Note[]> {
  const response = await apiRequest("/api/mobile/v1/notes");
  if (!response.ok) throw new Error("Failed to load notes");
  const data = notesListSchema.parse(await response.json());
  return data.items;
}

export async function createNote(data: { title: string; content: string; emoji?: string; color?: string; pinned?: boolean; categoryId?: string | null }): Promise<Note> {
  const response = await apiRequest("/api/mobile/v1/notes", {
    method: "POST",
    body: data,
  });
  if (!response.ok) throw new Error("Failed to create note");
  return noteSchema.parse(await response.json());
}

export async function updateNote(id: string, data: Partial<{ title: string; content: string; emoji: string; color: string; pinned: boolean; categoryId: string | null }>): Promise<Note> {
  const response = await apiRequest(`/api/mobile/v1/notes/${id}`, {
    method: "PATCH",
    body: data,
  });
  if (!response.ok) throw new Error("Failed to update note");
  return noteSchema.parse(await response.json());
}

export async function deleteNote(id: string): Promise<void> {
  const response = await apiRequest(`/api/mobile/v1/notes/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete note");
}

export async function fetchNoteCategories(): Promise<NoteCategory[]> {
  const response = await apiRequest("/api/mobile/v1/notes/categories");
  if (!response.ok) throw new Error("Failed to load note categories");
  const data = noteCategoriesListSchema.parse(await response.json());
  return data.items;
}

export async function createNoteCategory(name: string, emoji?: string, color?: string): Promise<NoteCategory> {
  const response = await apiRequest("/api/mobile/v1/notes/categories", {
    method: "POST",
    body: { name, emoji: emoji ?? "📂", color: color ?? "#f5f3ff" },
  });
  if (!response.ok) throw new Error("Failed to create note category");
  return noteCategorySchema.parse(await response.json());
}

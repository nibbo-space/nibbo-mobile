import { z } from "zod";
import { shoppingListsSchema } from "./contracts";
import { apiRequest } from "./client";

const shoppingListsResponseSchema = z.object({
  items: shoppingListsSchema,
});

export async function fetchShoppingLists() {
  const response = await apiRequest("/api/mobile/v1/shopping");
  if (!response.ok) throw new Error("Failed to load shopping lists");
  const data = shoppingListsResponseSchema.parse(await response.json());
  return data.items;
}

const createShoppingItemSchema = z.object({
  listId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.string().optional(),
});

export async function createShoppingItem(payload: z.infer<typeof createShoppingItemSchema>) {
  const input = createShoppingItemSchema.parse(payload);
  const response = await apiRequest("/api/mobile/v1/shopping", {
    method: "POST",
    body: input,
  });
  if (!response.ok) throw new Error("Failed to create shopping item");
}

const updateShoppingItemSchema = z.object({
  checked: z.boolean().optional(),
  name: z.string().optional(),
  quantity: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
  isPrivate: z.boolean().optional(),
});

export async function createShoppingList(name: string, emoji?: string): Promise<void> {
  const response = await apiRequest("/api/mobile/v1/shopping", {
    method: "POST",
    body: { type: "list", name, emoji: emoji ?? "🛒" },
  });
  if (!response.ok) throw new Error("Failed to create shopping list");
}

export async function updateShoppingItem(
  itemId: string,
  patch: z.infer<typeof updateShoppingItemSchema>,
) {
  const input = updateShoppingItemSchema.parse(patch);
  const response = await apiRequest(`/api/mobile/v1/shopping/${itemId}?type=item`, {
    method: "PATCH",
    body: input,
  });
  if (!response.ok) throw new Error("Failed to update shopping item");
}

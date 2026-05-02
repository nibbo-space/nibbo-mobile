import { z } from "zod";

export const mobileUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  familyId: z.string().nullable(),
  onboardingCompletedAt: z.string().datetime().nullable(),
});

export const tokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  accessExpiresAt: z.string(),
  refreshExpiresAt: z.string(),
});

export const googleAuthResponseSchema = tokenPairSchema.extend({
  user: mobileUserSchema.nullable(),
});

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().nullable(),
  completed: z.boolean(),
  completedAt: z.string().nullable(),
  isPrivate: z.boolean(),
  labels: z.array(z.string()),
  assigneeId: z.string().nullable(),
  creatorId: z.string(),
  columnId: z.string(),
  boardId: z.string(),
  boardName: z.string(),
  columnName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const taskListSchema = z.object({
  items: z.array(taskSchema),
});

export const profileSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email().nullable().optional(),
  image: z.string().nullable(),
  color: z.string().nullable().optional(),
  emoji: z.string().nullable().optional(),
  familyId: z.string().nullable(),
});

export const notificationItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  boardId: z.string().optional(),
  boardName: z.string(),
  boardEmoji: z.string().optional().nullable(),
  columnName: z.string(),
  creatorName: z.string().nullable().optional(),
  creatorEmoji: z.string().nullable().optional(),
  updatedAt: z.string().optional(),
});

export const notificationsResponseSchema = z.object({
  items: z.array(notificationItemSchema),
  count: z.number().int().nonnegative(),
});

export const shoppingItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  checked: z.boolean().optional().default(false),
});

export const shoppingListSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string().nullable().optional(),
  isPrivate: z.boolean().optional().default(false),
  items: z.array(shoppingItemSchema).optional().default([]),
});

export const shoppingListsSchema = z.array(shoppingListSchema);

export const noteAuthorSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  emoji: z.string().nullable(),
});

export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  emoji: z.string(),
  color: z.string(),
  pinned: z.boolean(),
  authorId: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: noteAuthorSchema.optional(),
  category: z.object({ id: z.string(), name: z.string(), emoji: z.string() }).nullable().optional(),
});

export const notesListSchema = z.object({
  items: z.array(noteSchema),
});

export const taskColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
});

export const taskBoardSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  columns: z.array(taskColumnSchema),
});

export const taskBoardsResponseSchema = z.object({
  boards: z.array(taskBoardSchema),
});

export const calendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  emoji: z.string(),
  color: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  allDay: z.boolean(),
  weeklyRepeat: z.boolean(),
  weeklyDay: z.number().nullable(),
  location: z.string().nullable(),
  assigneeId: z.string().nullable(),
  assignee: z.object({ id: z.string(), name: z.string().nullable(), emoji: z.string().nullable() }).nullable().optional(),
});

export const calendarEventsListSchema = z.object({
  items: z.array(calendarEventSchema),
});

export const expenseCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  color: z.string(),
  budget: z.number().nullable().optional(),
});

const embeddedCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  color: z.string(),
});

export const expenseSchema = z.object({
  id: z.string(),
  title: z.string(),
  amount: z.number(),
  date: z.string(),
  note: z.string().nullable(),
  userId: z.string(),
  category: embeddedCategorySchema.nullable().optional(),
});

export const budgetResponseSchema = z.object({
  expenses: z.array(expenseSchema),
  categories: z.array(expenseCategorySchema),
});

export const noteCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  color: z.string(),
});

export const noteCategoriesListSchema = z.object({
  items: z.array(noteCategorySchema),
});

export const familyMemberXpSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  emoji: z.string(),
  color: z.string(),
  xp: z.number(),
});

export const familyAchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  unlockedAt: z.string(),
});

export const familyStatsSchema = z.object({
  totalXp: z.number(),
  members: z.array(familyMemberXpSchema),
  achievements: z.array(familyAchievementSchema),
});

export type MobileUser = z.infer<typeof mobileUserSchema>;
export type TokenPair = z.infer<typeof tokenPairSchema>;
export type GoogleAuthResponse = z.infer<typeof googleAuthResponseSchema>;
export type TaskItem = z.infer<typeof taskSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type NotificationItem = z.infer<typeof notificationItemSchema>;
export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>;
export type ShoppingItem = z.infer<typeof shoppingItemSchema>;
export type ShoppingList = z.infer<typeof shoppingListSchema>;
export type TaskBoard = z.infer<typeof taskBoardSchema>;
export type TaskColumn = z.infer<typeof taskColumnSchema>;
export type Note = z.infer<typeof noteSchema>;
export type NoteCategory = z.infer<typeof noteCategorySchema>;
export type CalendarEvent = z.infer<typeof calendarEventSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type FamilyMemberXp = z.infer<typeof familyMemberXpSchema>;
export type FamilyStats = z.infer<typeof familyStatsSchema>;

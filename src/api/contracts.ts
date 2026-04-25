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

export type MobileUser = z.infer<typeof mobileUserSchema>;
export type TokenPair = z.infer<typeof tokenPairSchema>;
export type GoogleAuthResponse = z.infer<typeof googleAuthResponseSchema>;
export type TaskItem = z.infer<typeof taskSchema>;

import { notificationsResponseSchema } from "./contracts";
import { apiRequest } from "./client";

export async function fetchNotifications() {
  const response = await apiRequest("/api/mobile/v1/notifications");
  if (!response.ok) throw new Error("Failed to load notifications");
  return notificationsResponseSchema.parse(await response.json());
}

export async function markAllNotificationsRead() {
  const response = await apiRequest("/api/mobile/v1/notifications", {
    method: "POST",
    body: { markAll: true },
  });
  if (!response.ok) throw new Error("Failed to mark all notifications as read");
}

export async function markNotificationRead(taskId: string) {
  const response = await apiRequest("/api/mobile/v1/notifications", {
    method: "POST",
    body: { taskId },
  });
  if (!response.ok) throw new Error("Failed to mark notification as read");
}

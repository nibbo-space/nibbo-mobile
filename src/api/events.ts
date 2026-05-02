import { calendarEventsListSchema, calendarEventSchema, type CalendarEvent } from "./contracts";
import { apiRequest } from "./client";

export async function fetchEvents(params?: { from?: string; to?: string }): Promise<CalendarEvent[]> {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  const qs = query.toString();
  const response = await apiRequest(`/api/mobile/v1/events${qs ? `?${qs}` : ""}`);
  if (!response.ok) throw new Error("Failed to load events");
  const data = calendarEventsListSchema.parse(await response.json());
  return data.items;
}

export async function createEvent(data: {
  title: string;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  emoji?: string;
  color?: string;
  description?: string;
  location?: string;
  assigneeId?: string;
}): Promise<CalendarEvent> {
  const response = await apiRequest("/api/mobile/v1/events", {
    method: "POST",
    body: data,
  });
  if (!response.ok) throw new Error("Failed to create event");
  return calendarEventSchema.parse(await response.json());
}

export async function updateEvent(id: string, data: Partial<{
  title: string; description: string; emoji: string; color: string;
  startDate: string; endDate: string; allDay: boolean; location: string; assigneeId: string | null;
}>): Promise<CalendarEvent> {
  const response = await apiRequest(`/api/mobile/v1/events/${id}`, {
    method: "PATCH",
    body: data,
  });
  if (!response.ok) throw new Error("Failed to update event");
  return calendarEventSchema.parse(await response.json());
}

export async function deleteEvent(id: string): Promise<void> {
  const response = await apiRequest(`/api/mobile/v1/events/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete event");
}

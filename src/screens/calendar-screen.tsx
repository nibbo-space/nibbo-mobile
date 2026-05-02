import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { createEvent, deleteEvent, fetchEvents } from "../api/events";
import type { CalendarEvent } from "../api/contracts";
import { Button } from "../components/button";
import { Icon } from "../components/icon";
import { Screen } from "../components/screen";
import { TextField } from "../components/text-field";
import { getCalendarLocale, i18n } from "../lib/i18n";

const EVENT_EMOJIS = ["📅", "🎂", "🏥", "✈️", "🏫", "💼", "🎉", "🏋️", "🎓", "🍽️"];
const EVENT_COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

function formatDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarScreen() {
  const queryClient = useQueryClient();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formStart, setFormStart] = useState(formatDatetimeLocal(today));
  const [formEnd, setFormEnd] = useState(formatDatetimeLocal(today));
  const [formAllDay, setFormAllDay] = useState(false);
  const [formEmoji, setFormEmoji] = useState("📅");
  const [formColor, setFormColor] = useState("#8b5cf6");
  const [formLocation, setFormLocation] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const monthStart = new Date(viewYear, viewMonth, 1).toISOString();
  const monthEnd = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59).toISOString();

  const eventsQuery = useQuery({
    queryKey: ["events", viewYear, viewMonth],
    queryFn: () => fetchEvents({ from: monthStart, to: monthEnd }),
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      setDeleteConfirmId(null);
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const openCreate = (dateStr?: string) => {
    const base = dateStr ? new Date(dateStr) : new Date();
    base.setHours(9, 0);
    const end = new Date(base);
    end.setHours(10, 0);
    setFormTitle("");
    setFormStart(formatDatetimeLocal(base));
    setFormEnd(formatDatetimeLocal(end));
    setFormAllDay(false);
    setFormEmoji("📅");
    setFormColor("#8b5cf6");
    setFormLocation("");
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleSave = () => {
    if (!formTitle.trim()) return;
    createMutation.mutate({
      title: formTitle,
      startDate: new Date(formStart).toISOString(),
      endDate: new Date(formEnd).toISOString(),
      allDay: formAllDay,
      emoji: formEmoji,
      color: formColor,
      location: formLocation || undefined,
    });
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const eventsByDay: Record<number, CalendarEvent[]> = {};
  for (const ev of eventsQuery.data ?? []) {
    const d = new Date(ev.startDate).getDate();
    if (!eventsByDay[d]) eventsByDay[d] = [];
    eventsByDay[d].push(ev);
  }

  const selectedDayEvents = selectedDate
    ? (eventsQuery.data ?? []).filter(
        (e) => new Date(e.startDate).toDateString() === new Date(selectedDate).toDateString()
      )
    : [];

  const monthNames = i18n.calendar.monthNames;
  const dayNames = i18n.calendar.dayNamesShort;
  const locale = getCalendarLocale();

  return (
    <Screen>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{i18n.calendar.title}</h1>
          <p className="mt-1 text-xs text-muted">{i18n.calendar.subtitle}</p>
        </div>
        <button
          onClick={() => openCreate(selectedDate ?? undefined)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-500 transition-transform active:scale-95"
          aria-label={i18n.calendar.newEvent}
        >
          <Icon name="plus" size={20} />
        </button>
      </header>

      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-cozy">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button onClick={prevMonth} className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-50 text-ink/60 active:scale-95">
            <Icon name="chevron-left" size={18} />
          </button>
          <p className="text-sm font-bold text-ink">{monthNames[viewMonth]} {viewYear}</p>
          <button onClick={nextMonth} className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-50 text-ink/60 active:scale-95">
            <Icon name="chevron-right" size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 px-3 pb-1">
          {dayNames.map((d) => (
            <div key={d} className="py-1 text-center text-[10px] font-semibold text-muted">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1 px-3 pb-4">
          {Array.from({ length: adjustedFirstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isSelected = selectedDate === dateStr;
            const hasEvents = Boolean(eventsByDay[day]?.length);

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`relative flex flex-col items-center justify-center rounded-xl py-1.5 text-sm font-medium transition-all active:scale-95 ${
                  isSelected ? "bg-violet-500 text-white" :
                  isToday ? "bg-violet-100 text-violet-600" :
                  "text-ink hover:bg-cream-100"
                }`}
              >
                {day}
                {hasEvents ? (
                  <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-violet-400"}`} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate ? (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold text-ink/60">
            {new Date(selectedDate).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          {selectedDayEvents.length === 0 ? (
            <div className="rounded-2xl bg-white px-4 py-5 text-center shadow-cozy">
              <p className="text-sm text-muted">{i18n.calendar.noEvents}</p>
              <button
                onClick={() => openCreate(selectedDate)}
                className="mt-2 text-xs font-semibold text-violet-500 underline-offset-2 hover:underline"
              >
                + {i18n.calendar.newEvent}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDayEvents.map((ev) => (
                <EventCard key={ev.id} event={ev} locale={locale} onDelete={() => setDeleteConfirmId(ev.id)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold text-ink/60">{i18n.calendar.today}</p>
          {(eventsQuery.data ?? [])
            .filter((e) => new Date(e.startDate).toDateString() === today.toDateString())
            .length === 0 ? (
              <div className="rounded-2xl bg-white px-4 py-4 text-center shadow-cozy">
                <p className="text-sm text-muted">{i18n.calendar.noEvents}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(eventsQuery.data ?? [])
                  .filter((e) => new Date(e.startDate).toDateString() === today.toDateString())
                  .map((ev) => (
                    <EventCard key={ev.id} event={ev} locale={locale} onDelete={() => setDeleteConfirmId(ev.id)} />
                  ))}
              </div>
            )}
        </div>
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
              className="w-full max-w-md overflow-y-auto rounded-t-[32px] bg-white px-5 pb-10 pt-5 shadow-pop"
              style={{ maxHeight: "90vh" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-ink">{i18n.calendar.newEvent}</h2>
                <button onClick={closeForm} className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100 text-ink/60">
                  <Icon name="x" size={16} />
                </button>
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {EVENT_EMOJIS.map((e) => (
                  <button key={e} onClick={() => setFormEmoji(e)}
                    className={`rounded-xl px-2 py-1 text-xl ${formEmoji === e ? "bg-violet-100 ring-2 ring-violet-300" : "bg-cream-50"}`}>
                    {e}
                  </button>
                ))}
              </div>

              <div className="mb-3 flex gap-1.5">
                {EVENT_COLORS.map((c) => (
                  <button key={c} onClick={() => setFormColor(c)}
                    className={`h-6 w-6 rounded-full ${formColor === c ? "ring-2 ring-offset-1 ring-violet-400 scale-110" : ""}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>

              <div className="space-y-3">
                <TextField value={formTitle} onChange={setFormTitle} placeholder={i18n.calendar.eventTitlePlaceholder} autoFocus />

                <label className="flex items-center gap-2 rounded-2xl border border-border bg-cream-50 px-4 py-3 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={formAllDay}
                    onChange={(e) => setFormAllDay(e.target.checked)}
                    className="h-4 w-4 rounded accent-violet-500"
                  />
                  {i18n.calendar.allDay}
                </label>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-ink/70">{i18n.calendar.startLabel}</label>
                  <input
                    type={formAllDay ? "date" : "datetime-local"}
                    value={formAllDay ? formStart.slice(0, 10) : formStart}
                    onChange={(e) => setFormStart(formAllDay ? `${e.target.value}T00:00` : e.target.value)}
                    className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-4 text-sm text-ink outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                {!formAllDay ? (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-ink/70">{i18n.calendar.endLabel}</label>
                    <input
                      type="datetime-local"
                      value={formEnd}
                      onChange={(e) => setFormEnd(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-border bg-cream-50 px-4 text-sm text-ink outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                    />
                  </div>
                ) : null}

                <TextField value={formLocation} onChange={setFormLocation} placeholder={i18n.calendar.location} />
              </div>

              <Button
                variant="dark"
                fullWidth
                onClick={handleSave}
                disabled={createMutation.isPending || !formTitle.trim()}
                className="mt-4 h-12 rounded-2xl bg-violet-500 hover:bg-violet-600"
              >
                {createMutation.isPending ? i18n.calendar.saving : i18n.calendar.save}
              </Button>
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
              <p className="text-center text-base font-semibold text-ink">{i18n.calendar.deleteEventTitle}</p>
              <div className="mt-5 flex gap-2">
                <Button variant="ghost" fullWidth onClick={() => setDeleteConfirmId(null)}>
                  {i18n.calendar.cancel}
                </Button>
                <Button
                  variant="destructive"
                  fullWidth
                  onClick={() => deleteMutation.mutate(deleteConfirmId)}
                  disabled={deleteMutation.isPending}
                >
                  {i18n.calendar.delete}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Screen>
  );
}

function EventCard({
  event,
  locale,
  onDelete,
}: {
  event: CalendarEvent;
  locale: string;
  onDelete: () => void;
}) {
  const startTime = new Date(event.startDate);
  const endTime = new Date(event.endDate);
  const timeStr = event.allDay
    ? i18n.calendar.allDay
    : `${startTime.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })} – ${endTime.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <div className="flex items-start gap-3 overflow-hidden rounded-2xl bg-white p-4 shadow-cozy">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white text-base" style={{ backgroundColor: event.color }}>
        {event.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{event.title}</p>
        <p className="mt-0.5 text-xs text-muted">{timeStr}</p>
        {event.location ? <p className="mt-0.5 text-xs text-muted">📍 {event.location}</p> : null}
      </div>
      <button onClick={onDelete} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-400 active:scale-95">
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";
import { Icon } from "../components/icon";
import { Screen } from "../components/screen";

export function NotificationsScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });
  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  const markOneMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  const items = notificationsQuery.data?.items ?? [];

  return (
    <Screen>
      <header className="flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-text/70 shadow-cozy"
          aria-label="Назад"
        >
          <Icon name="back" size={18} />
        </button>
        <div className="text-center">
          <h1 className="text-base font-bold tracking-tight text-ink">Сповіщення</h1>
          <p className="text-[11px] text-muted">Те, що варте уваги</p>
        </div>
        <button
          onClick={() => markAllMutation.mutate()}
          className="h-11 rounded-2xl bg-cream-50 px-3 text-[11px] font-semibold text-ink"
          disabled={markAllMutation.isPending || items.length === 0}
        >
          Прочитано
        </button>
      </header>

      <div className="mt-5 space-y-3">
        {notificationsQuery.isLoading ? (
          <div className="rounded-3xl bg-white p-4 text-sm text-muted shadow-cozy">Завантаження…</div>
        ) : null}
        {notificationsQuery.isError ? (
          <div className="rounded-3xl bg-white p-4 text-sm text-rose-500 shadow-cozy">
            Не вдалося завантажити сповіщення
          </div>
        ) : null}
        {!notificationsQuery.isLoading && !notificationsQuery.isError && items.length === 0 ? (
          <div className="rounded-3xl bg-white p-4 text-sm text-muted shadow-cozy">
            Наразі немає нових сповіщень
          </div>
        ) : null}
        {items.map((item) => (
          <button
            key={item.id}
            onClick={async () => {
              await markOneMutation.mutateAsync(item.id);
              await navigate({ to: "/tasks/$taskId", params: { taskId: item.id } });
            }}
            className="flex w-full items-start gap-3 rounded-3xl bg-white p-4 text-left shadow-cozy transition-transform active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cream-50">
              <span className="text-base">{item.boardEmoji || "🔔"}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                <span className="shrink-0 text-[10px] font-medium text-muted">
                  {formatWhen(item.updatedAt)}
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-text/70">
                {item.boardName} · {item.columnName}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Screen>
  );
}

function formatWhen(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

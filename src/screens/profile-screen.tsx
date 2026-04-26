import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { fetchNotifications } from "../api/notifications";
import { fetchProfile } from "../api/profile";
import { Avatar } from "../components/avatar";
import { Button } from "../components/button";
import { Screen } from "../components/screen";
import { getAppLanguage, setAppLanguage, type AppLanguage } from "../lib/i18n";
import { requestPushPermissions } from "../lib/push-permissions";
import { clearSession, getSessionSnapshot, updateSessionUser } from "../stores/session-store";

export function ProfileScreen() {
  const navigate = useNavigate();
  const session = getSessionSnapshot();
  const [language, setLanguage] = useState<AppLanguage>(getAppLanguage());
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });
  const user = {
    ...session.user,
    ...profileQuery.data,
    image: profileQuery.data?.image ?? session.user?.image ?? null,
  };
  const userName = user?.name ?? "Друг";
  const email = user?.email ?? "";

  useEffect(() => {
    if (!profileQuery.data) return;
    void updateSessionUser({
      name: profileQuery.data.name ?? session.user?.name ?? null,
      email: profileQuery.data.email ?? session.user?.email ?? "",
      image: profileQuery.data.image ?? session.user?.image ?? null,
      familyId: profileQuery.data.familyId ?? session.user?.familyId ?? null,
    });
  }, [profileQuery.data, session.user?.email, session.user?.familyId, session.user?.image, session.user?.name]);

  return (
    <Screen>
      <header>
        <h1 className="text-xl font-bold tracking-tight">Профіль</h1>
        <p className="mt-1 text-xs text-muted">Ваш акаунт у Nibbo</p>
      </header>

      {profileQuery.isError && !user ? (
        <div className="mt-4 rounded-2xl bg-white p-3 text-xs text-rose-500 shadow-cozy">
          Не вдалося оновити дані профілю
        </div>
      ) : null}

      <section className="mt-5 flex items-center gap-4 rounded-3xl bg-white p-5 shadow-cozy">
        <Avatar src={user?.image ?? null} name={userName} size={64} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-ink">{userName}</p>
          {email ? <p className="mt-0.5 truncate text-xs text-muted">{email}</p> : null}
        </div>
      </section>

      <section className="mt-4 space-y-2">
        <div className="rounded-2xl bg-white p-3 shadow-cozy">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Сім'я</p>
          <p className="mt-1 text-sm font-medium text-ink">{user?.familyId ? "Активна" : "Не налаштовано"}</p>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-cozy">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Мова</p>
          <select
            value={language}
            onChange={(event) => {
              const nextLanguage = event.target.value as AppLanguage;
              setLanguage(nextLanguage);
              setAppLanguage(nextLanguage);
              window.location.reload();
            }}
            className="mt-2 h-10 w-full rounded-xl border border-border bg-cream-50 px-3 text-sm text-ink outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
          >
            <option value="uk">Українська</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-cozy">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Сповіщення</p>
          <p className="mt-1 text-sm text-ink">
            {notificationsQuery.data
              ? `${notificationsQuery.data.count} нових`
              : session.isAuthenticated
                ? "Підключено"
                : "Потрібен вхід"}
          </p>
          <Button
            variant="ghost"
            fullWidth
            onClick={async () => {
              const status = await requestPushPermissions();
              if (status === "granted") setNotificationStatus("Дозвіл надано");
              if (status === "denied") setNotificationStatus("Дозвіл відхилено");
              if (status === "prompt") setNotificationStatus("Потрібне підтвердження");
              if (status === "prompt-with-rationale") {
                setNotificationStatus("Потрібне підтвердження");
              }
              if (status === "unknown") setNotificationStatus("Недоступно в браузері");
            }}
          >
            Увімкнути push-сповіщення
          </Button>
          {notificationStatus ? <p className="mt-2 text-xs text-muted">{notificationStatus}</p> : null}
        </div>
      </section>

      <div className="mt-auto pt-8">
        <Button
          variant="ghost"
          fullWidth
          onClick={async () => {
            await clearSession();
            await navigate({ to: "/login" });
          }}
        >
          Вийти з акаунту
        </Button>
      </div>
    </Screen>
  );
}


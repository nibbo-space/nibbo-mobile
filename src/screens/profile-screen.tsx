import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { fetchFamilyStats } from "../api/family";
import { fetchNotifications } from "../api/notifications";
import { fetchProfile } from "../api/profile";
import { Avatar } from "../components/avatar";
import { Button } from "../components/button";
import { Icon } from "../components/icon";
import { Screen } from "../components/screen";
import { getAppLanguage, i18n, setAppLanguage, type AppLanguage } from "../lib/i18n";
import { requestPushPermissions } from "../lib/push-permissions";
import { clearSession, updateSessionUser } from "../stores/session-store";
import { useSession } from "../hooks/use-session";

export function ProfileScreen() {
  const navigate = useNavigate();
  const session = useSession();
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
  const familyStatsQuery = useQuery({
    queryKey: ["family-stats"],
    queryFn: fetchFamilyStats,
    staleTime: 60_000,
    enabled: !!session.user?.familyId,
  });

  const user = {
    ...session.user,
    ...profileQuery.data,
    image: profileQuery.data?.image ?? session.user?.image ?? null,
  };
  const userName = user?.name ?? i18n.profile.defaultName;
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

  const stats = familyStatsQuery.data;

  return (
    <Screen>
      <header>
        <h1 className="text-xl font-bold tracking-tight">{i18n.profile.title}</h1>
        <p className="mt-1 text-xs text-muted">{i18n.profile.subtitle}</p>
      </header>

      {profileQuery.isError && !user ? (
        <div className="mt-4 rounded-2xl bg-white p-3 text-xs text-rose-500 shadow-cozy">
          {i18n.profile.profileLoadError}
        </div>
      ) : null}

      <section className="mt-5 flex items-center gap-4 rounded-3xl bg-white p-5 shadow-cozy">
        <Avatar src={user?.image ?? null} name={userName} size={64} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-ink">{userName}</p>
          {email ? <p className="mt-0.5 truncate text-xs text-muted">{email}</p> : null}
        </div>
      </section>

      {/* Family XP & Achievements */}
      {session.user?.familyId ? (
        <section className="mt-4 space-y-3">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-500 p-5 text-white shadow-pop">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="star" size={16} className="text-yellow-300" />
              <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">{i18n.profile.familyXp}</p>
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {stats ? stats.totalXp.toLocaleString() : "—"}
              <span className="ml-1 text-base font-normal text-white/60">XP</span>
            </p>
            {stats ? (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-base">🏆</span>
                <span className="text-sm text-white/80">
                  {stats.achievements.length === 0
                    ? i18n.profile.achievementsNone
                    : i18n.profile.achievementsCount(stats.achievements.length)}
                </span>
              </div>
            ) : null}
            {stats && stats.members.length > 0 ? (
              <div className="mt-4 space-y-2">
                {[...stats.members]
                  .sort((a, b) => b.xp - a.xp)
                  .map((member, i) => {
                    const pct = stats.totalXp > 0 ? (member.xp / stats.totalXp) * 100 : 0;
                    return (
                      <div key={member.id}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-1.5">
                            {i === 0 ? <span className="text-yellow-300">🏆</span> : <span className="w-4" />}
                            <span className="font-medium text-white/90">{member.name ?? i18n.profile.unknownMember}</span>
                          </div>
                          <span className="text-white/70">{member.xp.toLocaleString()} XP</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                          <div
                            className="h-full rounded-full bg-white/60 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : null}
            {familyStatsQuery.isLoading ? (
              <div className="mt-3 h-16 animate-pulse rounded-2xl bg-white/10" />
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="mt-4 space-y-2">
        <div className="rounded-2xl bg-white p-3 shadow-cozy">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{i18n.profile.familySection}</p>
          <p className="mt-1 text-sm font-medium text-ink">{user?.familyId ? i18n.profile.familyActive : i18n.profile.familyInactive}</p>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-cozy">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{i18n.profile.languageSection}</p>
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
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{i18n.profile.notificationsSection}</p>
          <p className="mt-1 text-sm text-ink">
            {notificationsQuery.data
              ? i18n.profile.notificationsNew(notificationsQuery.data.count)
              : session.isAuthenticated
                ? i18n.profile.notificationsConnected
                : i18n.profile.notificationsNeedLogin}
          </p>
          <Button
            variant="ghost"
            fullWidth
            onClick={async () => {
              const status = await requestPushPermissions();
              if (status === "granted") setNotificationStatus(i18n.profile.pushGranted);
              if (status === "denied") setNotificationStatus(i18n.profile.pushDenied);
              if (status === "prompt") setNotificationStatus(i18n.profile.pushPrompt);
              if (status === "prompt-with-rationale") setNotificationStatus(i18n.profile.pushPrompt);
              if (status === "unknown") setNotificationStatus(i18n.profile.pushUnavailable);
            }}
          >
            {i18n.profile.enablePush}
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
          {i18n.profile.logOut}
        </Button>
      </div>
    </Screen>
  );
}

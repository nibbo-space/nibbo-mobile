import { useQueryClient } from "@tanstack/react-query";
import { Outlet, createRootRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { useEffect, useState } from "react";
import { TabBar } from "../components/tab-bar";

const HIDDEN_PATHS = ["/login"];

function RootLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [pushBanner, setPushBanner] = useState<{ title: string; body: string } | null>(null);
  const showTabs = !HIDDEN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let timer: number | null = null;
    const onReceived = PushNotifications.addListener("pushNotificationReceived", (notification) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      const title = notification.title?.trim() || "Нове сповіщення";
      const body = notification.body?.trim() || "Перевірте останні оновлення";
      setPushBanner({ title, body });
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setPushBanner(null), 4000);
    });
    const onAction = PushNotifications.addListener("pushNotificationActionPerformed", async () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await navigate({ to: "/notifications" });
    });
    return () => {
      onReceived.then((listener) => listener.remove());
      onAction.then((listener) => listener.remove());
      if (timer) window.clearTimeout(timer);
    };
  }, [navigate, queryClient]);

  return (
    <>
      <Outlet />
      {pushBanner ? (
        <div className="fixed left-1/2 top-4 z-[70] w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-2xl bg-ink px-4 py-3 text-white shadow-pop">
          <p className="text-sm font-semibold">{pushBanner.title}</p>
          <p className="mt-1 text-xs text-white/80">{pushBanner.body}</p>
        </div>
      ) : null}
      {showTabs ? <TabBar /> : null}
    </>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});

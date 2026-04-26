import { createFileRoute, redirect } from "@tanstack/react-router";
import { NotificationsScreen } from "../screens/notifications-screen";
import { getSessionSnapshot } from "../stores/session-store";

export const Route = createFileRoute("/notifications")({
  beforeLoad: () => {
    if (!getSessionSnapshot().isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: NotificationsScreen,
});

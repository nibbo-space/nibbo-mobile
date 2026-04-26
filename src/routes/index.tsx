import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardScreen } from "../screens/dashboard-screen";
import { getSessionSnapshot } from "../stores/session-store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const state = getSessionSnapshot();
    if (!state.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardScreen,
});

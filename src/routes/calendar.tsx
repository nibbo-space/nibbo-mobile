import { createFileRoute, redirect } from "@tanstack/react-router";
import { CalendarScreen } from "../screens/calendar-screen";
import { getSessionSnapshot } from "../stores/session-store";

export const Route = createFileRoute("/calendar")({
  beforeLoad: () => {
    const state = getSessionSnapshot();
    if (!state.isAuthenticated) throw redirect({ to: "/login" });
  },
  component: CalendarScreen,
});

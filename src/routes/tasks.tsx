import { createFileRoute, redirect } from "@tanstack/react-router";
import { TasksScreen } from "../screens/tasks-screen";
import { getSessionSnapshot } from "../stores/session-store";

export const Route = createFileRoute("/tasks")({
  beforeLoad: () => {
    if (!getSessionSnapshot().isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: TasksScreen,
});

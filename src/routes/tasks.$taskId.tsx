import { createFileRoute, redirect } from "@tanstack/react-router";
import { TaskDetailsScreen } from "../screens/task-details-screen";
import { getSessionSnapshot } from "../stores/session-store";

export const Route = createFileRoute("/tasks/$taskId")({
  beforeLoad: () => {
    if (!getSessionSnapshot().isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: TaskDetailsScreen,
});

import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSessionSnapshot } from "../stores/session-store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const state = getSessionSnapshot();
    throw redirect({ to: state.isAuthenticated ? "/tasks" : "/login" });
  },
});

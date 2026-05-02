import { createFileRoute, redirect } from "@tanstack/react-router";
import { NotesScreen } from "../screens/notes-screen";
import { getSessionSnapshot } from "../stores/session-store";

export const Route = createFileRoute("/notes")({
  beforeLoad: () => {
    const state = getSessionSnapshot();
    if (!state.isAuthenticated) throw redirect({ to: "/login" });
  },
  component: NotesScreen,
});

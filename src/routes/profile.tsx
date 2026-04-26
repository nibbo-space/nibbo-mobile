import { createFileRoute, redirect } from "@tanstack/react-router";
import { ProfileScreen } from "../screens/profile-screen";
import { getSessionSnapshot } from "../stores/session-store";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    if (!getSessionSnapshot().isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: ProfileScreen,
});

import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginScreen } from "../screens/login-screen";
import { getSessionSnapshot } from "../stores/session-store";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (getSessionSnapshot().isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginScreen,
});

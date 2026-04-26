import { createFileRoute, redirect } from "@tanstack/react-router";
import { ShoppingScreen } from "../screens/shopping-screen";
import { getSessionSnapshot } from "../stores/session-store";

export const Route = createFileRoute("/shopping")({
  beforeLoad: () => {
    if (!getSessionSnapshot().isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: ShoppingScreen,
});

import { createFileRoute, redirect } from "@tanstack/react-router";
import { BudgetScreen } from "../screens/budget-screen";
import { getSessionSnapshot } from "../stores/session-store";

export const Route = createFileRoute("/budget")({
  beforeLoad: () => {
    const state = getSessionSnapshot();
    if (!state.isAuthenticated) throw redirect({ to: "/login" });
  },
  component: BudgetScreen,
});

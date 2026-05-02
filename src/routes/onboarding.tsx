import { createFileRoute, redirect } from "@tanstack/react-router";
import { OnboardingScreen } from "../screens/onboarding-screen";
import { getSessionSnapshot } from "../stores/session-store";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: () => {
    const state = getSessionSnapshot();
    if (!state.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
    if (state.user?.onboardingCompletedAt) {
      throw redirect({ to: "/" });
    }
  },
  component: OnboardingScreen,
});

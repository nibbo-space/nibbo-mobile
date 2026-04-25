import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { signInWithGoogle } from "../api/auth";
import { Button } from "../components/button";
import { Screen } from "../components/screen";
import { setSession } from "../stores/session-store";

export function LoginScreen() {
  const navigate = useNavigate();
  const loginMutation = useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: async (data) => {
      if (!data.user) throw new Error("User not found");
      await setSession(data.user, data.accessToken, data.refreshToken);
      await navigate({ to: "/tasks" });
    },
  });

  return (
    <Screen>
      <div className="mt-24 rounded-2xl bg-surface p-6 shadow-card">
        <h1 className="text-3xl font-semibold">Nibbo Mobile</h1>
        <p className="mt-2 text-sm text-muted">Native Google Sign-In + tasks MVP</p>
        <Button onClick={() => loginMutation.mutate()} disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in..." : "Continue with Google"}
        </Button>
        {loginMutation.isError ? (
          <p className="mt-3 text-sm text-danger">{(loginMutation.error as Error).message}</p>
        ) : null}
      </div>
    </Screen>
  );
}

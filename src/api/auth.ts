import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { apiRequest } from "./client";
import { googleAuthResponseSchema } from "./contracts";

export async function signInWithGoogle() {
  await FirebaseAuthentication.signInWithGoogle();
  const tokenResult = await FirebaseAuthentication.getIdToken({ forceRefresh: true });
  const idToken = tokenResult.token?.trim();
  if (!idToken) throw new Error("Firebase id token is missing");

  const response = await apiRequest("/api/mobile/v1/auth/google", {
    method: "POST",
    auth: false,
    body: { idToken },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Google auth failed");
  }
  return googleAuthResponseSchema.parse(await response.json());
}

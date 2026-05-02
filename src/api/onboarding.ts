import { apiRequest } from "./client";

export async function completeOnboarding(): Promise<void> {
  const response = await apiRequest("/api/mobile/v1/onboarding", {
    method: "POST",
    body: {},
  });
  if (!response.ok) throw new Error("Failed to complete onboarding");
}

export async function updateProfile(data: { name?: string; emoji?: string; color?: string }) {
  const response = await apiRequest("/api/mobile/v1/profile", {
    method: "PATCH",
    body: data,
  });
  if (!response.ok) throw new Error("Failed to update profile");
  return response.json() as Promise<{ id: string; name: string | null; onboardingCompletedAt: string | null }>;
}

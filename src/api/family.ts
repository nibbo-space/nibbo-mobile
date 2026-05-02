import { familyStatsSchema, type FamilyStats } from "./contracts";
import { apiRequest } from "./client";

export async function fetchFamilyStats(): Promise<FamilyStats> {
  const response = await apiRequest("/api/mobile/v1/family/stats");
  if (!response.ok) throw new Error("Failed to load family stats");
  return familyStatsSchema.parse(await response.json());
}

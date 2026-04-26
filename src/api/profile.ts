import { z } from "zod";
import { profileSchema } from "./contracts";
import { apiRequest } from "./client";

const familyMemberSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  image: z.string().nullable(),
  color: z.string().nullable(),
  emoji: z.string().nullable(),
});

const familyResponseSchema = z.object({
  currentUserId: z.string(),
  members: z.array(familyMemberSchema),
  family: z.object({ id: z.string() }).nullable().optional(),
});

export type FamilyMember = z.infer<typeof familyMemberSchema>;

export async function fetchProfile() {
  const response = await apiRequest("/api/mobile/v1/family");
  if (!response.ok) throw new Error("Failed to load profile");
  const data = familyResponseSchema.parse(await response.json());
  const me = data.members.find((member) => member.id === data.currentUserId);
  if (!me) throw new Error("Failed to load profile");
  return profileSchema.parse({
    id: me.id,
    name: me.name,
    email: me.email ?? null,
    image: me.image,
    color: me.color,
    emoji: me.emoji,
    familyId: data.family?.id ?? null,
  });
}

export async function fetchFamilyMembers() {
  const response = await apiRequest("/api/mobile/v1/family");
  if (!response.ok) throw new Error("Failed to load family members");
  const data = familyResponseSchema.parse(await response.json());
  return data.members;
}

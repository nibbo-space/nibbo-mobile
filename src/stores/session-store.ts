import type { MobileUser } from "../api/contracts";
import {
  clearStoredUser,
  clearTokens,
  getAccessToken,
  getStoredUser,
  setStoredUser,
  setTokens,
} from "../lib/storage";

type SessionState = {
  user: MobileUser | null;
  isReady: boolean;
  isAuthenticated: boolean;
};

type SessionSnapshot = SessionState;

let state: SessionState = {
  user: null,
  isReady: false,
  isAuthenticated: false,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSessionSnapshot(): SessionSnapshot {
  return state;
}

export async function bootstrapSession() {
  const token = await getAccessToken();
  const storedUser = await getStoredUser();
  const tokenUser = token ? decodeUserFromToken(token) : null;
  const user = storedUser ?? tokenUser;
  state = {
    user,
    isReady: true,
    isAuthenticated: Boolean(token),
  };
  emit();
}

export async function setSession(user: MobileUser, accessToken: string, refreshToken: string) {
  await setTokens(accessToken, refreshToken);
  await setStoredUser(user);
  state = {
    user,
    isReady: true,
    isAuthenticated: true,
  };
  emit();
}

export async function clearSession() {
  await clearTokens();
  await clearStoredUser();
  state = {
    user: null,
    isReady: true,
    isAuthenticated: false,
  };
  emit();
}

export async function updateSessionUser(patch: Partial<MobileUser>) {
  if (!state.user) return;
  const nextUser: MobileUser = {
    ...state.user,
    ...patch,
  };
  await setStoredUser(nextUser);
  state = {
    ...state,
    user: nextUser,
  };
  emit();
}

function decodeUserFromToken(token: string): MobileUser | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payloadRaw = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadRaw) as {
      id?: string;
      email?: string;
      name?: string | null;
      picture?: string | null;
      image?: string | null;
      familyId?: string | null;
    };
    if (!payload.id || !payload.email) return null;
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name ?? null,
      image: payload.picture ?? payload.image ?? null,
      familyId: payload.familyId ?? null,
      onboardingCompletedAt: null,
    };
  } catch {
    return null;
  }
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return decodeURIComponent(
    Array.from(atob(padded))
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
}

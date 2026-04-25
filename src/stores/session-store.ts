import type { MobileUser } from "../api/contracts";
import { clearTokens, getAccessToken, setTokens } from "../lib/storage";

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
  state = {
    ...state,
    isReady: true,
    isAuthenticated: Boolean(token),
  };
  emit();
}

export async function setSession(user: MobileUser, accessToken: string, refreshToken: string) {
  await setTokens(accessToken, refreshToken);
  state = {
    user,
    isReady: true,
    isAuthenticated: true,
  };
  emit();
}

export async function clearSession() {
  await clearTokens();
  state = {
    user: null,
    isReady: true,
    isAuthenticated: false,
  };
  emit();
}

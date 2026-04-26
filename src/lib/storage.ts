import { Preferences } from "@capacitor/preferences";
import type { MobileUser } from "../api/contracts";

const ACCESS_TOKEN_KEY = "mobile_access_token";
const REFRESH_TOKEN_KEY = "mobile_refresh_token";
const USER_KEY = "mobile_user";

export async function getAccessToken() {
  return (await Preferences.get({ key: ACCESS_TOKEN_KEY })).value;
}

export async function getRefreshToken() {
  return (await Preferences.get({ key: REFRESH_TOKEN_KEY })).value;
}

export async function setTokens(accessToken: string, refreshToken: string) {
  await Preferences.set({ key: ACCESS_TOKEN_KEY, value: accessToken });
  await Preferences.set({ key: REFRESH_TOKEN_KEY, value: refreshToken });
}

export async function clearTokens() {
  await Preferences.remove({ key: ACCESS_TOKEN_KEY });
  await Preferences.remove({ key: REFRESH_TOKEN_KEY });
}

export async function getStoredUser() {
  const raw = (await Preferences.get({ key: USER_KEY })).value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MobileUser;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: MobileUser) {
  await Preferences.set({ key: USER_KEY, value: JSON.stringify(user) });
}

export async function clearStoredUser() {
  await Preferences.remove({ key: USER_KEY });
}

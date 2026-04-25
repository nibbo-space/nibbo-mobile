import { Preferences } from "@capacitor/preferences";

const ACCESS_TOKEN_KEY = "mobile_access_token";
const REFRESH_TOKEN_KEY = "mobile_refresh_token";

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

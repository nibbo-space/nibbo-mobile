import { API_BASE_URL } from "../lib/config";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../lib/storage";
import { tokenPairSchema } from "./contracts";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;
  const response = await fetch(`${API_BASE_URL}/api/mobile/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    await clearTokens();
    return false;
  }
  const data = tokenPairSchema.parse(await response.json());
  await setTokens(data.accessToken, data.refreshToken);
  return true;
}

async function getRefreshed() {
  if (!refreshPromise) {
    refreshPromise = refreshSession().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth !== false) {
    const token = await getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status !== 401 || options.auth === false) return response;
  const refreshed = await getRefreshed();
  if (!refreshed) return response;

  const retryHeaders = new Headers(options.headers);
  if (options.body !== undefined) {
    retryHeaders.set("Content-Type", "application/json");
  }
  const nextToken = await getAccessToken();
  if (nextToken) retryHeaders.set("Authorization", `Bearer ${nextToken}`);

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: retryHeaders,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

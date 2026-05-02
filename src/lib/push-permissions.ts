import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { apiRequest } from "../api/client";

async function registerFcmToken(token: string) {
  try {
    await apiRequest("/api/mobile/v1/push", {
      method: "POST",
      body: { token, platform: "android" },
    });
  } catch {
    // non-fatal
  }
}

export async function requestPushPermissions(): Promise<
  "granted" | "denied" | "prompt" | "prompt-with-rationale" | "unknown"
> {
  if (!Capacitor.isNativePlatform()) return "unknown";
  const checkResult = await PushNotifications.checkPermissions();
  if (checkResult.receive === "granted") {
    await PushNotifications.register();
    return "granted";
  }
  if (checkResult.receive === "denied") {
    return "denied";
  }
  const requestResult = await PushNotifications.requestPermissions();
  if (requestResult.receive === "granted") {
    await PushNotifications.register();
  }
  return requestResult.receive;
}

export function setupPushRegistrationListener() {
  if (!Capacitor.isNativePlatform()) return;
  PushNotifications.addListener("registration", (token) => {
    void registerFcmToken(token.value);
  });
}

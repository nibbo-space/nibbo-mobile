import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

export async function requestPushPermissions(): Promise<
  "granted" | "denied" | "prompt" | "prompt-with-rationale" | "unknown"
> {
  if (!Capacitor.isNativePlatform()) return "unknown";
  const checkResult = await PushNotifications.checkPermissions();
  if (checkResult.receive === "granted") {
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

import { useSyncExternalStore } from "react";
import { getSessionSnapshot, subscribeSession } from "../stores/session-store";

export function useSession() {
  return useSyncExternalStore(subscribeSession, getSessionSnapshot, getSessionSnapshot);
}

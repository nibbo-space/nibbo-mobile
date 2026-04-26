import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { requestPushPermissions } from "./lib/push-permissions";
import { router } from "./router";
import { bootstrapSession } from "./stores/session-store";

const queryClient = new QueryClient();
await bootstrapSession();
void requestPushPermissions();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);

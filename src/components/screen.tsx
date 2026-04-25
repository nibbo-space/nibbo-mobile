import type { PropsWithChildren } from "react";

export function Screen({ children }: PropsWithChildren) {
  return <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-bg px-4 py-6">{children}</main>;
}

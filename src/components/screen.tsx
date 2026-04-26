import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  variant?: "default" | "plain";
}>;

export function Screen({ children, variant = "default" }: Props) {
  const bg = variant === "plain" ? "bg-bg" : "bg-mesh";
  return (
    <main className={`mx-auto flex min-h-screen w-full max-w-md flex-col ${bg} px-5 pb-32 pt-6`}>
      {children}
    </main>
  );
}

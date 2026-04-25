import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "destructive";
  disabled?: boolean;
}>;

export function Button({ children, variant = "primary", ...rest }: Props) {
  const cls =
    variant === "primary"
      ? "bg-primary text-white"
      : variant === "destructive"
        ? "bg-danger text-white"
        : "bg-card text-text";

  return (
    <button
      {...rest}
      className={`h-12 rounded-xl px-4 text-sm font-semibold transition-opacity disabled:opacity-60 ${cls}`}
    >
      {children}
    </button>
  );
}

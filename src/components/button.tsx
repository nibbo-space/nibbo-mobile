import type { PropsWithChildren } from "react";

type Variant = "primary" | "ghost" | "soft" | "destructive" | "dark";
type Size = "md" | "sm" | "icon";

type Props = PropsWithChildren<{
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}>;

const variantClasses: Record<Variant, string> = {
  primary: "bg-rose-400 text-white shadow-pop hover:bg-rose-500 active:scale-[0.98]",
  dark: "bg-ink text-white hover:opacity-90 active:scale-[0.98]",
  soft: "bg-rose-100 text-rose-500 hover:bg-rose-200 active:scale-[0.98]",
  ghost: "bg-white text-text border border-border hover:bg-cream-50 active:scale-[0.98]",
  destructive: "bg-rose-500 text-white hover:bg-rose-600 active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  md: "h-12 px-5 text-sm rounded-2xl",
  sm: "h-9 px-4 text-xs rounded-xl",
  icon: "h-11 w-11 rounded-2xl text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

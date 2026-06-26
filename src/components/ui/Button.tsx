import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none",
        {
          "bg-primary text-on-primary hover:brightness-110 active:brightness-90":
            variant === "primary",
          "bg-surface-container-high text-on-surface hover:bg-surface-variant active:bg-surface-variant border border-white/10":
            variant === "secondary",
          "border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-white/5":
            variant === "outline",
          "text-on-surface-variant hover:text-on-surface hover:bg-white/5":
            variant === "ghost",
          "bg-error/20 text-error hover:bg-error/30 border border-error/20":
            variant === "danger",
        },
        {
          "px-3 py-1.5 text-xs rounded-lg": size === "sm",
          "px-4 py-2 text-sm rounded-lg": size === "md",
          "px-6 py-3 text-base rounded-xl": size === "lg",
        },
        loading && "relative !text-transparent",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="absolute h-4 w-4 animate-spin text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

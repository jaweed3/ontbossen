import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="label-uppercase block">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "block w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/30",
          "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30",
          "transition-all duration-150",
          error && "border-error focus:border-error focus:ring-error/30",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

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
          "block w-full bg-surface-raised border border-border-glass rounded px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary",
          "focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30",
          "transition-all duration-150",
          error && "border-severe focus:border-severe focus:ring-severe/30",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-severe">{error}</p>}
    </div>
  );
}

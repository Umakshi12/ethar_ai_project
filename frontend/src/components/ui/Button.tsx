import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "danger" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseClasses =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60";

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    outline:
      "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300",
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${
        sizeClasses[size]
      } ${className ?? ""}`}
      disabled={isDisabled}
      {...rest}
    >
      {loading && (
        <Loader2
          className="mr-2 h-4 w-4 animate-spin"
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </button>
  );
}


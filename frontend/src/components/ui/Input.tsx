import {
  InputHTMLAttributes,
  ReactNode,
} from "react";

type InputProps = {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function Input({
  label,
  error,
  leftIcon,
  className,
  id,
  ...rest
}: InputProps) {
  const inputId = id ?? rest.name ?? undefined;

  const baseClasses =
    "block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2";

  const borderClasses = error
    ? "border-red-300 focus:border-red-400 focus:ring-red-300"
    : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200";

  const paddingLeft = leftIcon ? "pl-9" : "";

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`${baseClasses} ${borderClasses} ${paddingLeft} ${
            rest.disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
          } ${className ?? ""}`}
          {...rest}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}


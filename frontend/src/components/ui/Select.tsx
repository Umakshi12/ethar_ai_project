import { ChevronDown } from "lucide-react";
import {
  SelectHTMLAttributes,
} from "react";

type Option = {
  value: string;
  label: string;
};

type SelectProps = {
  label?: string;
  error?: string;
  options: Option[];
} & SelectHTMLAttributes<HTMLSelectElement>;

export function Select({
  label,
  error,
  options,
  className,
  id,
  ...rest
}: SelectProps) {
  const selectId = id ?? rest.name ?? undefined;

  const baseClasses =
    "block w-full appearance-none rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2";

  const borderClasses = error
    ? "border-red-300 focus:border-red-400 focus:ring-red-300"
    : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200";

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`${baseClasses} ${borderClasses} ${
            rest.disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
          } ${className ?? ""} pr-9`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}


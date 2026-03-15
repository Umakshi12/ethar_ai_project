import type { ReactNode } from "react";

type BadgeVariant = "present" | "absent" | "info" | "neutral";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  let classes = "bg-gray-100 text-gray-700";

  if (variant === "present") {
    classes = "bg-emerald-100 text-emerald-700";
  } else if (variant === "absent") {
    classes = "bg-red-100 text-red-600";
  } else if (variant === "info") {
    classes = "bg-indigo-50 text-indigo-700";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${classes} ${
        className ?? ""
      }`}
    >
      {children}
    </span>
  );
}


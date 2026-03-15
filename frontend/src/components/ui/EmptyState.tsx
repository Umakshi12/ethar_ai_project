import { LucideIcon } from "lucide-react";

import { Button } from "./Button";

type EmptyStateAction = {
  label: string;
  onClick: () => void;
};

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
        <Icon className="h-7 w-7 text-gray-300" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <p className="max-w-md text-xs text-gray-500">{description}</p>
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}


import { AlertCircle } from "lucide-react";

import { Button } from "./Button";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-7 w-7 text-red-500" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-gray-900">
          Something went wrong
        </h2>
        {message && (
          <p className="max-w-md text-xs text-gray-500">{message}</p>
        )}
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}


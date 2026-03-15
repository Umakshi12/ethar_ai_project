import { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer relative overflow-hidden rounded-md bg-gray-200 ${className ?? ""}`}
      {...rest}
    />
  );
}


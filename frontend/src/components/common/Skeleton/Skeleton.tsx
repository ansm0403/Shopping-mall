interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-secondary-200 animate-pulse rounded ${className}`}
      aria-hidden="true"
    />
  );
}

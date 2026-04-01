/**
 * Skeleton Loading Component
 * Original source: src/components/ada/Skeleton.tsx
 */
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#e8e5dc] ${className}`}
    />
  );
}

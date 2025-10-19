type SkeletonProps = {
  className?: string; // Allow custom heights/widths
};

export default function Skeleton({ className = 'h-4' }: SkeletonProps) {
  return (
    <div
      // Use the new animation, 'rounded-lg', and a light gray
      className={`animate-pulse-subtle rounded-lg bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
}
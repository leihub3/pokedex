import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "circular";
}

export function Skeleton({ className, variant = "default" }: SkeletonProps) {
  const baseClasses = "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:1000px_100%] dark:from-gray-800 dark:via-gray-700 dark:to-gray-800";
  
  const variants = {
    default: "rounded",
    card: "rounded-lg",
    text: "rounded h-4",
    circular: "rounded-full",
  };

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PokemonCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <Skeleton variant="circular" className="mx-auto h-24 w-24 mb-3" />
      <Skeleton variant="text" className="mb-2 h-5 w-24 mx-auto" />
      <div className="flex justify-center gap-2">
        <Skeleton variant="default" className="h-6 w-16" />
        <Skeleton variant="default" className="h-6 w-16" />
      </div>
    </div>
  );
}

export function PokemonDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton variant="circular" className="h-48 w-48" />
        <Skeleton variant="text" className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton variant="default" className="h-6 w-20" />
          <Skeleton variant="default" className="h-6 w-20" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton variant="text" className="h-6 w-24" />
        <Skeleton variant="card" className="h-64 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton variant="text" className="h-6 w-32" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="text" className="h-8" />
          ))}
        </div>
      </div>
    </div>
  );
}


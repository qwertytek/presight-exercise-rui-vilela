export function UserCardSkeleton() {
  return (
    <div className="w-full rounded-xl border border-neutral-700/40 bg-neutral-800/30 p-4 shadow-sm backdrop-blur-md animate-pulse">
      {/* Top row */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-neutral-700/50" />

        <div className="flex flex-1 items-start justify-between">
          <div className="h-4 w-32 rounded bg-neutral-700/50" />
          <div className="h-3 w-6 rounded bg-neutral-700/50" />
        </div>
      </div>

      {/* Middle row */}
      <div className="mt-2 h-3 w-20 rounded bg-neutral-700/50" />

      {/* Spacer */}
      <div className="h-6" />

      {/* Bottom row (hobbies) */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-5 w-16 rounded-full bg-neutral-700/50" />
        ))}
      </div>
    </div>
  );
}

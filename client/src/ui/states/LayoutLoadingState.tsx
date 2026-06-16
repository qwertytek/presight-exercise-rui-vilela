export function LayoutLoadingState({
  title = 'Loading...',
  subtitle = 'Fetching data',
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="rounded-xl border border-neutral-700/40 bg-neutral-800/30 p-6 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
          <div>
            <p className="text-sm text-neutral-100">{title}</p>
            <p className="text-xs text-neutral-400">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

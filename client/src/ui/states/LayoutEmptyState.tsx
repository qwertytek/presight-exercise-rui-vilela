export function LayoutEmptyState({
  title = 'Nothing here',
  description = 'No data available yet.',
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-sm rounded-xl border border-neutral-700/40 bg-neutral-800/30 p-8 text-center shadow-sm backdrop-blur-md">
        <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-neutral-700/40" />

        <h3 className="text-sm font-medium text-neutral-100">{title}</h3>
        <p className="mt-1 text-xs text-neutral-400">{description}</p>

        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}

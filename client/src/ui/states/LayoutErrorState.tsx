export function LayoutErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Try again.',
  retry,
}: {
  title?: string;
  description?: string;
  retry?: React.ReactNode;
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-sm rounded-xl border border-red-500/20 bg-neutral-800/30 p-8 text-center shadow-sm backdrop-blur-md">
        <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-red-400" />
        </div>

        <h3 className="text-sm font-medium text-neutral-100">{title}</h3>
        <p className="mt-1 text-xs text-neutral-400">{description}</p>

        {retry && <div className="mt-4">{retry}</div>}
      </div>
    </div>
  );
}

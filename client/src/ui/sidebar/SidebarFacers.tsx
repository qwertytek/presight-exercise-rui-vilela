import { useFacets, type FacetItem } from '../../hooks/users';
import { useSearch } from '../../providers/SearchProvider';

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------

function FacetSkeletonRow() {
  return (
    <div className="flex items-center justify-between animate-pulse">
      <div className="h-3 w-24 rounded bg-neutral-700/50" />
      <div className="h-3 w-6 rounded bg-neutral-700/50" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Facet section
// ---------------------------------------------------------------------------

function FacetSection({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: FacetItem[];
  emptyMessage: string;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-neutral-500">{emptyMessage}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-2">
              <span className="truncate text-sm text-neutral-200">{item.label}</span>
              <span className="shrink-0 rounded-full bg-neutral-700/60 px-2 py-0.5 text-xs font-medium text-neutral-300">
                {item.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton section
// ---------------------------------------------------------------------------

function FacetSectionSkeleton({ title }: { title: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{title}</h3>
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <FacetSkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SidebarFacets() {
  const { searchQuery } = useSearch();
  const { data, isLoading, isError, error } = useFacets(searchQuery);

  if (isError) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-neutral-800/30 p-4 text-center">
        <p className="text-sm font-medium text-neutral-100">Failed to load facets</p>
        <p className="mt-1 text-xs text-neutral-400">
          {error instanceof Error ? error.message : 'An unexpected error occurred.'}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <FacetSectionSkeleton title="Hobbies" />
        <FacetSectionSkeleton title="Nationalities" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FacetSection title="Hobbies" items={data?.hobbies ?? []} emptyMessage="No hobbies found" />
      <FacetSection
        title="Nationalities"
        items={data?.nationalities ?? []}
        emptyMessage="No nationalities found"
      />
    </div>
  );
}

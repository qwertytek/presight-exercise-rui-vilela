export function UserFilters() {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <input
        type="text"
        placeholder="Filter..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
      />
    </div>
  );
}

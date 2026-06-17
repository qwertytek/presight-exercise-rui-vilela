import { useEffect, useState } from 'react';
import { useSearch } from '../providers/SearchProvider';

export function UserFilters() {
  const { setSearchQuery } = useSearch();
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(value);
    }, 300);

    return () => clearTimeout(timeout);
  }, [value, setSearchQuery]);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Filter by name..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
      />
    </div>
  );
}

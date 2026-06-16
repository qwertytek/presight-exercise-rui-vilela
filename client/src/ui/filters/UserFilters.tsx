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

// type Props = {
//     query: string;
//     sortField: "first_name" | "last_name" | "nationality";
//     sortDirection: "asc" | "desc";

//     onQueryChange: (value: string) => void;
//     onSortFieldChange: (value: Props["sortField"]) => void;
//     onSortDirectionChange: (value: Props["sortDirection"]) => void;
//   };

//   export function UserFilters({
//     query,
//     sortField,
//     sortDirection,
//     onQueryChange,
//     onSortFieldChange,
//     onSortDirectionChange,
//   }: Props) {
//     return (
//       <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

//         {/* SEARCH */}
//         <input
//           value={query}
//           onChange={(e) => onQueryChange(e.target.value)}
//           placeholder="Search first or last name..."
//           className="w-full rounded-lg bg-neutral-900 px-3 py-2 outline-none ring-1 ring-neutral-700 focus:ring-2 focus:ring-white"
//         />

//         {/* SORT FIELD */}
//         <select
//           value={sortField}
//           onChange={(e) =>
//             onSortFieldChange(e.target.value as Props["sortField"])
//           }
//           className="rounded-lg bg-neutral-900 px-3 py-2 ring-1 ring-neutral-700"
//         >
//           <option value="first_name">First name</option>
//           <option value="last_name">Last name</option>
//           <option value="nationality">Nationality</option>
//         </select>

//         {/* SORT DIRECTION */}
//         <select
//           value={sortDirection}
//           onChange={(e) =>
//             onSortDirectionChange(e.target.value as Props["sortDirection"])
//           }
//           className="rounded-lg bg-neutral-900 px-3 py-2 ring-1 ring-neutral-700"
//         >
//           <option value="asc">Asc</option>
//           <option value="desc">Desc</option>
//         </select>

//       </div>
//     );
//   }

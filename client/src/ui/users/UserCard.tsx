type UserCardProps = {
  avatarUrl: string;
  firstName: string;
  lastName: string;
  nationality: string;
  age: number;
  hobbies?: string[];
};

export function UserCard({
  avatarUrl,
  firstName,
  lastName,
  nationality,
  age,
  hobbies = [],
}: UserCardProps) {
  const visibleHobbies = hobbies.slice(0, 2);
  const extraCount = hobbies.length - visibleHobbies.length;

  return (
    <div className="w-full max-w-md rounded-xl border border-neutral-700/40 bg-neutral-800/30 p-4 shadow-sm backdrop-blur-md">
      {/* Top row */}
      <div className="flex items-center gap-4">
        <img
          src={avatarUrl}
          alt={`${firstName} ${lastName}`}
          className="h-12 w-12 rounded-full object-cover border border-neutral-700/40"
        />

        <div className="flex flex-1 items-start justify-between">
          <div className="font-medium text-neutral-100">
            {firstName} {lastName}
          </div>

          <div className="text-xs text-neutral-400">{age}</div>
        </div>
      </div>

      {/* Middle row */}
      <div className="mt-2 flex items-center justify-between text-sm text-neutral-400">
        <span>{nationality}</span>
      </div>

      {/* Spacer */}
      <div className="h-6" />

      {/* Bottom row (hobbies) */}
      <div className="flex items-center justify-center gap-2 text-xs">
        {visibleHobbies.map((hobby) => (
          <span
            key={hobby}
            className="rounded-full border border-neutral-700/40 bg-neutral-800/40 px-2 py-1 text-neutral-300"
          >
            {hobby}
          </span>
        ))}

        {extraCount > 0 && <span className="text-neutral-500">+{extraCount}</span>}
      </div>
    </div>
  );
}

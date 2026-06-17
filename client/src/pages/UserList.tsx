import { useUsers, useUsersByName, type UserProps } from '../hooks/users';
import { UserCard } from '../ui/users/UserCard';
import { UserCardSkeleton } from '../ui/users/UserCardSkeleton';
import { LayoutErrorState } from '../ui/states/LayoutErrorState';
import { LayoutEmptyState } from '../ui/states/LayoutEmptyState';
import { useSearch } from '../providers/SearchProvider';

const SKELETON_COUNT = 5;

export function UserLists() {
  const { searchQuery } = useSearch();
  const isSearching = searchQuery.trim().length > 0;

  const allUsers = useUsers();
  const filteredUsers = useUsersByName(searchQuery);

  const { data, isLoading, isError, error, refetch } = isSearching ? filteredUsers : allUsers;

  if (isError) {
    return (
      <LayoutErrorState
        title="Failed to load users"
        description={error instanceof Error ? error.message : 'Unknown error'}
        retry={<button onClick={() => refetch()}>Retry</button>}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl mx-auto">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const users = data?.data ?? [];

  if (users.length === 0) {
    return (
      <LayoutEmptyState
        title="No users found"
        description={
          isSearching
            ? `No users match "${searchQuery}".`
            : 'There are no users to display right now.'
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl mx-auto">
      {users.map(
        (
          { avatar, first_name, last_name, age, nationality, hobbies }: UserProps,
          index: number,
        ) => (
          <UserCard
            key={`${first_name}-${last_name}-${index}`}
            avatarUrl={avatar}
            firstName={first_name}
            lastName={last_name}
            nationality={nationality.name}
            age={age}
            hobbies={hobbies.map((h) => h.name)}
          />
        ),
      )}
    </div>
  );
}

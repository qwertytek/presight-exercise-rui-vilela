import { useUsers, useUsersByName, type UserProps } from '../hooks/users';
import { UserCard } from '../ui/users/UserCard';
import { LayoutLoadingState } from '../ui/states/LayoutLoadingState';
import { LayoutErrorState } from '../ui/states/LayoutErrorState';
import { LayoutEmptyState } from '../ui/states/LayoutEmptyState';
import { useSearch } from '../providers/SearchProvider';

export function UserLists() {
  const { searchQuery } = useSearch();
  const isSearching = searchQuery.trim().length > 0;

  const allUsers = useUsers();
  const filteredUsers = useUsersByName(searchQuery);

  const { data, isLoading, isError, error, refetch } = isSearching ? filteredUsers : allUsers;

  if (isLoading) {
    return <LayoutLoadingState title="Loading users" subtitle="Fetching user list..." />;
  }

  if (isError) {
    return (
      <LayoutErrorState
        title="Failed to load users"
        description={error instanceof Error ? error.message : 'Unknown error'}
        retry={<button onClick={() => refetch()}>Retry</button>}
      />
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
    <div className="space-y-2">
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

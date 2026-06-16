import { useUsers } from '../hooks/users';
import { UserCard } from '../ui/users/UserCard';
import { LayoutLoadingState } from '../ui/states/LayoutLoadingState';
import { LayoutErrorState } from '../ui/states/LayoutErrorState';
import { LayoutEmptyState } from '../ui/states/LayoutEmptyState';

export function UserLists() {
  const { data, isLoading, isError, error, refetch } = useUsers();

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
        description="There are no users to display right now."
      />
    );
  }

  return (
    <div className="space-y-2">
      {users.map(({ avatar, first_name, last_name, age, nationality }, index) => (
        <UserCard
          key={`${first_name}-${last_name}-${index}`}
          avatarUrl={avatar}
          firstName={first_name}
          lastName={last_name}
          nationality={nationality}
          age={age}
        />
      ))}
    </div>
  );
}

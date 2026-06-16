import { getUsers } from '../hooks/users';
import { UserCard } from '../ui/users/UserCard';

export function UserLists() {
  const { data } = getUsers();

  return (
    <div className="space-y-2">
      {data?.data?.map(({ avatar, first_name, last_name, age, nationality }, index: number) => (
        <div key={`${first_name}-${last_name}-${index}`}>
          <UserCard
            avatarUrl={avatar}
            firstName={first_name}
            lastName={last_name}
            nationality={nationality}
            age={age}
          />
        </div>
      ))}
    </div>
  );
}

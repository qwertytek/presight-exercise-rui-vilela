import { AppLayout } from './ui/layout/AppLayout';
import { UserFilters } from './ui/filters/UserFilters';
import { SidebarFacets } from './ui/sidebar/SidebarFacers';
import { UserLists } from './pages/UserList';

const App = () => {
  return (
    <>
      <AppLayout filters={<UserFilters />} sidebar={<SidebarFacets />}>
        <UserLists />
      </AppLayout>
    </>
  );
};

export default App;

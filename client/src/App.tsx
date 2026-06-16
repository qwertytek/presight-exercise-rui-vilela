import { AppLayout } from './ui/layout/AppLayout';
import { UserFilters } from './ui/filters/UserFilters';
import { SidebarFacets } from './ui/sidebar/SidebarFacers';
import { UserLists } from './pages/UserList';
import { QueryProvider } from './providers/QueryProviders';

const App = () => {
  return (
    <QueryProvider>
      <AppLayout filters={<UserFilters />} sidebar={<SidebarFacets />}>
        <UserLists />
      </AppLayout>
    </QueryProvider>
  );
};

export default App;

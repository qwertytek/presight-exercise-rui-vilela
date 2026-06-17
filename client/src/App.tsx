import { AppLayout } from './ui/layout/AppLayout';
import { UserFilters } from './pages/UserFilters';
import { SidebarFacets } from './ui/sidebar/SidebarFacers';
import { UserLists } from './pages/UserList';
import { QueryProvider } from './providers/QueryProviders';
import { SearchProvider } from './providers/SearchProvider';

const App = () => {
  return (
    <QueryProvider>
      <SearchProvider>
        <AppLayout filters={<UserFilters />} sidebar={<SidebarFacets />}>
          <UserLists />
        </AppLayout>
      </SearchProvider>
    </QueryProvider>
  );
};

export default App;

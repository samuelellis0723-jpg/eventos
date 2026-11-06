import { Outlet, useOutletContext } from 'react-router';
import AdminFooter from './admin-footer.jsx';
import AdminHeader from './admin-header.jsx';
import AdminModuleNavigation from './admin-module-navigation.jsx';

export default function AdminPanelLayout() {
  const session = useOutletContext();
  return (
    <div className="admin-app">
      <AdminHeader authenticated csrfToken={session?.csrfToken} />
      <div className="admin-workspace page-shell">
        <aside className="admin-sidebar">
          <p className="admin-sidebar__heading">Administración</p>
          <AdminModuleNavigation />
        </aside>
        <main className="admin-content">
          <Outlet context={session} />
        </main>
      </div>
      <AdminFooter />
    </div>
  );
}

import { BrowserRouter, Route, Routes } from 'react-router';
import HomePage from '../pages/home-page.jsx';
import LoyaltyPage from '../pages/loyalty-page.jsx';
import NotFoundPage from '../pages/not-found-page.jsx';
import SurveysPage from '../pages/surveys-page.jsx';
import AdminAccessDeniedPage from '../pages/admin-access-denied-page.jsx';
import AdminDashboardPage from '../pages/admin-dashboard-page.jsx';
import AdminLoginPage from '../pages/admin-login-page.jsx';
import AdminPanelLayout from '../components/admin/admin-panel-layout.jsx';
import PrivateRoutes from './private-routes.jsx';

export default function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lealtad" element={<LoyaltyPage />} />
        <Route path="/encuestas" element={<SurveysPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<PrivateRoutes />}>
          <Route path="/admin" element={<AdminPanelLayout />}>
            <Route index element={<AdminDashboardPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

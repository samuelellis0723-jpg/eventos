import { Navigate, Outlet } from 'react-router';

// Guard de navegación del frontend. La API debe proteger los datos y las operaciones.
export default function PrivateRoutes({ isAuthenticated = false }) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

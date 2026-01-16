import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = () => {
  // Verificamos si el usuario está autenticado y tiene token
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);

  // Si no hay token o flag de autenticación, redirigir a Login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  // Si todo está bien, renderizar el contenido protegido (Outlet)
  return <Outlet />;
};
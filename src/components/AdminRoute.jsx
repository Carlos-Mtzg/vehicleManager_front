import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="protected-route-loading">
        <LoadingSpinner size="large" message="Verificando permisos..." />
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Si no es admin, redirigir al dashboard
  if (!isAdmin()) {
    return (
      <Navigate 
        to="/dashboard" 
        replace 
      />
    );
  }

  // Si está autenticado y es admin, mostrar el contenido
  return children;
};

export default AdminRoute;

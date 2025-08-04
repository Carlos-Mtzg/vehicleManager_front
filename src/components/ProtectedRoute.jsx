import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="protected-route-loading">
        <LoadingSpinner size="large" message="Verificando autenticación..." />
      </div>
    );
  }

  // Si no está autenticado, redirigir al login con la ubicación actual
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Si está autenticado, mostrar el contenido protegido
  return children;
};

export default ProtectedRoute;
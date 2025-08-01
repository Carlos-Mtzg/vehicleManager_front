import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación al inicializar
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // Verificar que el token no haya expirado
          if (isTokenValid(storedToken)) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else {
            // Token expirado, limpiar datos
            logout();
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Función para validar token (básica, puedes mejorarla)
  const isTokenValid = (token) => {
    try {
      // Si el token es JWT, puedes decodificar y verificar expiración
      // Por ahora, solo verificamos que exista y no esté vacío
      if (!token || token.trim() === '') {
        return false;
      }

      // Opcional: Decodificar JWT y verificar expiración
      // const payload = JSON.parse(atob(token.split('.')[1]));
      // const currentTime = Date.now() / 1000;
      // return payload.exp > currentTime;

      return true;
    } catch {
      return false;
    }
  };

  // Función de login
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      if (response.data && response.data.token) {
        const { token: newToken, user: userData } = response.data;
        
        // Guardar en estado
        setToken(newToken);
        setUser(userData || { username: credentials.username });
        setIsAuthenticated(true);

        // Guardar en localStorage
        authService.setAuthData(newToken, userData || { username: credentials.username });

        return { success: true, data: response.data };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.message || 'Error de autenticación' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    try {
      // Limpiar estado
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);

      // Limpiar localStorage
      authService.logout();

      // Opcional: Redirigir al login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error en logout:', error);
      // Forzar limpieza en caso de error
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  // Función para refrescar datos del usuario
  const refreshUser = () => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  };

  // Valor del contexto
  const value = {
    // Estado
    user,
    token,
    isAuthenticated,
    isLoading,

    // Funciones
    login,
    logout,
    refreshUser,
    isTokenValid: () => isTokenValid(token)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
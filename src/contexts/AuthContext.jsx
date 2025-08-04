import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  // Configuración base de la API
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
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
      
      // Hacer petición de login directamente usando el proxy
      const url = '/auth/login';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.token) {
        const { token: newToken, user: userData } = data;
        
        // Guardar en estado
        setToken(newToken);
        setUser(userData || { username: credentials.username });
        setIsAuthenticated(true);

        // Guardar en localStorage
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('user', JSON.stringify(userData || { username: credentials.username }));

        return { success: true, data };
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
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  // Función para obtener la URL base de la API
  const getApiBaseUrl = () => API_BASE_URL;

  // Función para obtener headers con token
  const getAuthHeaders = () => {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Obtener token del localStorage si no está en el estado
    const currentToken = token || localStorage.getItem('authToken');
    
    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`;
    } else {
      console.warn('No token available for authentication');
    }
    
    return headers;
  };

  // Valor del contexto
  const value = {
    // Estado de autenticación
    user,
    token,
    isAuthenticated,
    isLoading,

    // Funciones de autenticación
    login,
    logout,
    refreshUser,
    isTokenValid: () => isTokenValid(token),

    // Helpers para peticiones
    getApiBaseUrl,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
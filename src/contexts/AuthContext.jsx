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

              if (storedToken) {
        // Verificar que el token no haya expirado
        if (isTokenValid(storedToken)) {
          setToken(storedToken);
          
          // Intentar obtener datos del usuario desde el token
          const userFromToken = getUserFromToken();
          if (userFromToken) {
            setUser(userFromToken);
            // Actualizar localStorage con los datos del usuario
            localStorage.setItem('user', JSON.stringify(userFromToken));
          } else if (storedUser) {
            // Fallback a datos guardados
            setUser(JSON.parse(storedUser));
          }
          
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
        
        // Guardar token
        setToken(newToken);
        localStorage.setItem('authToken', newToken);
        
        // Obtener datos del usuario desde el token
        const userFromToken = getUserFromToken();
        if (userFromToken) {
          setUser(userFromToken);
          localStorage.setItem('user', JSON.stringify(userFromToken));
        } else if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Fallback con datos básicos
          const fallbackUser = { username: credentials.username };
          setUser(fallbackUser);
          localStorage.setItem('user', JSON.stringify(fallbackUser));
        }
        
        setIsAuthenticated(true);

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

  // Función para obtener el ID del usuario desde el token JWT
  const getUserIdFromToken = () => {
    try {
      const currentToken = token || localStorage.getItem('authToken');
      if (currentToken) {
        // Decodificar el token JWT para obtener el payload
        const payload = JSON.parse(atob(currentToken.split('.')[1]));
        return payload.id || payload.userId || payload.sub;
      }
    } catch (error) {
      console.error('Error decoding JWT token:', error);
    }
    return null;
  };

  // Función para obtener datos del usuario desde el token JWT
  const getUserFromToken = () => {
    try {
      const currentToken = token || localStorage.getItem('authToken');
      if (currentToken) {
        const payload = JSON.parse(atob(currentToken.split('.')[1]));
        
        // El sub del JWT es directamente el rol
        const userRole = payload.sub;
        
        return {
          id: userRole, // El rol como ID
          username: userRole, // El rol como username
          role: userRole, // El rol directamente del sub
          email: payload.email || `${userRole.toLowerCase()}@example.com`
        };
      }
    } catch (error) {
      console.error('Error decoding JWT token:', error);
    }
    return null;
  };

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

  // Función para verificar si el usuario es admin
  const isAdmin = () => {
    const currentUser = user || getUserFromToken();
    
    if (!currentUser?.role) {
      return false;
    }
    
    // El rol viene directamente del sub del JWT
    return currentUser.role === 'ADMIN';
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
    getAuthHeaders,
    getUserIdFromToken,
    getUserFromToken,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
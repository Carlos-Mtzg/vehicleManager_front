/**
 * API Service - Servicio HTTP dinámico y escalable
 * Maneja todas las peticiones HTTP de la aplicación de manera centralizada
 */

import { useState } from 'react';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log('Variables de entorno:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL
});

// Configuración por defecto para las peticiones
const DEFAULT_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 segundos
};

/**
 * Clase principal del servicio API
 */
class ApiService {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.interceptors = {
      request: [],
      response: [],
      error: []
    };
  }

  /**
   * Interceptor para peticiones
   */
  addRequestInterceptor(fn) {
    this.interceptors.request.push(fn);
  }

  /**
   * Interceptor para respuestas
   */
  addResponseInterceptor(fn) {
    this.interceptors.response.push(fn);
  }

  /**
   * Interceptor para errores
   */
  addErrorInterceptor(fn) {
    this.interceptors.error.push(fn);
  }

  /**
   * Método principal para realizar peticiones HTTP
   */
  async request(endpoint, options = {}) {
    try {
      // Construir URL completa
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}/${endpoint.replace(/^\//, '')}`;
      
      // Configuración de la petición
      const config = {
        ...DEFAULT_CONFIG,
        ...options,
        headers: {
          ...DEFAULT_CONFIG.headers,
          ...options.headers,
        },
      };

      // Aplicar interceptores de petición
      for (const interceptor of this.interceptors.request) {
        await interceptor(config);
      }

      // Crear controlador de abort para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      config.signal = controller.signal;

      // Realizar la petición
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parsear respuesta JSON
      const data = await response.json();

      // Aplicar interceptores de respuesta
      for (const interceptor of this.interceptors.response) {
        await interceptor(data, response);
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
        ok: response.ok
      };

    } catch (error) {
      // Aplicar interceptores de error
      for (const interceptor of this.interceptors.error) {
        await interceptor(error);
      }

      // Manejo de errores específicos
      if (error.name === 'AbortError') {
        throw new Error('La petición excedió el tiempo límite');
      }

      if (!navigator.onLine) {
        throw new Error('Sin conexión a internet');
      }

      throw error;
    }
  }

  /**
   * Métodos HTTP específicos
   */
  async get(endpoint, params = {}, options = {}) {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseURL}/${endpoint.replace(/^\//, '')}`);
    
    // Agregar parámetros de consulta
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });

    return this.request(url.toString(), {
      method: 'GET',
      ...options
    });
  }

  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  }

  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  }

  async patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  }

  /**
   * Método para subir archivos
   */
  async upload(endpoint, formData, options = {}) {
    const uploadOptions = {
      ...options,
      headers: {
        // No establecer Content-Type para FormData (el navegador lo hace automáticamente)
        ...options.headers
      }
    };

    // Remover Content-Type para FormData
    delete uploadOptions.headers['Content-Type'];

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      ...uploadOptions
    });
  }
}

// Instancia singleton del servicio
const apiService = new ApiService();

// Log de configuración en desarrollo
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    finalBaseURL: API_BASE_URL,
    serviceBaseURL: apiService.baseURL
  });
}

// Interceptores globales
apiService.addRequestInterceptor(async (config) => {
  // Agregar token de autenticación si existe
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    
    // Log del token en desarrollo (solo primeros caracteres por seguridad)
    if (import.meta.env.DEV) {
      console.log('🔑 Token agregado:', token.substring(0, 20) + '...');
    }
  } else if (import.meta.env.DEV) {
    console.warn('⚠️ No se encontró token de autenticación');
  }
  
  // Log de peticiones en desarrollo
  if (import.meta.env.DEV) {
    console.log('🚀 API Request:', {
      method: config.method || 'GET',
      url: config.url || 'No URL',
      headers: config.headers,
      hasToken: !!token
    });
  }
});

apiService.addResponseInterceptor(async (data, response) => {
  // Log de respuestas en desarrollo
  if (import.meta.env.DEV) {
    console.log('✅ API Response:', { data, status: response.status });
  }
});

apiService.addErrorInterceptor(async (error) => {
  // Log de errores
  console.error('❌ API Error:', error);
  
  // Manejo global de errores de autenticación
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    // Limpiar datos de autenticación
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Redirigir al login solo si no estamos ya en login
    if (window.location.pathname !== '/login') {
      console.warn('🔒 Sesión expirada, redirigiendo al login');
      window.location.href = '/login';
    }
  }
  
  // Manejo de errores de red
  if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    console.error('🌐 Error de conexión de red');
  }
});

/**
 * Servicios específicos para cada entidad
 */
export const vehicleService = {
  getAll: (params = {}) => {
    if (import.meta.env.DEV) {
      console.log('🚗 VehicleService.getAll - Base URL:', apiService.baseURL);
      console.log('🚗 Full URL will be:', `${apiService.baseURL}/vehicle`);
    }
    return apiService.get('vehicle', params);
  },
  getById: (id) => {
    if (import.meta.env.DEV) {
      console.log('🚗 VehicleService.getById - URL:', `${apiService.baseURL}/vehicle/${id}`);
    }
    return apiService.get(`vehicle/${id}`);
  },
  create: (data) => apiService.post('vehicle', data),
  update: (id, data) => apiService.put(`vehicle/${id}`, data),
  delete: (id) => apiService.delete(`vehicle/${id}`),
};

export const brandService = {
  getAll: (params = {}) => apiService.get('brand', params),
  getById: (id) => apiService.get(`brand/${id}`),
  create: (data) => apiService.post('brand', data),
  update: (id, data) => apiService.put(`brand/${id}`, data),
  delete: (id) => apiService.delete(`brand/${id}`),
};

export const clientService = {
  getAll: (params = {}) => apiService.get('client', params),
  getById: (id) => apiService.get(`client/${id}`),
  create: (data) => apiService.post('client', data),
  update: (id, data) => apiService.put(`client/${id}`, data),
  delete: (id) => apiService.delete(`client/${id}`),
};

export const authService = {
  login: async (credentials) => {
    try {
      // Usar la instancia principal pero con endpoint de auth
      // Construir URL base para auth (sin /api si existe)
      const authBaseUrl = API_BASE_URL.replace('/api', '');
      const authApiService = new ApiService(authBaseUrl);
      const response = await authApiService.post('auth/login', credentials);
      
      // Log para debug
      if (import.meta.env.DEV) {
        console.log('🔐 Login response:', response);
      }
      
      return response;
    } catch (error) {
      console.error('🚫 Login error:', error);
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return Promise.resolve();
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },
  setAuthData: (token, user) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Hook personalizado para manejar estado de carga y errores
export const createApiHook = (serviceMethod) => {
  return () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const response = await serviceMethod(...args);
        setData(response.data);
        return response;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    return { data, loading, error, execute };
  };
};

// Función de debug para verificar configuración
export const debugApiConfig = () => {
  if (import.meta.env.DEV) {
    console.group('🔍 API Debug Info');
    console.log('📁 Environment Variables:');
    console.log('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('  NODE_ENV:', import.meta.env.NODE_ENV);
    console.log('  DEV:', import.meta.env.DEV);
    
    console.log('\n🔗 API Configuration:');
    console.log('  API_BASE_URL constant:', API_BASE_URL);
    console.log('  apiService.baseURL:', apiService.baseURL);
    
    console.log('\n🔑 Authentication:');
    const token = localStorage.getItem('authToken');
    console.log('  Has token:', !!token);
    if (token) {
      console.log('  Token preview:', token.substring(0, 20) + '...');
    }
    
    console.log('\n🌐 Expected URLs:');
    console.log('  Vehicle API:', `${apiService.baseURL}/vehicle`);
    console.log('  Auth API:', `${API_BASE_URL.replace('/api', '')}/auth/login`);
    
    console.groupEnd();
  }
};

// Función para probar la conexión
export const testConnection = async () => {
  if (import.meta.env.DEV) {
    console.log('🧪 Testing API connection...');
    try {
      const response = await vehicleService.getAll();
      console.log('✅ Connection test successful:', response);
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
};

export default apiService; 
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [focusedField, setFocusedField] = useState('');
  const [error, setError] = useState('');
  
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limpiar error cuando el usuario empiece a escribir
    if (error) {
      setError('');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  // Validaciones para username
  const validateUsername = (username) => {
    if (!username) {
      return 'El nombre de usuario es requerido';
    }
    if (username.length < 3) {
      return 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    if (username.length > 20) {
      return 'El nombre de usuario no puede exceder 20 caracteres';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'El nombre de usuario solo puede contener letras, números y guiones bajos';
    }
    return null;
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'La contraseña es requerida';
    }
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setError('');
    
    // Validar campos
    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);
    
    if (usernameError) {
      setError(usernameError);
      return;
    }
    
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    // Usar el login del contexto
    const result = await login({
      username: formData.username.trim(),
      password: formData.password
    });
    
    if (!result.success) {
      // Manejar diferentes tipos de errores
      if (result.error.includes('401') || result.error.includes('Unauthorized')) {
        setError('Usuario o contraseña incorrectos');
      } else if (result.error.includes('400')) {
        setError('Datos de entrada inválidos');
      } else if (result.error.includes('timeout') || result.error.includes('tiempo límite')) {
        setError('Conexión agotada. Inténtelo de nuevo');
      } else if (result.error.includes('Sin conexión')) {
        setError('Sin conexión a internet. Verifique su conexión');
      } else {
        setError('Error de conexión. Inténtelo de nuevo más tarde');
      }
    }
    // Si es exitoso, el useEffect se encarga de la redirección
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Branding & Information */}
        <div className="login-image-section">
          <div className="image-content">
            <div className="brand-header">
              <img 
                src={logo} 
                alt="Vehicle Manager Logo" 
                className="login-illustration"
              />
              <div className="brand-text">
                <h1 className="brand-title">Vehicle Manager</h1>
                <p className="brand-subtitle">
                  Sistema integral de gestión vehicular
                </p>
              </div>
            </div>
            
            <div className="image-overlay">
              <div className="feature-points">
                <div className="feature-point">
                  <span className="feature-icon">🚗</span>
                  <span>Control total de vehículos</span>
                </div>
                <div className="feature-point">
                  <span className="feature-icon">📊</span>
                  <span>Reportes detallados</span>
                </div>
                <div className="feature-point">
                  <span className="feature-icon">🔧</span>
                  <span>Gestión de mantenimiento</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="form-container">
            <div className="form-header">
              <h3>Bienvenido de vuelta</h3>
              <p>Ingresa tus credenciales para acceder al sistema</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Mostrar error general si existe */}
              {error && (
                <div className="login-error">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              
              <div className={`form-group ${focusedField === 'username' ? 'focused' : ''} ${formData.username ? 'filled' : ''}`}>
                <label htmlFor="username">Nombre de Usuario</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => handleFocus('username')}
                    onBlur={handleBlur}
                    placeholder="mi_usuario"
                    disabled={isLoading}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className={`form-group ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'filled' : ''}`}>
                <label htmlFor="password">Contraseña</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="login-spinner">🔄</span>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <span className="button-icon">→</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 
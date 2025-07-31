import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [focusedField, setFocusedField] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validación básica
    if (!formData.email || !formData.password) {
      alert('Por favor, completa todos los campos');
      return;
    }
    
    // Simular loading y navegación
    navigate('/dashboard');
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
              <div className={`form-group ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'filled' : ''}`}>
                <label htmlFor="email">Correo Electrónico</label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    placeholder="tu@email.com"
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
                    required
                  />
                </div>
              </div>

              <button type="submit" className="login-button">
                <span>Iniciar Sesión</span>
                <span className="button-icon">→</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 
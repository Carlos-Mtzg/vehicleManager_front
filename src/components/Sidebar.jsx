import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';
import LogoutConfirmationModal from './LogoutConfirmationModal';

const Sidebar = ({ isMobileMenuOpen, closeMobileMenu }) => {
  const { logout, user, isAdmin } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    closeMobileMenu(); // Cerrar menú móvil si está abierto
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };


  
  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/dashboard/vehicles',
      label: 'Vehículos',
      icon: '🚗'
    },
    {
      path: '/dashboard/brands',
      label: 'Marcas',
      icon: '🏷️'
    },
    {
      path: '/dashboard/clients',
      label: 'Clientes',
      icon: '👥'
    },
    {
      path: '/dashboard/services',
      label: 'Servicios',
      icon: '🔧'
    },
    // Opción de empleados solo para administradores
    ...(isAdmin() ? [{
      path: '/dashboard/employees',
      label: 'Empleados',
      icon: '👨‍💼'
    }] : [])
  ];

  return (
    <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <img src={logo} alt="Vehicle Manager Logo" className="logo-image" />
          </div>
          <h3>Vehicle Manager</h3>
        </div>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            <li 
              key={item.path}
              style={{ animationDelay: `${(index + 1) * 0.1}s` }}
            >
              <NavLink 
                to={item.path} 
                className={({ isActive }) => 
                  isActive ? 'nav-link active' : 'nav-link'
                }
                end={item.path === '/dashboard'}
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        {/* Información del usuario */}
        <div className="user-info">
          <div className="user-avatar">
            <span>👤</span>
          </div>
          <div className="user-details">
            <span className="user-name">{user?.username || 'Usuario'}</span>
          </div>
        </div>
        
        {/* Botón de perfil */}
        <button className="profile-button" onClick={() => window.location.href = '/dashboard/profile'}>
          <span className="profile-icon">👤</span>
          <span className="profile-label">Ver Perfil</span>
        </button>
        
        {/* Botón de logout */}
        <button className="logout-button" onClick={handleLogoutClick}>
          <span className="logout-icon">🚪</span>
          <span className="logout-label">Cerrar Sesión</span>
        </button>
      </div>

      {/* Modal de confirmación de logout */}
      {showLogoutModal && (
        <LogoutConfirmationModal
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
          isLoading={isLoggingOut}
        />
      )}
    </div>
  );
};

export default Sidebar; 
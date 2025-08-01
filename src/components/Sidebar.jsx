import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

const Sidebar = ({ isMobileMenuOpen, closeMobileMenu }) => {
  const { logout, user } = useAuth();
  
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
      closeMobileMenu(); // Cerrar menú móvil si está abierto
    }
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
    }
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
            <span className="user-role">Administrador</span>
          </div>
        </div>
        
        {/* Botón de logout */}
        <button className="logout-button" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          <span className="logout-label">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 
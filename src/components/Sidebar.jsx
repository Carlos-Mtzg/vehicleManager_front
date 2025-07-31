import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Sidebar = ({ isMobileMenuOpen, closeMobileMenu }) => {
  const navigate = useNavigate();
  
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
      icon: '🌐'
    },
    {
      path: '/dashboard/clients',
      label: 'Clientes',
      icon: '👤'
    }
  ];

  const handleLogout = () => {
    // Add logout logic here
    closeMobileMenu && closeMobileMenu();
    navigate('/');
  };

  const handleNavClick = () => {
    // Close mobile menu when navigating
    closeMobileMenu && closeMobileMenu();
  };

  return (
    <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img 
            src={logo} 
            alt="Vehicle Manager Logo" 
            className="sidebar-logo"
          />
          <h3>Vehicle Manager</h3>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            <li key={item.path} style={{ animationDelay: `${index * 0.1}s` }}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => 
                  isActive ? 'nav-link active' : 'nav-link'
                }
                end={item.path === '/dashboard'}
                onClick={handleNavClick}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          <span className="logout-icon">🚪</span>
          <span className="logout-label">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 
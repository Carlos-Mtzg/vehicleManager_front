import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const navigate = useNavigate();
  
  return (
    <div className="dashboard-home">
      <h1>Bienvenido Usuario</h1>
      <p>Panel de control integral para la gestión de vehículos, supervisa el estado general de tu flota desde un solo lugar.</p>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Vehículos</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Vehículos Vendidos</h3>
          <p className="stat-number">0</p>
        </div>
      </div>

      <div className="content-grid">
        <div className="page-card">
          <h2>Accesos Rápidos</h2>
          <p>Funciones principales del sistema de gestión vehicular.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button className="action-button-secondary" onClick={() => navigate('/dashboard/vehicles')}>
              <span>🚗</span>
              Registrar Vehículo
            </button>
            <button className="action-button-secondary" onClick={() => navigate('/dashboard/brands')}>
              <span>🌐</span>
              Registrar Marca
            </button>
            <button className="action-button-secondary" onClick={() => navigate('/dashboard/clients')}>
              <span>👤</span>
              Registrar Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 
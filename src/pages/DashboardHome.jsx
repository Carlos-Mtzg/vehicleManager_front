import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { getApiBaseUrl, getAuthHeaders } = useAuth();
  
  // Estados para los conteos
  const [totalVehicles, setTotalVehicles] = useState(null);
  const [soldVehicles, setSoldVehicles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadVehicleStats();
  }, [getApiBaseUrl, getAuthHeaders]);

  const loadVehicleStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Llamadas paralelas a ambos endpoints
      const [availableResponse, soldResponse] = await Promise.all([
        fetch(`${getApiBaseUrl()}/vehicle/available/count`, {
          method: 'GET',
          headers: getAuthHeaders(),
        }),
        fetch(`${getApiBaseUrl()}/vehicle/sold/count`, {
          method: 'GET',
          headers: getAuthHeaders(),
        })
      ]);

      // Verificar respuestas
      if (!availableResponse.ok) {
        throw new Error(`Error al cargar vehículos disponibles: ${availableResponse.status}`);
      }
      if (!soldResponse.ok) {
        throw new Error(`Error al cargar vehículos vendidos: ${soldResponse.status}`);
      }

      // Procesar datos
      const availableData = await availableResponse.json();
      const soldData = await soldResponse.json();

      console.log('Datos de vehículos disponibles:', availableData);
      console.log('Datos de vehículos vendidos:', soldData);

      setTotalVehicles(availableData?.data ?? 0);
      setSoldVehicles(soldData?.data ?? 0);

    } catch (err) {
      console.error('Error loading vehicle stats:', err);
      setError(err.message);
      // Valores por defecto en caso de error
      setTotalVehicles(0);
      setSoldVehicles(0);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="dashboard-home">
      <h1>Bienvenido Usuario</h1>
      <p>Panel de control integral para la gestión de vehículos, supervisa el estado general de tu flota desde un solo lugar.</p>
      
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>Error al cargar estadísticas: {error}</span>
          <button 
            onClick={loadVehicleStats} 
            className="retry-btn"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Reintentar'}
          </button>
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Vehículos</h3>
            <span className="stat-icon">🚗</span>
          </div>
          <div className="stat-content">
            {loading ? (
              <LoadingSpinner size="small" />
            ) : (
              <p className="stat-number">{totalVehicles}</p>
            )}
            <p className="stat-label">Disponibles</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Vehículos Vendidos</h3>
            <span className="stat-icon">💰</span>
          </div>
          <div className="stat-content">
            {loading ? (
              <LoadingSpinner size="small" />
            ) : (
              <p className="stat-number">{soldVehicles}</p>
            )}
            <p className="stat-label">Vendidos</p>
          </div>
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
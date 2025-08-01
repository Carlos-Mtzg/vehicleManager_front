import { useState } from 'react';

const VehicleCard = ({ vehicle, onEdit, onDelete, onSell }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return 'No disponible';
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Obtener estado del vehículo
  const getVehicleStatus = () => {
    if (vehicle.sale_date) {
      return { label: 'Vendido', type: 'sold' };
    } else {
      return { label: 'Disponible', type: 'available' };
    }
  };

  const status = getVehicleStatus();

  return (
    <div 
      className={`vehicle-card-compact ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header con información principal */}
      <div className="vehicle-header">
        <div className="vehicle-main-info">
          <div className="vehicle-brand-model">
            <h3 className="vehicle-title">
              {vehicle.brand?.name} {vehicle.model}
            </h3>
            <div className="vehicle-id">ID: {vehicle.id}</div>
          </div>
          <div className="vehicle-price-tag">
            {formatPrice(vehicle.price)}
          </div>
        </div>
        
        <div className={`vehicle-status status-${status.type}`}>
          <span className="status-dot"></span>
          <span className="status-label">{status.label}</span>
        </div>
      </div>

      {/* Información detallada */}
      <div className="vehicle-details-grid">
        <div className="detail-item">
          <span className="detail-icon">🎨</span>
          <div className="detail-content">
            <span className="detail-label">Color</span>
            <span className="detail-value">{vehicle.color}</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">📅</span>
          <div className="detail-content">
            <span className="detail-label">Registro</span>
            <span className="detail-value">{formatDate(vehicle.registration_date)}</span>
          </div>
        </div>

        {vehicle.sale_date && (
          <div className="detail-item">
            <span className="detail-icon">💰</span>
            <div className="detail-content">
              <span className="detail-label">Fecha de Venta</span>
              <span className="detail-value">{formatDate(vehicle.sale_date)}</span>
            </div>
          </div>
        )}

        {vehicle.customer && (
          <div className="detail-item">
            <span className="detail-icon">👤</span>
            <div className="detail-content">
              <span className="detail-label">Cliente</span>
              <span className="detail-value">{vehicle.customer.name || 'Cliente Asignado'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      <div className="vehicle-actions-footer">
        {status.type === 'available' ? (
          <div className="actions-available">
            <button 
              className="action-btn edit-btn"
              onClick={() => onEdit?.(vehicle)}
              title="Editar vehículo"
            >
              <span className="btn-icon">✏️</span>
              <span className="btn-text">Editar</span>
            </button>
            
            <button 
              className="action-btn sell-btn"
              onClick={() => onSell?.(vehicle)}
              title="Vender vehículo"
            >
              <span className="btn-icon">💰</span>
              <span className="btn-text">Vender</span>
            </button>
            
            <button 
              className="action-btn delete-btn"
              onClick={() => onDelete?.(vehicle)}
              title="Eliminar vehículo"
            >
              <span className="btn-icon">🗑️</span>
            </button>
          </div>
        ) : (
          <div className="actions-sold">
            <div className="sold-indicator">
              <span className="sold-icon">✅</span>
              <span className="sold-text">Vehículo Vendido</span>
            </div>
            
            <button 
              className="action-btn delete-btn"
              onClick={() => onDelete?.(vehicle)}
              title="Eliminar registro"
            >
              <span className="btn-icon">🗑️</span>
            </button>
          </div>
        )}
      </div>

      {/* Indicador de hover */}
      <div className="hover-indicator"></div>
    </div>
  );
};

export default VehicleCard; 
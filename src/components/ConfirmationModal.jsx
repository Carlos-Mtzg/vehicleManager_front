import { useEffect } from 'react';
import Modal from './Modal';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar acción",
  message = "¿Estás seguro de que deseas continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning", // 'warning', 'danger', 'info'
  vehicle = null,
  isLoading = false
}) => {

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen || isLoading) return;
    
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '🗑️',
          iconClass: 'confirmation-icon-danger',
          titleClass: 'confirmation-title-danger',
          confirmClass: 'btn-danger'
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconClass: 'confirmation-icon-warning',
          titleClass: 'confirmation-title-warning',
          confirmClass: 'btn-warning'
        };
      case 'success':
        return {
          icon: '✅',
          iconClass: 'confirmation-icon-success',
          titleClass: 'confirmation-title-success',
          confirmClass: 'btn-success'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          iconClass: 'confirmation-icon-info',
          titleClass: 'confirmation-title-info',
          confirmClass: 'btn-primary'
        };
      default:
        return {
          icon: '❓',
          iconClass: 'confirmation-icon-warning',
          titleClass: 'confirmation-title-warning',
          confirmClass: 'btn-warning'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      size="small"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
      showCloseButton={!isLoading}
    >
      <div className="confirmation-modal">
        {/* Icono y Título */}
        <div className="confirmation-header">
          <div className={`confirmation-icon ${typeStyles.iconClass}`}>
            {typeStyles.icon}
          </div>
          <h3 className={`confirmation-title ${typeStyles.titleClass}`}>
            {title}
          </h3>
        </div>

        {/* Mensaje */}
        <div className="confirmation-content">
          <p className="confirmation-message">
            {message}
          </p>
          
          {/* Información del vehículo si está disponible */}
          {vehicle && (
            <div className="confirmation-vehicle-info">
              <div className="vehicle-info-card">
                <div className="vehicle-info-header">
                  <span className="vehicle-brand">{vehicle.brand?.name}</span>
                  <span className="vehicle-model">{vehicle.model}</span>
                </div>
                <div className="vehicle-info-details">
                  <span className="vehicle-detail">
                    <span className="detail-label">Color:</span>
                    <span className="detail-value">{vehicle.color}</span>
                  </span>
                  <span className="vehicle-detail">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">#{vehicle.id}</span>
                  </span>
                  {vehicle.price && (
                    <span className="vehicle-detail">
                      <span className="detail-label">Precio:</span>
                      <span className="detail-value price">
                        ${vehicle.price.toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} MXN
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="confirmation-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`${typeStyles.confirmClass}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner">🔄</span>
                Procesando...
              </>
            ) : (
              <>
                <span className="btn-icon">{typeStyles.icon}</span>
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal; 
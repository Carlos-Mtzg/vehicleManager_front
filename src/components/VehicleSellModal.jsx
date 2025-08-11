import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

const VehicleSellModal = ({ isOpen, onClose, vehicle, onVehicleSold }) => {
  const { getApiBaseUrl, getAuthHeaders } = useAuth();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    customerId: ''
  });
  
  // Estados de la aplicación
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Cargar clientes al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      customerId: ''
    });
    setError(null);
    setValidationErrors({});
    setShowConfirmation(false);
  };

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await fetch(`${getApiBaseUrl()}/customer`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al cargar clientes: ${response.status}`);
      }

      const data = await response.json();
      setCustomers(data?.data || []);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Error al cargar los clientes disponibles');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validar cliente
    if (!formData.customerId) {
      errors.customerId = 'Debe seleccionar un cliente';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error de validación para este campo
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Limpiar error general
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSell = async () => {
    try {
      setSaving(true);
      setError(null);

      const sellData = {
        vehicleId: vehicle.id,
        customerId: parseInt(formData.customerId),
        serviceIds: vehicle.services?.map(service => service.id) || []
      };

      const response = await fetch(`${getApiBaseUrl()}/sale`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sellData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada');
        }
        if (response.status === 403) {
          throw new Error('Acceso denegado');
        }
        if (response.status === 404) {
          throw new Error('Vehículo o cliente no encontrado');
        }
        if (response.status === 409) {
          throw new Error('El vehículo ya ha sido vendido');
        }
        throw new Error(`Error al vender el vehículo: HTTP ${response.status}`);
      }

      // Éxito - cerrar modal y notificar
      onVehicleSold();
      onClose();

    } catch (err) {
      setError(err.message);
      setShowConfirmation(false);
    } finally {
      setSaving(false);
    }
  };

  const getSelectedCustomerName = () => {
    const customer = customers.find(c => c.id.toString() === formData.customerId);
    return customer?.full_name || '';
  };

  const handleClose = () => {
    if (!saving) {
      setShowConfirmation(false);
      onClose();
    }
  };

  if (!isOpen || !vehicle) return null;

  // Modal de confirmación
  if (showConfirmation) {
    return (
      <Modal isOpen={true} onClose={!saving ? () => setShowConfirmation(false) : undefined} title="Confirmar Venta de Vehículo">
        <div className="confirmation-modal">
          <div className="confirmation-header">
            <div className="confirmation-icon">💰</div>
            <h3>¿Confirmar la venta de este vehículo?</h3>
          </div>

          <div className="vehicle-summary">
            <div className="summary-item">
              <span className="label">Vehículo:</span>
              <span className="value">{vehicle.brand?.name} {vehicle.model}</span>
            </div>
            <div className="summary-item">
              <span className="label">Color:</span>
              <span className="value">{vehicle.color}</span>
            </div>
            <div className="summary-item">
              <span className="label">Precio:</span>
              <span className="value">${vehicle.price?.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Cliente:</span>
              <span className="value">{getSelectedCustomerName()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Servicios:</span>
              <span className="value">
                {vehicle.services && vehicle.services.length > 0 
                  ? vehicle.services.map(service => service.code).join(', ')
                  : 'Sin servicios'
                }
              </span>
            </div>
          </div>

          <div className="confirmation-actions">
            <button
              type="button"
              onClick={() => setShowConfirmation(false)}
              className="btn btn-secondary"
              disabled={saving}
            >
              Volver a Editar
            </button>
            
            <button
              type="button"
              onClick={handleConfirmSell}
              className="btn btn-success"
              disabled={saving}
            >
              {saving ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Vendiendo vehículo...</span>
                </>
              ) : (
                <span>Sí, Vender Vehículo</span>
              )}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  // Modal principal del formulario
  return (
    <Modal isOpen={true} onClose={handleClose} title="Vender Vehículo">
      <div className="vehicle-sell-modal">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="vehicle-info">
          <h3>{vehicle.brand?.name} {vehicle.model}</h3>
          <p>Color: {vehicle.color} | Precio: ${vehicle.price?.toLocaleString()}</p>
        </div>

        <form onSubmit={handleSubmit} className="sell-form">
          {/* Cliente */}
          <div className="form-group">
            <label htmlFor="customerId" className="form-label">
              Cliente *
            </label>
            {loadingCustomers ? (
              <div className="loading-customers">
                <LoadingSpinner size="small" />
                <span>Cargando clientes...</span>
              </div>
            ) : (
              <div className="input-container">
                <div className="input-icon">👤</div>
                <select
                  id="customerId"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleChange}
                  className={`form-select ${validationErrors.customerId ? 'error' : ''}`}
                  disabled={saving}
                  required
                >
                  <option value="">Seleccionar cliente...</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {validationErrors.customerId && (
              <span className="field-error">{validationErrors.customerId}</span>
            )}
          </div>

          {/* Información adicional */}
          <div className="sale-info">
            <div className="info-item">
              <span className="info-label">Precio del vehículo:</span>
              <span className="info-value">${vehicle.price?.toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Servicios incluidos:</span>
              <span className="info-value">
                {vehicle.services && vehicle.services.length > 0 
                  ? vehicle.services.map(service => service.code).join(', ')
                  : 'Sin servicios'
                }
              </span>
            </div>
            <div className="info-note">
              <span className="note-icon">ℹ️</span>
              <span>La fecha de venta se establecerá automáticamente</span>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={saving}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="btn btn-success"
              disabled={saving || loadingCustomers}
            >
              Vender Vehículo
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .vehicle-sell-modal {
          padding: 1.5rem;
        }

        .vehicle-info {
          background: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .vehicle-info h3 {
          margin: 0 0 0.5rem 0;
          color: var(--color-text);
          font-size: 1.2rem;
        }

        .vehicle-info p {
          margin: 0;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }

        .sell-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .error-icon {
          font-size: 1.1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-weight: 600;
          color: var(--color-text);
          font-size: 0.9rem;
        }

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          font-size: 1.1rem;
          color: var(--color-text-muted);
          pointer-events: none;
          z-index: 1;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 2px solid var(--color-border);
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: var(--color-surface);
          color: var(--color-text);
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
        }

        .form-input.error, .form-select.error {
          border-color: var(--color-danger);
        }

        .form-input:disabled, .form-select:disabled {
          background: var(--color-surface-alt);
          color: var(--color-text-muted);
          cursor: not-allowed;
        }

        .field-error {
          color: var(--color-danger);
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .loading-customers {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-border);
        }

        /* Confirmation Modal Styles */
        .confirmation-modal {
          padding: 1.5rem;
          text-align: center;
        }

        .confirmation-header {
          margin-bottom: 2rem;
        }

        .confirmation-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
        }

        .confirmation-header h3 {
          color: var(--color-text);
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .vehicle-summary {
          background: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1.5rem 0;
          text-align: left;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
        }

        .summary-item:not(:last-child) {
          border-bottom: 1px solid var(--color-border-light);
        }

        .summary-item .label {
          font-weight: 500;
          color: var(--color-text-muted);
        }

        .summary-item .value {
          font-weight: 600;
          color: var(--color-text);
        }

        .price-value {
          color: var(--color-success);
          font-size: 1.1rem;
        }

        .confirmation-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 120px;
          justify-content: center;
          font-size: 0.9rem;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f8fafc;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
        }

        @media (max-width: 480px) {
          .vehicle-sell-modal {
            padding: 1rem;
          }
          
          .form-actions, .confirmation-actions {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }
        }
      `}</style>
    </Modal>
  );
};

VehicleSellModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  vehicle: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    model: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    brand: PropTypes.shape({
      name: PropTypes.string,
    }),
  }),
  onVehicleSold: PropTypes.func.isRequired,
};

export default VehicleSellModal;

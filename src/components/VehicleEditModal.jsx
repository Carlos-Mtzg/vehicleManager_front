import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const VehicleEditModal = ({ isOpen, onClose, vehicleId, onVehicleUpdated }) => {
  const { getApiBaseUrl, getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);
  const [services, setServices] = useState([]);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [formData, setFormData] = useState({
    model: '',
    color: '',
    price: '',
    brand_id: '',
    serviceIds: []
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Función para cargar datos del vehículo (definida antes del useEffect)
  const loadVehicleData = useCallback(async () => {
    if (!vehicleId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${getApiBaseUrl()}/vehicle/${vehicleId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.data) {
        const vehicle = data.data;
        setVehicleInfo(vehicle);
        setFormData({
          model: vehicle.model || '',
          color: vehicle.color || '',
          price: vehicle.price || '',
          brand_id: vehicle.brand?.id || '',
          serviceIds: vehicle.services?.map(service => service.id) || []
        });
      }
    } catch (err) {
      setError('Error al cargar los datos del vehículo: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [vehicleId, getApiBaseUrl, getAuthHeaders]);

  const loadBrands = useCallback(async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/brand`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.data) {
          setBrands(data.data);
        }
      }
    } catch (err) {
      console.error('Error loading brands:', err);
      // No es crítico si no se pueden cargar las marcas
    }
  }, [getApiBaseUrl, getAuthHeaders]);

  const loadServices = useCallback(async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/service`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.data) {
          setServices(data.data);
        }
      }
    } catch (err) {
      console.error('Error loading services:', err);
      // No es crítico si no se pueden cargar los servicios
    }
  }, [getApiBaseUrl, getAuthHeaders]);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && vehicleId) {
      loadVehicleData();
      loadBrands();
      loadServices();
    }
  }, [isOpen, vehicleId, loadVehicleData, loadBrands, loadServices]);

  // Limpiar formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        model: '',
        color: '',
        price: '',
        brand_id: '',
        serviceIds: []
      });
      setValidationErrors({});
      setError(null);
      setVehicleInfo(null);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleServiceChange = (serviceId) => {
    setFormData(prev => {
      const currentServices = prev.serviceIds;
      const serviceIdNum = parseInt(serviceId);
      
      if (currentServices.includes(serviceIdNum)) {
        // Remover servicio si ya está seleccionado
        return {
          ...prev,
          serviceIds: currentServices.filter(id => id !== serviceIdNum)
        };
      } else {
        // Agregar servicio si no está seleccionado
        return {
          ...prev,
          serviceIds: [...currentServices, serviceIdNum]
        };
      }
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.model.trim()) {
      errors.model = 'El modelo es requerido';
    }
    
    if (!formData.color.trim()) {
      errors.color = 'El color es requerido';
    }
    

    
    if (!formData.price || formData.price <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
    }
    
    if (!formData.brand_id) {
      errors.brand_id = 'Selecciona una marca';
    }
    

    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Preparar datos para envío
      const updateData = {
        model: formData.model.trim(),
        color: formData.color.trim(),
        price: parseFloat(formData.price),
        brand_id: parseInt(formData.brand_id),
        serviceIds: formData.serviceIds
      };
      
      const response = await fetch(`${getApiBaseUrl()}/vehicle/${vehicleId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Notificar éxito y cerrar modal
      onVehicleUpdated?.();
      onClose();
      
    } catch (err) {
      setError('Error al actualizar el vehículo: ' + err.message);
    } finally {
      setSaving(false);
    }
  };



  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="modal-title-custom">
          <span className="modal-title-label">Editando</span>
          <span className="modal-title-vehicle">
            {vehicleInfo ? `${vehicleInfo.brand?.name} ${vehicleInfo.model}` : `Vehículo #${vehicleId}`}
          </span>
        </div>
      }
      size="large"
      closeOnOverlayClick={!saving}
      closeOnEscape={!saving}
    >
      {loading ? (
        <div className="modal-loading">
          <LoadingSpinner size="large" message="Cargando datos del vehículo..." />
        </div>
      ) : error ? (
        <ErrorMessage error={error} onRetry={loadVehicleData} />
      ) : (
        <form onSubmit={handleSubmit} className="vehicle-edit-form">
          <div className="form-grid">
            {/* Modelo */}
            <div className="form-group">
              <label htmlFor="model">Modelo *</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className={validationErrors.model ? 'error' : ''}
                placeholder="Ej: Corolla, Civic, Focus"
                disabled={saving}
              />
              {validationErrors.model && (
                <span className="field-error">{validationErrors.model}</span>
              )}
            </div>

            {/* Marca */}
            <div className="form-group">
              <label htmlFor="brand_id">Marca *</label>
              <select
                id="brand_id"
                name="brand_id"
                value={formData.brand_id}
                onChange={handleInputChange}
                className={validationErrors.brand_id ? 'error' : ''}
                disabled={saving}
              >
                <option value="">Seleccionar marca</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {validationErrors.brand_id && (
                <span className="field-error">{validationErrors.brand_id}</span>
              )}
            </div>

            {/* Color */}
            <div className="form-group">
              <label htmlFor="color">Color *</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className={validationErrors.color ? 'error' : ''}
                placeholder="Ej: Rojo, Azul, Negro"
                disabled={saving}
              />
              {validationErrors.color && (
                <span className="field-error">{validationErrors.color}</span>
              )}
            </div>

            {/* Precio */}
            <div className="form-group">
              <label htmlFor="price">Precio *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={validationErrors.price ? 'error' : ''}
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={saving}
              />
              {validationErrors.price && (
                <span className="field-error">{validationErrors.price}</span>
              )}
            </div>
          </div>

          {/* Servicios */}
          <div className="form-group">
            <label>Servicios Asociados</label>
            <div className="services-selection">
              {services.length > 0 ? (
                <div className="services-grid">
                  {services.map(service => (
                    <div
                      key={service.id}
                      className={`service-option ${formData.serviceIds.includes(service.id) ? 'selected' : ''}`}
                      onClick={() => handleServiceChange(service.id)}
                    >
                      <div className="service-option-header">
                        <div className="service-code">{service.code}</div>
                        <div className="service-checkbox">
                          {formData.serviceIds.includes(service.id) ? '✓' : ''}
                        </div>
                      </div>
                      <div className="service-name">{service.name}</div>
                      <div className="service-price">${service.price}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-services">
                  <span>No hay servicios disponibles</span>
                </div>
              )}
            </div>
            <div className="services-note">
              <span className="note-icon">ℹ️</span>
              <span>Selecciona los servicios que tendrá este vehículo (opcional)</span>
            </div>
          </div>

          {/* Mostrar error general si existe */}
          {error && (
            <div className="form-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Botones de acción */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="btn-spinner">🔄</span>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="btn-icon">💾</span>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <style jsx>{`
        /* Services Selection Styles */
        .services-selection {
          margin-top: 0.5rem;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.75rem;
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 0.75rem;
        }

        .service-option {
          background: var(--color-surface);
          border: 2px solid var(--color-border);
          border-radius: 8px;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .service-option:hover {
          border-color: var(--color-primary);
          transform: translateY(-1px);
        }

        .service-option.selected {
          border-color: var(--color-primary);
          background: rgba(var(--color-primary-rgb), 0.05);
        }

        .service-option-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .service-code {
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-primary);
          background: rgba(var(--color-primary-rgb), 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .service-checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid var(--color-border);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          color: white;
          background: var(--color-border);
          transition: all 0.2s ease;
        }

        .service-option.selected .service-checkbox {
          background: var(--color-primary);
          border-color: var(--color-primary);
        }

        .service-name {
          font-weight: 600;
          color: var(--color-text);
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .service-price {
          font-size: 0.8rem;
          color: var(--color-success);
          font-weight: 600;
        }

        .no-services {
          text-align: center;
          padding: 1rem;
          color: var(--color-text-muted);
          font-style: italic;
        }

        .services-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-top: 0.5rem;
        }

        .note-icon {
          font-size: 1rem;
        }
      `}</style>
    </Modal>
  );
};

export default VehicleEditModal; 
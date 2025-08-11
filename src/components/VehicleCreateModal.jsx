import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

const VehicleCreateModal = ({ isOpen, onClose, onVehicleCreated }) => {
  const { getApiBaseUrl, getAuthHeaders } = useAuth();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    model: '',
    color: '',
    price: '',
    brandId: '',
    newBrandName: '',
    serviceIds: []
  });
  
  // Estados de la aplicación
  const [brands, setBrands] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isCreatingNewBrand, setIsCreatingNewBrand] = useState(false);
  const [creatingBrand, setCreatingBrand] = useState(false);

  // Cargar marcas y servicios al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadBrands();
      loadServices();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      model: '',
      color: '',
      price: '',
      brandId: '',
      newBrandName: '',
      serviceIds: []
    });
    setError(null);
    setValidationErrors({});
    setShowConfirmation(false);
    setIsCreatingNewBrand(false);
  };

  const loadBrands = async () => {
    try {
      setLoadingBrands(true);
      const response = await fetch(`${getApiBaseUrl()}/brand`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al cargar marcas: ${response.status}`);
      }

      const data = await response.json();
      setBrands(data?.data || []);
    } catch (err) {
      console.error('Error loading brands:', err);
      setError('Error al cargar las marcas disponibles');
    } finally {
      setLoadingBrands(false);
    }
  };

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const response = await fetch(`${getApiBaseUrl()}/service`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al cargar servicios: ${response.status}`);
      }

      const data = await response.json();
      setServices(data?.data || []);
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Error al cargar los servicios disponibles');
    } finally {
      setLoadingServices(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validar modelo
    if (!formData.model.trim()) {
      errors.model = 'El modelo es requerido';
    } else if (formData.model.trim().length < 2) {
      errors.model = 'El modelo debe tener al menos 2 caracteres';
    }

    // Validar color
    if (!formData.color.trim()) {
      errors.color = 'El color es requerido';
    }

    // Validar precio
    if (!formData.price) {
      errors.price = 'El precio es requerido';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        errors.price = 'El precio debe ser un número mayor a 0';
      }
    }

    // Validar marca
    if (isCreatingNewBrand) {
      if (!formData.newBrandName.trim()) {
        errors.newBrandName = 'El nombre de la nueva marca es requerido';
      }
    } else {
      if (!formData.brandId) {
        errors.brandId = 'Debe seleccionar una marca';
      }
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

    // Si cambia la selección de marca, resetear el estado de nueva marca
    if (name === 'brandId') {
      if (value === 'new') {
        setIsCreatingNewBrand(true);
      } else {
        setIsCreatingNewBrand(false);
        setFormData(prev => ({ ...prev, newBrandName: '' }));
      }
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

    // Limpiar error de validación para servicios
    if (validationErrors.serviceIds) {
      setValidationErrors(prev => ({
        ...prev,
        serviceIds: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    try {
      setSaving(true);
      setError(null);

      let finalBrandId = formData.brandId;

      // Si estamos creando una nueva marca, crearla primero
      if (isCreatingNewBrand) {
        finalBrandId = await createNewBrand();
      }

      // Crear el vehículo
      await createVehicle(finalBrandId);

    } catch (err) {
      setError(err.message);
      setShowConfirmation(false);
    } finally {
      setSaving(false);
    }
  };

  const createNewBrand = async () => {
    try {
      setCreatingBrand(true);
      
      const response = await fetch(`${getApiBaseUrl()}/brand`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: formData.newBrandName.trim()
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Ya existe una marca con ese nombre');
        }
        throw new Error(`Error al crear la marca: ${response.status}`);
      }

      const data = await response.json();
      const newBrandId = data?.data?.id;
      
      if (!newBrandId) {
        throw new Error('No se pudo obtener el ID de la nueva marca');
      }

      return newBrandId;
    } finally {
      setCreatingBrand(false);
    }
  };

  const createVehicle = async (brandId) => {
    // Intentar primero con el formato brand: { id }
    let vehicleData = {
      model: formData.model.trim(),
      color: formData.color.trim(),
      price: parseFloat(formData.price),
      brand: { id: parseInt(brandId) },
      services: formData.serviceIds.map(id => ({ id }))
    };

    let response = await fetch(`${getApiBaseUrl()}/vehicle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vehicleData),
    });

    // Si falla con 400, intentar con brandId directo
    if (response.status === 400) {
      vehicleData = {
        model: formData.model.trim(),
        color: formData.color.trim(),
        price: parseFloat(formData.price),
        brandId: parseInt(brandId),
        serviceIds: formData.serviceIds
      };

      response = await fetch(`${getApiBaseUrl()}/vehicle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(vehicleData),
      });
    }

    // Si aún falla, intentar con brand_id
    if (response.status === 400) {
      vehicleData = {
        model: formData.model.trim(),
        color: formData.color.trim(),
        price: parseFloat(formData.price),
        brand_id: parseInt(brandId),
        service_ids: formData.serviceIds
      };

      response = await fetch(`${getApiBaseUrl()}/vehicle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(vehicleData),
      });
    }

    if (!response.ok) {
      let errorMessage = `Error al crear el vehículo: HTTP ${response.status}`;
      
      try {
        const errorData = await response.text();
        if (errorData) {
          errorMessage += ` - ${errorData}`;
        }
      } catch (e) {
        // Error al leer respuesta
      }
      
      throw new Error(errorMessage);
    }

    // Éxito - cerrar modal y notificar
    onVehicleCreated();
    onClose();
  };

  const getSelectedBrandName = () => {
    if (isCreatingNewBrand) {
      return formData.newBrandName;
    }
    const brand = brands.find(b => b.id.toString() === formData.brandId);
    return brand?.name || '';
  };

  const handleClose = () => {
    if (!saving) {
      setShowConfirmation(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Modal de confirmación
  if (showConfirmation) {
    return (
      <Modal isOpen={true} onClose={!saving ? () => setShowConfirmation(false) : undefined} title="Confirmar Creación de Vehículo">
        <div className="confirmation-modal">
          <div className="confirmation-header">
            <div className="confirmation-icon">🚗</div>
            <h3>¿Confirmar la creación de este vehículo?</h3>
          </div>

          <div className="vehicle-summary">
            <div className="summary-item">
              <span className="label">Modelo:</span>
              <span className="value">{formData.model}</span>
            </div>
            <div className="summary-item">
              <span className="label">Color:</span>
              <span className="value">{formData.color}</span>
            </div>
            <div className="summary-item">
              <span className="label">Precio:</span>
              <span className="value">${parseFloat(formData.price).toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Marca:</span>
              <span className="value">
                {getSelectedBrandName()}
                {isCreatingNewBrand && <span className="new-badge">Nueva</span>}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Servicios:</span>
              <span className="value">
                {formData.serviceIds.length > 0 ? (
                  <div className="selected-services">
                    {formData.serviceIds.map(serviceId => {
                      const service = services.find(s => s.id === serviceId);
                      return service ? (
                        <span key={serviceId} className="service-tag">
                          {service.code}
                        </span>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <span className="no-services-text">Ninguno</span>
                )}
              </span>
            </div>
          </div>

          {isCreatingNewBrand && (
            <div className="creation-note">
              <span className="note-icon">ℹ️</span>
              <span>Se creará la nueva marca "{formData.newBrandName}" y luego el vehículo</span>
            </div>
          )}

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
              onClick={handleConfirmCreate}
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>
                    {creatingBrand ? 'Creando marca...' : 'Creando vehículo...'}
                  </span>
                </>
              ) : (
                <span>Sí, Crear Vehículo</span>
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
    <Modal isOpen={true} onClose={handleClose} title="Agregar Nuevo Vehículo">
      <div className="vehicle-create-modal">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="vehicle-form">
          {/* Modelo */}
          <div className="form-group">
            <label htmlFor="model" className="form-label">
              Modelo del Vehículo *
            </label>
            <div className="input-container">
              <div className="input-icon">🚗</div>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className={`form-input ${validationErrors.model ? 'error' : ''}`}
                placeholder="Ej: Corolla, Focus, Civic..."
                disabled={loading}
                required
              />
            </div>
            {validationErrors.model && (
              <span className="field-error">{validationErrors.model}</span>
            )}
          </div>

          {/* Color */}
          <div className="form-group">
            <label htmlFor="color" className="form-label">
              Color *
            </label>
            <div className="input-container">
              <div className="input-icon">🎨</div>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className={`form-input ${validationErrors.color ? 'error' : ''}`}
                placeholder="Ej: Rojo, Azul, Negro..."
                disabled={loading}
                required
              />
            </div>
            {validationErrors.color && (
              <span className="field-error">{validationErrors.color}</span>
            )}
          </div>

          {/* Precio */}
          <div className="form-group">
            <label htmlFor="price" className="form-label">
              Precio *
            </label>
            <div className="input-container">
              <div className="input-icon">💰</div>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`form-input ${validationErrors.price ? 'error' : ''}`}
                placeholder="250000"
                min="0"
                step="0.01"
                disabled={loading}
                required
              />
            </div>
            {validationErrors.price && (
              <span className="field-error">{validationErrors.price}</span>
            )}
          </div>

          {/* Marca */}
          <div className="form-group">
            <label htmlFor="brandId" className="form-label">
              Marca *
            </label>
            {loadingBrands ? (
              <div className="loading-brands">
                <LoadingSpinner size="small" />
                <span>Cargando marcas...</span>
              </div>
            ) : (
              <div className="input-container">
                <div className="input-icon">🏷️</div>
                <select
                  id="brandId"
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                  className={`form-select ${validationErrors.brandId ? 'error' : ''}`}
                  disabled={loading}
                  required
                >
                  <option value="">Seleccionar marca...</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                  <option value="new">➕ Crear nueva marca</option>
                </select>
              </div>
            )}
            {validationErrors.brandId && (
              <span className="field-error">{validationErrors.brandId}</span>
            )}
          </div>

          {/* Campo para nueva marca */}
          {isCreatingNewBrand && (
            <div className="form-group new-brand-group">
              <label htmlFor="newBrandName" className="form-label">
                Nombre de la Nueva Marca *
              </label>
              <div className="input-container">
                <div className="input-icon">✨</div>
                <input
                  type="text"
                  id="newBrandName"
                  name="newBrandName"
                  value={formData.newBrandName}
                  onChange={handleChange}
                  className={`form-input ${validationErrors.newBrandName ? 'error' : ''}`}
                  placeholder="Ej: Tesla, Lamborghini..."
                  disabled={loading}
                  required
                />
              </div>
              {validationErrors.newBrandName && (
                <span className="field-error">{validationErrors.newBrandName}</span>
              )}
              <div className="new-brand-note">
                <span className="note-icon">ℹ️</span>
                <span>Esta marca se creará automáticamente</span>
              </div>
            </div>
          )}

          {/* Servicios */}
          <div className="form-group">
            <label className="form-label">
              Servicios Asociados
            </label>
            {loadingServices ? (
              <div className="loading-services">
                <LoadingSpinner size="small" />
                <span>Cargando servicios...</span>
              </div>
            ) : (
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
            )}
            <div className="services-note">
              <span className="note-icon">ℹ️</span>
              <span>Selecciona los servicios que tendrá este vehículo (opcional)</span>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || loadingBrands}
            >
              Continuar
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .vehicle-create-modal {
          padding: 1.5rem;
          max-height: 70vh;
          overflow-y: auto;
        }

        .vehicle-form {
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

        .new-brand-group {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 0.5rem;
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

        .loading-brands {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }

        .new-brand-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #0ea5e9;
          margin-top: 0.5rem;
        }

        .note-icon {
          font-size: 1rem;
        }

        /* Services Selection Styles */
        .services-selection {
          margin-top: 0.5rem;
        }

        .loading-services {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          color: var(--color-text-muted);
          font-size: 0.9rem;
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

        .selected-services {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .service-tag {
          background: var(--color-primary);
          color: white;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-weight: 600;
        }

        .no-services-text {
          color: var(--color-text-muted);
          font-style: italic;
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
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .new-badge {
          background: #10b981;
          color: white;
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 500;
        }

        .creation-note {
          background: #eff6ff;
          border: 1px solid #3b82f6;
          border-radius: 6px;
          padding: 1rem;
          margin: 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #1e40af;
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

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--color-primary-dark);
          transform: translateY(-1px);
        }

        @media (max-width: 480px) {
          .vehicle-create-modal {
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

VehicleCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onVehicleCreated: PropTypes.func.isRequired,
};

export default VehicleCreateModal;
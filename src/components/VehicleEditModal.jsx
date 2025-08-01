import { useState, useEffect } from 'react';
import { vehicleService, brandService } from '../services/api';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const VehicleEditModal = ({ isOpen, onClose, vehicleId, onVehicleUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [formData, setFormData] = useState({
    model: '',
    color: '',
    price: '',
    brand_id: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && vehicleId) {
      loadVehicleData();
      loadBrands();
    }
  }, [isOpen, vehicleId]);

  // Limpiar formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        model: '',
        color: '',
        price: '',
        brand_id: ''
      });
      setValidationErrors({});
      setError(null);
      setVehicleInfo(null);
    }
  }, [isOpen]);

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehicleService.getById(vehicleId);
      
      if (response.data && response.data.data) {
        const vehicle = response.data.data;
        setVehicleInfo(vehicle);
        setFormData({
          model: vehicle.model || '',
          color: vehicle.color || '',
          price: vehicle.price || '',
          brand_id: vehicle.brand?.id || ''
        });
      }
    } catch (err) {
      setError('Error al cargar los datos del vehículo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await brandService.getAll();
      if (response.data && response.data.data) {
        setBrands(response.data.data);
      }
    } catch (err) {
      console.error('Error loading brands:', err);
      // No es crítico si no se pueden cargar las marcas
    }
  };

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
        brand_id: parseInt(formData.brand_id)
      };
      
      await vehicleService.update(vehicleId, updateData);
      
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
    </Modal>
  );
};

export default VehicleEditModal; 
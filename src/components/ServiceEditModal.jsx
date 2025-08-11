import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

const ServiceEditModal = ({ isOpen, onClose, serviceId, onServiceUpdated }) => {
  const { getApiBaseUrl, getAuthHeaders } = useAuth();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const isEditMode = serviceId !== null;

  // Cargar datos del servicio si estamos en modo edición
  useEffect(() => {
    if (isOpen && isEditMode) {
      loadServiceData();
    } else if (isOpen && !isEditMode) {
      // Limpiar formulario para crear nuevo servicio
      setFormData({
        code: '',
        name: '',
        description: '',
        price: ''
      });
      setError(null);
      setValidationErrors({});
    }
  }, [isOpen, serviceId]);

  const loadServiceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${getApiBaseUrl()}/service/${serviceId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.data) {
        setFormData({
          code: data.data.code || '',
          name: data.data.name || '',
          description: data.data.description || '',
          price: data.data.price ? data.data.price.toString() : ''
        });
      }
    } catch (err) {
      setError('Error al cargar los datos del servicio: ' + err.message);
      console.error('Error loading service data:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validar código
    if (!formData.code.trim()) {
      errors.code = 'El código del servicio es requerido';
    } else if (!/^[A-Za-z]{4}-\d{2}$/.test(formData.code.trim())) {
      errors.code = 'El código debe tener el formato: 4 letras, guión y 2 números (ejemplo: LLAN-01)';
    }

    // Validar nombre
    if (!formData.name.trim()) {
      errors.name = 'El nombre del servicio es requerido';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.trim().length > 50) {
      errors.name = 'El nombre no puede exceder 50 caracteres';
    }

    // Validar descripción
    if (!formData.description.trim()) {
      errors.description = 'La descripción del servicio es requerida';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.description.trim().length > 150) {
      errors.description = 'La descripción no puede exceder 150 caracteres';
    }

    // Validar precio
    if (!formData.price.trim()) {
      errors.price = 'El precio del servicio es requerido';
    } else {
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        errors.price = 'El precio debe ser un número mayor a 0';
      } else if (priceValue > 9999999.99) {
        errors.price = 'El precio no puede exceder 9,999,999.99';
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const url = isEditMode 
        ? `${getApiBaseUrl()}/service/${serviceId}`
        : `${getApiBaseUrl()}/service`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const requestBody = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price)
      };

      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Ya existe un servicio con ese código');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Notificar que el servicio fue actualizado/creado
      onServiceUpdated();
      onClose();

    } catch (err) {
      setError(err.message);
      console.error('Error saving service:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditMode ? 'Editar Servicio' : 'Crear Nuevo Servicio'}>
      <div className="service-edit-modal">
        {loading ? (
          <LoadingSpinner message="Cargando datos del servicio..." />
        ) : (
          <form onSubmit={handleSubmit} className="service-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="code" className="form-label">
                Código del Servicio *
              </label>
              <div className="input-container">
                <div className="input-icon">🔧</div>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`form-input ${validationErrors.code ? 'error' : ''}`}
                  placeholder="Ej: LLAN-01, MANT-02..."
                  disabled={saving}
                  required
                  maxLength={7}
                />
              </div>
              <div className="input-hint">
                Formato: 4 letras, guión y 2 números (ejemplo: LLAN-01)
              </div>
              {validationErrors.code && (
                <span className="field-error">{validationErrors.code}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nombre del Servicio *
              </label>
              <div className="input-container">
                <div className="input-icon">📝</div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${validationErrors.name ? 'error' : ''}`}
                  placeholder="Ej: Llantera, Mantenimiento..."
                  disabled={saving}
                  required
                  maxLength={50}
                />
              </div>
              {validationErrors.name && (
                <span className="field-error">{validationErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Descripción *
              </label>
              <div className="input-container">
                <div className="input-icon">📄</div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-input form-textarea ${validationErrors.description ? 'error' : ''}`}
                  placeholder="Describe el servicio que se ofrece..."
                  disabled={saving}
                  required
                  rows={3}
                  maxLength={150}
                />
              </div>
              {validationErrors.description && (
                <span className="field-error">{validationErrors.description}</span>
              )}
            </div>

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
                  placeholder="0.00"
                  disabled={saving}
                  required
                  step="0.01"
                  min="0.01"
                  max="9999999.99"
                />
              </div>
              {validationErrors.price && (
                <span className="field-error">{validationErrors.price}</span>
              )}
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
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>{isEditMode ? 'Actualizando...' : 'Creando...'}</span>
                  </>
                ) : (
                  <span>{isEditMode ? 'Actualizar' : 'Crear'} Servicio</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .service-edit-modal {
          padding: 1.5rem;
        }

        .service-form {
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
          align-items: flex-start;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 12px;
          font-size: 1.1rem;
          color: var(--color-text-muted);
          pointer-events: none;
          z-index: 1;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 2px solid var(--color-border);
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: var(--color-surface);
          color: var(--color-text);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
          padding-top: 0.75rem;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
        }

        .form-input.error {
          border-color: var(--color-danger);
        }

        .form-input:disabled {
          background: var(--color-surface-alt);
          color: var(--color-text-muted);
          cursor: not-allowed;
        }

        .input-hint {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-top: 0.25rem;
        }

        .field-error {
          color: var(--color-danger);
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-border);
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
          min-width: 100px;
          justify-content: center;
          font-size: 0.9rem;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--color-surface-alt);
          color: var(--color-text);
          border: 1px solid var(--color-border);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--color-border);
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
          .service-edit-modal {
            padding: 1rem;
          }
          
          .form-actions {
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

ServiceEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  serviceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onServiceUpdated: PropTypes.func.isRequired,
};

export default ServiceEditModal;

import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

const ServiceCreateModal = ({ isOpen, onClose, onServiceCreated }) => {
  const { getApiBaseUrl, getAuthHeaders } = useAuth();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    price: ''
  });
  
  // Estados de la aplicación
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Resetear formulario al abrir
  const resetForm = () => {
    setFormData({ 
      code: '', 
      name: '', 
      description: '', 
      price: '' 
    });
    setError(null);
    setValidationErrors({});
    setShowConfirmation(false);
  };

  // Limpiar al cerrar
  const handleClose = () => {
    if (!saving) {
      resetForm();
      onClose();
    }
  };

  // Validar formulario
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

  // Manejar cambios en el input
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error de validación
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

  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setShowConfirmation(true);
  };

  // Confirmar creación
  const handleConfirmCreate = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`${getApiBaseUrl()}/service`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          code: formData.code.trim().toUpperCase(),
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price)
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Ya existe un servicio con ese código');
        }
        throw new Error(`Error al crear el servicio: HTTP ${response.status}`);
      }

      // Éxito - cerrar modal y notificar
      onServiceCreated();
      handleClose();

    } catch (err) {
      setError(err.message);
      setShowConfirmation(false);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Modal de confirmación
  if (showConfirmation) {
    return (
      <Modal isOpen={true} onClose={!saving ? () => setShowConfirmation(false) : undefined} title="Confirmar Creación de Servicio">
        <div className="confirmation-modal">
          <div className="confirmation-header">
            <div className="confirmation-icon">🔧</div>
            <h3>¿Confirmar la creación de este servicio?</h3>
          </div>

          <div className="service-summary">
            <div className="summary-item">
              <span className="label">Código:</span>
              <span className="value code-value">{formData.code.toUpperCase()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Nombre:</span>
              <span className="value">{formData.name}</span>
            </div>
            <div className="summary-item">
              <span className="label">Descripción:</span>
              <span className="value">{formData.description}</span>
            </div>
            <div className="summary-item">
              <span className="label">Precio:</span>
              <span className="value price-value">${parseFloat(formData.price).toFixed(2)}</span>
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
              onClick={handleConfirmCreate}
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Creando servicio...</span>
                </>
              ) : (
                <span>Sí, Crear Servicio</span>
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
    <Modal isOpen={true} onClose={handleClose} title="Agregar Nuevo Servicio">
      <div className="service-create-modal">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="service-form">
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
                autoFocus
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
              Continuar
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .service-create-modal {
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

        .service-summary {
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
          align-items: flex-start;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--color-border-light);
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-item .label {
          font-weight: 500;
          color: var(--color-text-muted);
          min-width: 100px;
        }

        .summary-item .value {
          font-weight: 600;
          color: var(--color-text);
          font-size: 1rem;
          text-align: right;
          flex: 1;
          margin-left: 1rem;
        }

        .code-value {
          font-family: 'Courier New', monospace;
          background: rgba(var(--color-primary-rgb), 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          color: var(--color-primary);
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

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--color-primary-dark);
          transform: translateY(-1px);
        }

        @media (max-width: 480px) {
          .service-create-modal {
            padding: 1rem;
          }
          
          .form-actions, .confirmation-actions {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }

          .summary-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .summary-item .value {
            text-align: left;
            margin-left: 0;
          }
        }
      `}</style>
    </Modal>
  );
};

ServiceCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onServiceCreated: PropTypes.func.isRequired,
};

export default ServiceCreateModal;

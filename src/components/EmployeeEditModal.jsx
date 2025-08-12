import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

const EmployeeEditModal = ({ employee, onClose, onSuccess }) => {
  const { getApiBaseUrl, getAuthHeaders } = useAuth();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: ''
  });
  
  // Estados de la aplicación
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Cargar datos del empleado al abrir el modal
  useEffect(() => {
    if (employee) {
      setFormData({
        fullName: employee.fullName || '',
        phone: employee.phone || '',
        email: employee.email || ''
      });
    }
    setError(null);
    setValidationErrors({});
  }, [employee]);

  const validateForm = () => {
    const errors = {};

    // Validar nombre completo
    if (!formData.fullName.trim()) {
      errors.fullName = 'El nombre completo es requerido';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar teléfono
    if (!formData.phone.trim()) {
      errors.phone = 'El teléfono es requerido';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s+/g, ''))) {
      errors.phone = 'El teléfono debe tener 10 dígitos';
    }

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no tiene un formato válido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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
        [name]: null
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

      const response = await fetch(`${getApiBaseUrl()}/employee/${employee.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `Error ${response.status}: ${response.statusText}`);
      }

      // Éxito
      onSuccess();
    } catch (err) {
      setError(err.message);
      console.error('Error updating employee:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  if (!employee) {
    return null;
  }

  return (
    <Modal isOpen={true} onClose={handleClose} title="Editar Empleado">
      <div className="employee-edit-modal">
        <form onSubmit={handleSubmit} className="employee-form">
          {/* Mensaje de error general */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Información del empleado */}
          <div className="employee-info">
            <div className="employee-id">
              <span className="info-label">ID:</span>
              <span className="info-value">#{employee.id}</span>
            </div>
          </div>

          {/* Nombre completo */}
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Nombre Completo *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.fullName ? 'error' : ''}`}
              placeholder="Ingrese el nombre completo"
              disabled={saving}
            />
            {validationErrors.fullName && (
              <span className="error-text">{validationErrors.fullName}</span>
            )}
          </div>

          {/* Teléfono */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Teléfono *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.phone ? 'error' : ''}`}
              placeholder="10 dígitos (ej: 5512345678)"
              disabled={saving}
            />
            {validationErrors.phone && (
              <span className="error-text">{validationErrors.phone}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.email ? 'error' : ''}`}
              placeholder="ejemplo@correo.com"
              disabled={saving}
            />
            {validationErrors.email && (
              <span className="error-text">{validationErrors.email}</span>
            )}
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
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
                  Guardando...
                </>
              ) : (
                <>
                  <span className="btn-icon">💾</span>
                  Actualizar Empleado
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .employee-edit-modal {
          padding: 1rem;
        }

        .employee-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .employee-info {
          background: var(--color-surface-alt);
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--color-border);
        }

        .employee-id {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .info-label {
          font-weight: 500;
          color: var(--color-text-muted);
        }

        .info-value {
          color: var(--color-success);
          font-weight: 600;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-weight: 500;
          color: var(--color-text);
          font-size: 0.9rem;
        }

        .form-input {
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: var(--color-surface);
          color: var(--color-text);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input.error {
          border-color: var(--color-danger);
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: var(--color-danger-light);
          color: var(--color-danger);
          padding: 0.75rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .error-text {
          color: var(--color-danger);
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 120px;
          justify-content: center;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--color-primary-dark);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: var(--color-surface-alt);
          color: var(--color-text);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--color-border);
        }

        .btn-icon {
          font-size: 1rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .employee-edit-modal {
            padding: 0.5rem;
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

EmployeeEditModal.propTypes = {
  employee: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    fullName: PropTypes.string.isRequired,
    phone: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default EmployeeEditModal;

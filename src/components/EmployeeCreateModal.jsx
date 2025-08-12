import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

const EmployeeCreateModal = ({ onClose, onSuccess }) => {
  const { getApiBaseUrl, getAuthHeaders } = useAuth();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    phone: '',
    email: '',
    roleId: 2, // Por defecto rol USER (asumiendo que 2 es USER)
    enabled: true
  });
  
  // Estados de la aplicación
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState(null);

  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      phone: '',
      email: '',
      roleId: 2,
      enabled: true
    });
    setError(null);
    setValidationErrors({});
    setShowSuccess(false);
    setCreatedEmployee(null);
  };

  // Resetear formulario al abrir el modal
  useEffect(() => {
    resetForm();
  }, []);

  const validateForm = () => {
    const errors = {};

    // Validar username
    if (!formData.username.trim()) {
      errors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

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

      const response = await fetch(`${getApiBaseUrl()}/user`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `Error ${response.status}: ${response.statusText}`);
      }

      // Éxito - mostrar confirmación
      setCreatedEmployee({
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email
      });
      setShowSuccess(true);
    } catch (err) {
      setError(err.message);
      console.error('Error creating employee:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setCreatedEmployee(null);
    onSuccess();
    onClose();
  };

  // Modal de confirmación de éxito
  if (showSuccess && createdEmployee) {
    return (
      <Modal isOpen={true} onClose={handleSuccessClose} title="Empleado Registrado Exitosamente">
        <div className="success-modal">
          <div className="success-header">
            <div className="success-icon">✅</div>
            <h3>¡Empleado registrado correctamente!</h3>
          </div>

          <div className="success-content">
            <div className="employee-summary">
              <div className="summary-item">
                <span className="label">Nombre:</span>
                <span className="value">{createdEmployee.fullName}</span>
              </div>
              <div className="summary-item">
                <span className="label">Usuario:</span>
                <span className="value">{createdEmployee.username}</span>
              </div>
              <div className="summary-item">
                <span className="label">Email:</span>
                <span className="value">{createdEmployee.email}</span>
              </div>
            </div>

            <div className="success-message">
              <div className="message-icon">📧</div>
              <div className="message-content">
                <p><strong>Importante:</strong></p>
                <p>Se ha enviado un correo electrónico a <strong>{createdEmployee.email}</strong> con las credenciales de acceso.</p>
                <p>El empleado deberá revisar su correo para obtener su contraseña temporal.</p>
              </div>
            </div>
          </div>

          <div className="success-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSuccessClose}
            >
              <span className="btn-icon">👌</span>
              Entendido
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={handleClose} title="Registrar Nuevo Empleado">
      <div className="employee-create-modal">
        <form onSubmit={handleSubmit} className="employee-form">
          {/* Mensaje de error general */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Nombre de usuario */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Nombre de Usuario *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.username ? 'error' : ''}`}
              placeholder="Ingrese el nombre de usuario"
              disabled={saving}
            />
            {validationErrors.username && (
              <span className="error-text">{validationErrors.username}</span>
            )}
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

          {/* Información sobre contraseña temporal */}
          <div className="info-message">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <p><strong>Nota importante:</strong></p>
              <p>Al crear el empleado, se generará automáticamente una contraseña temporal que será enviada al email proporcionado.</p>
              <p>El empleado deberá cambiar su contraseña después del primer inicio de sesión.</p>
            </div>
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
                  <span className="btn-icon">👤</span>
                  Registrar Empleado
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .employee-create-modal {
          padding: 1rem;
        }

        .employee-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
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

        .info-message {
          background: var(--color-info-light);
          border: 1px solid var(--color-info);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .info-icon {
          font-size: 1.2rem;
          color: var(--color-info);
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .info-content p {
          margin: 0.25rem 0;
          color: var(--color-text);
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .info-content p:first-child {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        /* Estilos para el modal de éxito */
        .success-modal {
          padding: 1rem;
        }

        .success-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .success-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .success-header h3 {
          color: var(--color-success);
          margin: 0;
          font-size: 1.3rem;
        }

        .success-content {
          margin-bottom: 1.5rem;
        }

        .employee-summary {
          background: var(--color-surface-alt);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .summary-item:last-child {
          margin-bottom: 0;
        }

        .summary-item .label {
          font-weight: 500;
          color: var(--color-text-muted);
        }

        .summary-item .value {
          font-weight: 600;
          color: var(--color-text);
        }

        .success-message {
          background: var(--color-info-light);
          border: 1px solid var(--color-info);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .message-icon {
          font-size: 1.2rem;
          color: var(--color-info);
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .message-content p {
          margin: 0.25rem 0;
          color: var(--color-text);
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .message-content p:first-child {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .success-actions {
          display: flex;
          justify-content: center;
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
          .employee-create-modal {
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

EmployeeCreateModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default EmployeeCreateModal;

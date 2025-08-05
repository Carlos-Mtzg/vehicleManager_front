import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

const ClientCreateModal = ({ isOpen, onClose, onClientCreated }) => {
  const { getApiBaseUrl, getAuthHeaders } = useAuth();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    employeeId: ''
  });
  
  // Estados de la aplicación
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      employeeId: ''
    });
    setError(null);
    setValidationErrors({});
    setShowConfirmation(false);
  };

  const loadEmployees = useCallback(async () => {
    try {
      setLoadingEmployees(true);
      const response = await fetch(`${getApiBaseUrl()}/employee`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al cargar empleados: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta completa del endpoint /employee:', data);
      console.log('Array de empleados:', data?.data);
      console.log('Primer empleado:', data?.data?.[0]);
      setEmployees(data?.data || []);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Error al cargar los empleados disponibles');
    } finally {
      setLoadingEmployees(false);
    }
  }, [getApiBaseUrl, getAuthHeaders]);

  // Cargar empleados al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      resetForm();
    }
  }, [isOpen, loadEmployees]);

  const validateForm = () => {
    const errors = {};

    // Validar nombre completo
    if (!formData.full_name.trim()) {
      errors.full_name = 'El nombre completo es requerido';
    } else if (formData.full_name.trim().length < 2) {
      errors.full_name = 'El nombre debe tener al menos 2 caracteres';
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

    // Validar empleado
    if (!formData.employeeId) {
      errors.employeeId = 'Debe seleccionar un empleado';
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

    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    try {
      setSaving(true);
      setError(null);

      const clientData = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        employee: { id: parseInt(formData.employeeId) }
      };

      const response = await fetch(`${getApiBaseUrl()}/customer`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Ya existe un cliente con ese email o teléfono');
        }
        throw new Error(`Error al crear el cliente: HTTP ${response.status}`);
      }

      // Éxito - cerrar modal y notificar
      onClientCreated();
      onClose();

    } catch (err) {
      setError(err.message);
      setShowConfirmation(false);
    } finally {
      setSaving(false);
    }
  };

  const getSelectedEmployeeName = () => {
    const employee = employees.find(e => e.id.toString() === formData.employeeId);
    if (!employee) return `ID ${formData.employeeId}`;
    
    // Usar la misma lógica que en el select
    return employee.full_name || 
           employee.fullName || 
           employee.name || 
           employee.firstName + ' ' + employee.lastName ||
           employee.first_name + ' ' + employee.last_name ||
           `ID ${formData.employeeId}`;
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
      <Modal isOpen={true} onClose={!saving ? () => setShowConfirmation(false) : undefined} title="Confirmar Creación de Cliente">
        <div className="confirmation-modal">
          <div className="confirmation-header">
            <div className="confirmation-icon">👤</div>
            <h3>¿Confirmar la creación de este cliente?</h3>
          </div>

          <div className="client-summary">
            <div className="summary-item">
              <span className="label">Nombre completo:</span>
              <span className="value">{formData.full_name}</span>
            </div>
            <div className="summary-item">
              <span className="label">Teléfono:</span>
              <span className="value">{formData.phone}</span>
            </div>
            <div className="summary-item">
              <span className="label">Email:</span>
              <span className="value">{formData.email}</span>
            </div>
            <div className="summary-item">
              <span className="label">Empleado asignado:</span>
              <span className="value">{getSelectedEmployeeName()}</span>
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
                  <span>Creando cliente...</span>
                </>
              ) : (
                <span>Sí, Crear Cliente</span>
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
    <Modal isOpen={true} onClose={handleClose} title="Agregar Nuevo Cliente">
      <div className="client-create-modal">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="client-form">
          {/* Nombre completo */}
          <div className="form-group">
            <label htmlFor="full_name" className="form-label">
              Nombre Completo *
            </label>
            <div className="input-container">
              <div className="input-icon">👤</div>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`form-input ${validationErrors.full_name ? 'error' : ''}`}
                placeholder="Ej: Juan Pérez García"
                disabled={loadingEmployees}
                required
              />
            </div>
            {validationErrors.full_name && (
              <span className="field-error">{validationErrors.full_name}</span>
            )}
          </div>

          {/* Teléfono */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Teléfono *
            </label>
            <div className="input-container">
              <div className="input-icon">📞</div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-input ${validationErrors.phone ? 'error' : ''}`}
                placeholder="5551234567"
                disabled={loadingEmployees}
                required
              />
            </div>
            {validationErrors.phone && (
              <span className="field-error">{validationErrors.phone}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email *
            </label>
            <div className="input-container">
              <div className="input-icon">📧</div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${validationErrors.email ? 'error' : ''}`}
                placeholder="juan.perez@email.com"
                disabled={loadingEmployees}
                required
              />
            </div>
            {validationErrors.email && (
              <span className="field-error">{validationErrors.email}</span>
            )}
          </div>

          {/* Empleado */}
          <div className="form-group">
            <label htmlFor="employeeId" className="form-label">
              Empleado Asignado *
            </label>
            {loadingEmployees ? (
              <div className="loading-employees">
                <LoadingSpinner size="small" />
                <span>Cargando empleados...</span>
              </div>
            ) : (
              <div className="input-container">
                <div className="input-icon">👨‍💼</div>
                <select
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className={`form-select ${validationErrors.employeeId ? 'error' : ''}`}
                  disabled={loadingEmployees}
                  required
                >
                  <option value="">Seleccionar empleado...</option>
                  {employees.map(employee => {
                    console.log('Renderizando empleado:', employee);
                    // Intentar diferentes campos posibles para el nombre
                    const displayName = employee.full_name || 
                                      employee.fullName || 
                                      employee.name || 
                                      employee.firstName + ' ' + employee.lastName ||
                                      employee.first_name + ' ' + employee.last_name ||
                                      `Empleado ${employee.id}`;
                    console.log('Nombre a mostrar:', displayName);
                    return (
                      <option key={employee.id} value={employee.id}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            {validationErrors.employeeId && (
              <span className="field-error">{validationErrors.employeeId}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={loadingEmployees}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loadingEmployees}
            >
              Continuar
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .client-create-modal {
          padding: 1.5rem;
          max-height: 70vh;
          overflow-y: auto;
        }

        .client-form {
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

        .loading-employees {
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

        .client-summary {
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
          .client-create-modal {
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

ClientCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onClientCreated: PropTypes.func.isRequired,
};

export default ClientCreateModal;
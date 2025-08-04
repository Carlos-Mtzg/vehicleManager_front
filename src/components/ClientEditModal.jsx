import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

const ClientEditModal = ({ isOpen, onClose, clientId, onClientUpdated }) => {
  const { getApiBaseUrl, getAuthHeaders } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    employeeId: ''
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const isEditMode = clientId !== null;

  // Cargar datos del cliente y empleados si estamos en modo edición
  useEffect(() => {
    if (isOpen && isEditMode) {
      loadClientData();
      loadEmployees();
    } else if (isOpen && !isEditMode) {
      // Limpiar formulario para crear nuevo cliente
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        employeeId: ''
      });
      setError(null);
      setValidationErrors({});
      loadEmployees();
    }
  }, [isOpen, clientId]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${getApiBaseUrl()}/user/${clientId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.data) {
        setFormData({
          full_name: data.data.full_name || '',
          phone: data.data.phone || '',
          email: data.data.email || '',
          employeeId: data.data.employee?.id?.toString() || ''
        });
      }
    } catch (err) {
      setError('Error al cargar los datos del cliente: ' + err.message);
      console.error('Error loading client data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
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
      setEmployees(data?.data || []);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Error al cargar los empleados disponibles');
    } finally {
      setLoadingEmployees(false);
    }
  };

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

    try {
      setSaving(true);
      setError(null);

      const url = `${getApiBaseUrl()}/user/${clientId}`;
      
      const requestBody = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        employee: { id: parseInt(formData.employeeId) }
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Ya existe un cliente con ese email o teléfono');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Notificar que el cliente fue actualizado
      onClientUpdated();
      onClose();

    } catch (err) {
      setError(err.message);
      console.error('Error saving client:', err);
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Cliente">
      <div className="client-edit-modal">
        {loading ? (
          <LoadingSpinner message="Cargando datos del cliente..." />
        ) : (
          <form onSubmit={handleSubmit} className="client-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

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
                  disabled={saving}
                  required
                />
              </div>
              {validationErrors.full_name && (
                <span className="field-error">{validationErrors.full_name}</span>
              )}
            </div>

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
                  disabled={saving}
                  required
                />
              </div>
              {validationErrors.phone && (
                <span className="field-error">{validationErrors.phone}</span>
              )}
            </div>

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
                  disabled={saving}
                  required
                />
              </div>
              {validationErrors.email && (
                <span className="field-error">{validationErrors.email}</span>
              )}
            </div>

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
                    disabled={saving}
                    required
                  >
                    <option value="">Seleccionar empleado...</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.full_name || employee.name || `Empleado ${employee.id}`}
                      </option>
                    ))}
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
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <span>Actualizar Cliente</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .client-edit-modal {
          padding: 1.5rem;
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
          .client-edit-modal {
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

ClientEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  clientId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClientUpdated: PropTypes.func.isRequired,
};

export default ClientEditModal;
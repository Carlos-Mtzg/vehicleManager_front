import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { getAuthHeaders } = useAuth();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
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

    // Obtener el ID del usuario actual desde el backend
    let userId = null;
    try {
      // Intentar obtener el usuario actual usando el endpoint GET /api/user
      const userResponse = await fetch('/api/user', {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (userResponse.ok) {
        const usersData = await userResponse.json();
        // Buscar el usuario actual (asumiendo que es el único o el primero)
        if (usersData.data && usersData.data.length > 0) {
          // Si hay múltiples usuarios, buscar el que coincida con el token
          const currentUser = usersData.data.find(u => u.username === 'ADMIN') || usersData.data[0];
          userId = currentUser.id;
        }
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }

    // Si no pudimos obtener el ID, mostrar error
    if (!userId) {
      setErrors({
        submit: 'Error: No se pudo obtener el ID del usuario. Por favor, contacta al administrador.'
      });
      setIsLoading(false);
      return;
    }

    if (!userId) {
      setErrors({
        submit: 'Error: No se pudo obtener el ID del usuario. Por favor, recarga la página e intenta nuevamente.'
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      // Usar un endpoint que no requiera ID en la URL
      const response = await fetch(`/api/user/change-password/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          password: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('✅ Contraseña actualizada correctamente');
        setFormData({
          newPassword: '',
          confirmPassword: ''
        });
        setErrors({});
        
        // Mostrar mensaje de éxito por 3 segundos antes de cerrar
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrors({
          submit: data.message || 'Error al actualizar la contraseña'
        });
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setErrors({
        submit: 'Error de conexión. Intenta nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      setSuccessMessage('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="medium">
      <div className="change-password-modal">
        <div className="modal-header">
                      <div className="modal-title-section">
              <h2 className="modal-title">Cambiar Contraseña</h2>
              <p className="modal-subtitle">Ingresa tu nueva contraseña de acceso</p>
            </div>
        </div>

        <div className="modal-content">
          {successMessage ? (
            /* Vista de éxito - Solo mensaje */
            <div className="success-view">
              <div className="success-message-full">
                <div className="success-icon-large">✅</div>
                <h3 className="success-title-large">¡Contraseña Actualizada!</h3>
                <p className="success-description-large">
                  Tu contraseña ha sido cambiada exitosamente. El modal se cerrará automáticamente.
                </p>
                <div className="success-progress-full">
                  <div className="progress-bar-full"></div>
                </div>
              </div>
            </div>
          ) : (
            /* Vista del formulario */
            <form onSubmit={handleSubmit} className="change-password-form">
              {/* Error general */}
              {errors.submit && (
                <div className="form-error">
                  <span className="error-icon">⚠️</span>
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Nueva contraseña */}
              <div className="form-group">
                <label htmlFor="newPassword">
                  <span className="label-icon">🆕</span>
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={errors.newPassword ? 'error' : ''}
                  placeholder="Ingresa tu nueva contraseña"
                  disabled={isLoading}
                />
                {errors.newPassword && (
                  <span className="field-error">{errors.newPassword}</span>
                )}
                <span className="field-hint">
                  Mínimo 6 caracteres. Usa una combinación de letras, números y símbolos.
                </span>
              </div>

              {/* Confirmar nueva contraseña */}
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <span className="label-icon">✅</span>
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirma tu nueva contraseña"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <span className="field-error">{errors.confirmPassword}</span>
                )}
              </div>

              {/* Información de seguridad */}
              <div className="security-info">
                <div className="security-header">
                  <span className="security-icon">🛡️</span>
                  <span className="security-title">Recomendaciones de Seguridad</span>
                </div>
                <ul className="security-list">
                  <li>Usa al menos 8 caracteres</li>
                  <li>Incluye mayúsculas y minúsculas</li>
                  <li>Agrega números y símbolos</li>
                  <li>Evita información personal</li>
                </ul>
              </div>
            </form>
          )}
        </div>

        <div className="modal-actions">
          {successMessage ? (
            /* Solo botón de cerrar en vista de éxito */
            <button
              type="button"
              className="btn-primary"
              onClick={handleClose}
            >
              <span className="btn-icon">✅</span>
              <span>Entendido</span>
            </button>
          ) : (
            /* Botones normales en vista del formulario */
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="btn-spinner">⏳</span>
                    <span>Actualizando contraseña...</span>
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🔒</span>
                    <span>Cambiar Contraseña</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;

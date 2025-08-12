import { useState } from 'react';
import Modal from './Modal';

const RecoverPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'El correo electrónico es requerido';
    }
    if (!emailRegex.test(email)) {
      return 'Ingresa un correo electrónico válido';
    }
    return null;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Limpiar error cuando el usuario empiece a escribir
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/auth/recover-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEmail('');
        
        // Cerrar modal después de 4 segundos
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 4000);
      } else {
        setError(data.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error recovering password:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="small">
      <div className="recover-password-modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">Recuperar Contraseña</h2>
            <p className="modal-subtitle">
              {success 
                ? 'Revisa tu correo electrónico para obtener tu contraseña temporal'
                : 'Ingresa tu correo electrónico para recibir una contraseña temporal'
              }
            </p>
          </div>
        </div>

        <div className="modal-content">
          {success ? (
            /* Vista de éxito */
            <div className="success-view">
              <div className="success-message-full">
                <div className="success-icon-large">📧</div>
                <h3 className="success-title-large">¡Correo Enviado!</h3>
                <p className="success-description-large">
                  Hemos enviado una contraseña temporal a tu correo electrónico. 
                  Por favor, revisa tu bandeja de entrada y cambia tu contraseña 
                  después de iniciar sesión.
                </p>
                <div className="success-progress-full">
                  <div className="progress-bar-full"></div>
                </div>
              </div>
            </div>
          ) : (
            /* Vista del formulario */
            <form onSubmit={handleSubmit} className="recover-password-form">
              {/* Error general */}
              {error && (
                <div className="form-error">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Campo de email */}
              <div className="form-group">
                <label htmlFor="email">
                  <span className="label-icon">📧</span>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="tu@correo.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
                <span className="field-hint">
                  Ingresa el correo electrónico asociado a tu cuenta
                </span>
              </div>

              {/* Información adicional */}
              <div className="info-box">
                <div className="info-header">
                  <span className="info-icon">ℹ️</span>
                  <span className="info-title">¿Qué sucede después?</span>
                </div>
                <ul className="info-list">
                  <li>Recibirás una contraseña temporal por correo</li>
                  <li>Inicia sesión con esa contraseña temporal</li>
                  <li>Cambia tu contraseña en tu perfil</li>
                </ul>
              </div>
            </form>
          )}
        </div>

        <div className="modal-actions">
          {success ? (
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
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <span className="btn-icon">📧</span>
                    <span>Enviar Contraseña Temporal</span>
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

export default RecoverPasswordModal;

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ChangePasswordModal from '../components/ChangePasswordModal';

const Profile = () => {
  const { user } = useAuth();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Mi Perfil</h1>
          <p>Gestiona la configuración de tu cuenta</p>
        </div>
      </div>

      <div className="profile-content">
        {/* Tarjeta de acciones */}
        <div className="profile-actions-card">
          <h3>Acciones de Cuenta</h3>
          <div className="actions-grid">
            <button 
              className="action-button primary"
              onClick={handleChangePassword}
            >
              <span className="action-icon">🔒</span>
              <div className="action-content">
                <span className="action-title">Cambiar Contraseña</span>
                <span className="action-description">Actualiza tu contraseña de acceso</span>
              </div>
              <span className="action-arrow">→</span>
            </button>
          </div>
        </div>

        {/* Tarjeta de información del sistema */}
        <div className="system-info-card">
          <h3>Información del Sistema</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Versión de la Aplicación</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Soporte Técnico</span>
              <span className="info-value">virtualqueuemanager@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de cambio de contraseña */}
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default Profile;

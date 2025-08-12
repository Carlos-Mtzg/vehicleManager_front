import PropTypes from 'prop-types';
import Modal from './Modal';

const LogoutConfirmationModal = ({ onConfirm, onCancel, isLoading }) => {
  return (
    <Modal isOpen={true} onClose={onCancel} title="Cerrar Sesión">
      <div className="logout-confirmation-modal">
        <div className="confirmation-message">
          <div className="confirmation-icon">🚪</div>
          <p>¿Estás seguro de que deseas cerrar sesión?</p>
          <p className="confirmation-subtitle">
            Serás redirigido a la página de inicio de sesión.
          </p>
        </div>

        <div className="confirmation-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Cerrando...
              </>
            ) : (
              <>
                <span className="btn-icon">👋</span>
                Cerrar Sesión
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .logout-confirmation-modal {
          padding: 1rem;
        }

        .confirmation-message {
          text-align: center;
          padding: 1rem 0;
        }

        .confirmation-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .confirmation-message p {
          margin: 0.5rem 0;
          color: var(--color-text);
          font-size: 1rem;
        }

        .confirmation-subtitle {
          color: var(--color-text-muted) !important;
          font-size: 0.9rem !important;
        }

        .confirmation-actions {
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

        .btn-secondary {
          background: var(--color-surface-alt);
          color: var(--color-text);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--color-border);
        }

        .btn-danger {
          background: var(--color-danger);
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: var(--color-danger-dark);
          transform: translateY(-1px);
        }

        .btn-icon {
          font-size: 1rem;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .logout-confirmation-modal {
            padding: 0.5rem;
          }

          .confirmation-actions {
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

LogoutConfirmationModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default LogoutConfirmationModal;

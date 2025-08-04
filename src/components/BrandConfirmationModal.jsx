import PropTypes from 'prop-types';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

const BrandConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  brand, 
  isLoading = false 
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={!isLoading ? onClose : undefined} title="Eliminar Marca">
      <div className="brand-confirmation-modal">
        <div className="confirmation-content">
          <div className="warning-icon">
            ⚠️
          </div>
          
          <div className="confirmation-message">
            <h3>¿Estás seguro de que deseas eliminar esta marca?</h3>
            
            {brand && (
              <div className="brand-info">
                <div className="brand-detail">
                  <span className="detail-label">Marca:</span>
                  <span className="detail-value">{brand.name}</span>
                </div>
                <div className="brand-detail">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">#{brand.id}</span>
                </div>
              </div>
            )}
            
            <p className="warning-text">
              Esta acción no se puede deshacer. La marca será eliminada permanentemente del sistema.
            </p>
          </div>
        </div>

        <div className="confirmation-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-danger"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" />
                <span>Eliminando...</span>
              </>
            ) : (
              <span>Sí, Eliminar Marca</span>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .brand-confirmation-modal {
          padding: 1.5rem;
          text-align: center;
        }

        .confirmation-content {
          margin-bottom: 2rem;
        }

        .warning-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          display: block;
        }

        .confirmation-message h3 {
          color: var(--color-text);
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .brand-info {
          background: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1rem;
          margin: 1.5rem 0;
          text-align: left;
        }

        .brand-detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
        }

        .brand-detail:not(:last-child) {
          border-bottom: 1px solid var(--color-border-light);
        }

        .detail-label {
          font-weight: 500;
          color: var(--color-text-muted);
        }

        .detail-value {
          font-weight: 600;
          color: var(--color-text);
        }

        .warning-text {
          color: var(--color-text-muted);
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 1.5rem 0 0 0;
        }

        .confirmation-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
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
          text-decoration: none;
          outline: none;
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
          border-color: #9ca3af;
        }

        .btn-danger {
          background: #dc2626;
          color: white;
          border: 1px solid #dc2626;
        }

        .btn-danger:hover:not(:disabled) {
          background: #b91c1c;
          border-color: #b91c1c;
          transform: translateY(-1px);
        }

        .btn-danger:disabled {
          background: #dc2626;
          color: white;
          opacity: 0.8;
        }

        .btn span {
          color: inherit;
        }

        @media (max-width: 480px) {
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

BrandConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  brand: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};

export default BrandConfirmationModal;
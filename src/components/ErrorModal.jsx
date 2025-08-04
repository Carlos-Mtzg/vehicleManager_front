import PropTypes from 'prop-types';
import Modal from './Modal';

const ErrorModal = ({ isOpen, onClose, title = "Error", message, type = "error" }) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '❌';
    }
  };

  const getColorClass = () => {
    switch (type) {
      case 'warning':
        return 'error-modal-warning';
      case 'info':
        return 'error-modal-info';
      case 'success':
        return 'error-modal-success';
      default:
        return 'error-modal-error';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={`error-modal ${getColorClass()}`}>
        <div className="error-modal-content">
          <div className="error-modal-icon">
            {getIcon()}
          </div>
          <div className="error-modal-message">
            {message}
          </div>
        </div>
        
        <div className="error-modal-actions">
          <button 
            className="btn btn-primary"
            onClick={onClose}
          >
            Entendido
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .error-modal {
          padding: 1rem;
          text-align: center;
        }
        
        .error-modal-content {
          margin-bottom: 1.5rem;
        }
        
        .error-modal-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .error-modal-message {
          font-size: 1.1rem;
          line-height: 1.5;
          color: var(--color-text);
        }
        
        .error-modal-warning .error-modal-message {
          color: var(--color-warning);
        }
        
        .error-modal-error .error-modal-message {
          color: var(--color-danger);
        }
        
        .error-modal-info .error-modal-message {
          color: var(--color-info);
        }
        
        .error-modal-success .error-modal-message {
          color: var(--color-success);
        }
        
        .error-modal-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
      `}</style>
    </Modal>
  );
};

ErrorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['error', 'warning', 'info', 'success'])
};

export default ErrorModal;
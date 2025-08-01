import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true 
}) => {
  
  // Cerrar modal con tecla Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);
  
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      // Guardar el estado original
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Calcular ancho de scrollbar para evitar salto de layout
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Aplicar estilos para prevenir scroll
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.classList.add('modal-open');
      
      return () => {
        // Restaurar el estado original
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        document.body.classList.remove('modal-open');
      };
    }
  }, [isOpen]);
  
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    small: 'modal-small',
    medium: 'modal-medium', 
    large: 'modal-large',
    fullscreen: 'modal-fullscreen'
  };
  
  const modalContent = (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-container ${sizeClasses[size]}`}>
        {/* Header del Modal */}
        {(title || showCloseButton) && (
          <div className="modal-header">
            <div className="modal-title-section">
              {title && <h2 className="modal-title">{title}</h2>}
            </div>
            {showCloseButton && (
              <button 
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            )}
          </div>
        )}
        
        {/* Contenido del Modal */}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );

  // Renderizar el modal usando un portal al body
  return createPortal(modalContent, document.body);
};

export default Modal; 
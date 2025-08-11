import PropTypes from 'prop-types';

const ServiceCard = ({ service, onEdit, onDelete, style }) => {
  return (
    <div className="service-card" style={style}>
      <div className="service-card-header">
        <div className="service-icon">
          <span className="service-emoji">🔧</span>
        </div>
        <div className="service-actions">
          <button 
            className="service-action-btn edit-btn"
            onClick={() => onEdit(service)}
            title="Editar servicio"
          >
            ✏️
          </button>
          <button 
            className="service-action-btn delete-btn"
            onClick={() => onDelete(service)}
            title="Eliminar servicio"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="service-card-content">
        <div className="service-code">{service.code}</div>
        <h3 className="service-name">{service.name}</h3>
        {service.description && (
          <p className="service-description">{service.description}</p>
        )}
        <div className="service-price">
          <span className="price-label">Precio:</span>
          <span className="price-value">${service.price}</span>
        </div>
        <div className="service-meta">
          <span className="service-id">#{service.id}</span>
          {service.registration_date && (
            <span className="service-date">
              {new Date(service.registration_date).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        .service-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.3s ease;
          position: relative;
          min-height: 160px;
          display: flex;
          flex-direction: column;
          animation: fadeInUp 0.6s ease-out;
          animation-fill-mode: both;
        }

        .service-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: var(--color-primary);
        }

        .service-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .service-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
        }

        .service-emoji {
          font-size: 1.2rem;
          filter: brightness(0) invert(1);
        }

        .service-actions {
          display: flex;
          gap: 0.25rem;
          opacity: 1;
        }

        .service-action-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: none;
          background: var(--color-surface-alt);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
        }

        .service-action-btn:hover {
          transform: scale(1.1);
        }

        .edit-btn:hover {
          background: var(--color-info);
          color: white;
        }

        .delete-btn:hover {
          background: var(--color-danger);
          color: white;
        }

        .service-card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .service-code {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-primary);
          background: rgba(var(--color-primary-rgb), 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          align-self: flex-start;
          font-family: 'Courier New', monospace;
        }

        .service-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
          line-height: 1.3;
        }

        .service-description {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          line-height: 1.4;
          margin: 0;
          flex: 1;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .service-price {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--color-success-light);
          padding: 0.5rem;
          border-radius: 8px;
          margin: 0.5rem 0;
        }

        .price-label {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }

        .price-value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-success);
        }

        .service-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: auto;
          padding-top: 0.5rem;
          border-top: 1px solid var(--color-border-light);
        }

        .service-id {
          font-weight: 500;
          color: var(--color-primary);
        }

        .service-date {
          font-size: 0.7rem;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .service-card {
            min-height: 140px;
            padding: 0.75rem;
          }

          .service-name {
            font-size: 1.1rem;
          }

          .service-price {
            padding: 0.4rem;
          }

          .price-value {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

ServiceCard.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    registration_date: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  style: PropTypes.object,
};

export default ServiceCard;

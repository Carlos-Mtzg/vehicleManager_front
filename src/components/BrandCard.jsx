import PropTypes from 'prop-types';

const BrandCard = ({ brand, onEdit, onDelete, style }) => {
  return (
    <div className="brand-card" style={style}>
      <div className="brand-card-header">
        <div className="brand-icon">
          <span className="brand-emoji">🏷️</span>
        </div>
        <div className="brand-actions">
          <button 
            className="brand-action-btn edit-btn"
            onClick={() => onEdit(brand)}
            title="Editar marca"
          >
            ✏️
          </button>
          <button 
            className="brand-action-btn delete-btn"
            onClick={() => onDelete(brand)}
            title="Eliminar marca"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="brand-card-content">
        <h3 className="brand-name">{brand.name}</h3>
        {brand.description && (
          <p className="brand-description">{brand.description}</p>
        )}
        <div className="brand-meta">
          <span className="brand-id">#{brand.id}</span>
          {brand.registration_date && (
            <span className="brand-date">
              {new Date(brand.registration_date).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        .brand-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.3s ease;
          position: relative;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          animation: fadeInUp 0.6s ease-out;
          animation-fill-mode: both;
        }

        .brand-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: var(--color-primary);
        }

        .brand-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
        }

        .brand-emoji {
          font-size: 1.2rem;
          filter: brightness(0) invert(1);
        }

        .brand-actions {
          display: flex;
          gap: 0.25rem;
          opacity: 1;
        }

        .brand-action-btn {
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

        .brand-action-btn:hover {
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

        .brand-card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .brand-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
          line-height: 1.3;
        }

        .brand-description {
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

        .brand-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: auto;
          padding-top: 0.5rem;
          border-top: 1px solid var(--color-border-light);
        }

        .brand-id {
          font-weight: 500;
          color: var(--color-primary);
        }

        .brand-date {
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
          .brand-card {
            min-height: 120px;
            padding: 0.75rem;
          }

          .brand-name {
            font-size: 1.1rem;
          }


        }
      `}</style>
    </div>
  );
};

BrandCard.propTypes = {
  brand: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    registration_date: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  style: PropTypes.object,
};

export default BrandCard;
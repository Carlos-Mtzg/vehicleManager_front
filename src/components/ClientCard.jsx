import PropTypes from 'prop-types';

const ClientCard = ({ client, onEdit, onDelete, style }) => {
  return (
    <div className="client-card" style={style}>
      <div className="client-card-header">
        <div className="client-icon">
          <span className="client-emoji">👤</span>
        </div>
        <div className="client-actions">
          <button 
            className="client-action-btn edit-btn"
            onClick={() => onEdit(client)}
            title="Editar cliente"
          >
            ✏️
          </button>
          <button 
            className="client-action-btn delete-btn"
            onClick={() => onDelete(client)}
            title="Eliminar cliente"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="client-card-content">
        <h3 className="client-name">{client.full_name}</h3>
        
        <div className="client-details">
          {client.phone && (
            <div className="detail-row">
              <span className="detail-icon">📞</span>
              <span className="detail-text">{client.phone}</span>
            </div>
          )}
          
          {client.email && (
            <div className="detail-row">
              <span className="detail-icon">📧</span>
              <span className="detail-text">{client.email}</span>
            </div>
          )}
          

        </div>

        <div className="client-meta">
          <span className="client-id">#{client.id}</span>
          {client.registration_date && (
            <span className="client-date">
              {new Date(client.registration_date).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        .client-card {
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

        .client-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: var(--color-primary);
        }

        .client-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .client-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .client-emoji {
          font-size: 1.2rem;
          filter: brightness(0) invert(1);
        }

        .client-actions {
          display: flex;
          gap: 0.25rem;
          opacity: 1;
        }

        .client-action-btn {
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

        .client-action-btn:hover {
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

        .client-card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .client-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
          line-height: 1.3;
        }

        .client-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .detail-icon {
          font-size: 0.9rem;
          opacity: 0.7;
          min-width: 16px;
        }

        .detail-text {
          color: var(--color-text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .client-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: auto;
          padding-top: 0.5rem;
          border-top: 1px solid var(--color-border-light);
        }

        .client-id {
          font-weight: 500;
          color: var(--color-primary);
        }

        .client-date {
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
          .client-card {
            min-height: 140px;
            padding: 0.75rem;
          }

          .client-name {
            font-size: 1.1rem;
          }

          .detail-text {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

ClientCard.propTypes = {
  client: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    full_name: PropTypes.string.isRequired,
    phone: PropTypes.string,
    email: PropTypes.string,
    registration_date: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  style: PropTypes.object,
};

export default ClientCard;
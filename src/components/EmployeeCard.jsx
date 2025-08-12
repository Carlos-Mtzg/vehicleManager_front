import PropTypes from 'prop-types';

const EmployeeCard = ({ employee, onEdit, onToggleStatus, style }) => {
  return (
    <div className="employee-card" style={style}>
      <div className="employee-card-header">
        <div className="employee-icon">
          <span className="employee-emoji">👨‍💼</span>
        </div>
        <div className="employee-actions">
          <button 
            className="employee-action-btn edit-btn"
            onClick={() => onEdit(employee.id)}
            title="Editar empleado"
          >
            ✏️
          </button>
          <button 
            className={`employee-action-btn ${employee.enabled ? 'disable-btn' : 'enable-btn'}`}
            onClick={() => onToggleStatus(employee)}
            title={employee.enabled ? "Deshabilitar empleado" : "Habilitar empleado"}
          >
            {employee.enabled ? '🚫' : '✅'}
          </button>
        </div>
      </div>

      <div className="employee-card-content">
        <div className="employee-header">
          <h3 className="employee-name">{employee.fullName}</h3>
          <div className={`status-badge ${employee.enabled ? 'enabled' : 'disabled'}`}>
            {employee.enabled ? 'Activo' : 'Inactivo'}
          </div>
        </div>
        
        <div className="employee-details">
          {employee.phone && (
            <div className="detail-row">
              <span className="detail-icon">📞</span>
              <span className="detail-text">{employee.phone}</span>
            </div>
          )}
          
          {employee.email && (
            <div className="detail-row">
              <span className="detail-icon">📧</span>
              <span className="detail-text">{employee.email}</span>
            </div>
          )}
        </div>

        <div className="employee-meta">
          <span className="employee-id">#{employee.id}</span>
          {employee.registrationDate && (
            <span className="employee-date">
              {new Date(employee.registrationDate).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        .employee-card {
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
          opacity: ${employee.enabled ? 1 : 0.7};
        }

        .employee-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: var(--color-primary);
        }

        .employee-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .employee-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .employee-emoji {
          font-size: 1.2rem;
          filter: brightness(0) invert(1);
        }

        .employee-actions {
          display: flex;
          gap: 0.25rem;
          opacity: 1;
        }

        .employee-action-btn {
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

        .employee-action-btn:hover {
          transform: scale(1.1);
        }

        .edit-btn:hover {
          background: var(--color-info);
          color: white;
        }

        .disable-btn:hover {
          background: var(--color-warning);
          color: white;
        }

        .enable-btn:hover {
          background: var(--color-success);
          color: white;
        }

        .employee-card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .employee-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .employee-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
          line-height: 1.3;
          flex: 1;
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .status-badge.enabled {
          background: var(--color-success-light);
          color: var(--color-success);
          border: 1px solid var(--color-success);
        }

        .status-badge.disabled {
          background: var(--color-danger-light);
          color: var(--color-danger);
          border: 1px solid var(--color-danger);
        }

        .employee-details {
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

        .employee-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: auto;
          padding-top: 0.5rem;
          border-top: 1px solid var(--color-border-light);
        }

        .employee-id {
          font-weight: 500;
          color: var(--color-success);
        }

        .employee-date {
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
          .employee-card {
            min-height: 140px;
            padding: 0.75rem;
          }

          .employee-name {
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

EmployeeCard.propTypes = {
  employee: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    fullName: PropTypes.string.isRequired,
    phone: PropTypes.string,
    email: PropTypes.string,
    registrationDate: PropTypes.string,
    enabled: PropTypes.bool,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  style: PropTypes.object,
};

export default EmployeeCard;

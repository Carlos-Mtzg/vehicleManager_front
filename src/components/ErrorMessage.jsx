const ErrorMessage = ({ error, onRetry, className = '' }) => {
  return (
    <div className={`error-container ${className}`}>
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <div className="error-text">
          <h3 className="error-title">Oops! Algo salió mal</h3>
          <p className="error-message">
            {error || 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.'}
          </p>
        </div>
      </div>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry}>
          <span className="retry-icon">🔄</span>
          <span className="retry-text">Intentar de nuevo</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 
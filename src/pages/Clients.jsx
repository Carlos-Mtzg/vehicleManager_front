const Clients = () => {
  return (
    <div className="clients-page">
      <h1>Clientes</h1>
      <p>Gestiona los clientes, registra, actualiza y controla todos los aspectos de tus clientes.</p>
      
      <div className="page-card">
        <h2>Catálogo de Clientes</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <p>Clientes registrados en el sistema</p>
          <button className="action-button">
            <span>➕</span>
            Registrar Cliente
          </button>
        </div>

        <div style={{ 
          padding: '2rem', 
          background: 'var(--color-surface-alt)', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '2px dashed var(--color-border)'
        }}>
          <span style={{ fontSize: '3rem', color: 'var(--color-text-muted)' }}>👤</span>
          <h3 style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>No hay clientes registrados</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Registra el primer cliente para tus vehículos.</p>
        </div>
      </div>
    </div>
  );
};

export default Clients; 
const Clients = () => {
  return (
    <div className="clients-page">
      <h1>Gestión de Clientes</h1>
      <p>Administra la información de tus clientes y sus vehículos.</p>
      
      <div className="page-card">
        <h2>Base de Datos de Clientes</h2>
        <div style={{ 
          padding: '2rem', 
          background: 'var(--color-surface-alt)', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '2px dashed var(--color-border)'
        }}>
          <span style={{ fontSize: '3rem', color: 'var(--color-text-muted)' }}>👥</span>
          <h3 style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Clientes Registrados</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Aquí se mostrará la información de todos los clientes.</p>
        </div>
      </div>
    </div>
  );
};

export default Clients; 
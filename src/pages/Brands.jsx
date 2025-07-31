const Brands = () => {
  return (
    <div className="brands-page">
      <h1>Marcas</h1>
      <p>Gestiona las actividades de mantenimiento de tu flota, programa, supervisa y registra todos los servicios realizados a los vehículos.</p>
      
      <div className="page-card">
        <h2>Catálogo de Marcas</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <p>Marcas registradas en el sistema</p>
          <button className="action-button">
            <span>➕</span>
            Registrar Marca
          </button>
        </div>
        
        <div style={{ 
          padding: '2rem', 
          background: 'var(--color-surface-alt)', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '2px dashed var(--color-border)'
        }}>
          <span style={{ fontSize: '3rem', color: 'var(--color-text-muted)' }}>🌐</span>
          <h3 style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>No hay marcas registradas</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Registra la primera marca para tus vehículos.</p>
        </div>
      </div>
    </div>
  );
};

export default Brands; 
const Vehicles = () => {
  return (
    <div className="vehicles-page">
      <h1>Gestión de Vehículos</h1>
      <p>Administra tu flota vehicular de manera integral. Registra, actualiza y controla todos los aspectos de tus vehículos.</p>
      
      <div className="page-card">
        <h2>Catálogo de Vehículos</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <p>Vehículos registrados en el sistema</p>
          <button className="action-button">
            <span>➕</span>
            Agregar Vehículo
          </button>
        </div>
        
        <div style={{ 
          padding: '2rem', 
          background: 'var(--color-surface-alt)', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '2px dashed var(--color-border)'
        }}>
          <span style={{ fontSize: '3rem', color: 'var(--color-text-muted)' }}>🚗</span>
          <h3 style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>No hay vehículos registrados</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Comienza agregando tu primer vehículo al sistema.</p>
        </div>
      </div>
    </div>
  );
};

export default Vehicles; 
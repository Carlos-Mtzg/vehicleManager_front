const Brands = () => {
  return (
    <div className="brands-page">
      <h1>Gestión de Marcas</h1>
      <p>Administra las marcas de vehículos disponibles en tu inventario.</p>
      
      <div className="page-card">
        <h2>Catálogo de Marcas</h2>
        <div style={{ 
          padding: '2rem', 
          background: 'var(--color-surface-alt)', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '2px dashed var(--color-border)'
        }}>
          <span style={{ fontSize: '3rem', color: 'var(--color-text-muted)' }}>🏷️</span>
          <h3 style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Marcas de Vehículos</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Aquí se mostrarán todas las marcas disponibles.</p>
        </div>
      </div>
    </div>
  );
};

export default Brands; 
import { useState, useEffect } from 'react';
import { vehicleService, debugApiConfig } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import VehicleEditModal from '../components/VehicleEditModal';
import ConfirmationModal from '../components/ConfirmationModal';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 vehículos por página

  // Estados del modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  // Estados del modal de confirmación para eliminar
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar vehículos al montar el componente
  useEffect(() => {
    loadVehicles();
  }, []);

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug API configuration
      if (import.meta.env.DEV) {
        debugApiConfig();
      }
      
      const response = await vehicleService.getAll();
      
      // La API devuelve los datos en response.data.data
      if (response.data && response.data.data) {
        setVehicles(response.data.data);
      } else {
        setVehicles([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar vehículos solo por búsqueda
  const getFilteredVehicles = () => {
    let filtered = [...vehicles];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(vehicle => 
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.id.toString().includes(searchTerm)
      );
    }

    // Ordenar por fecha de registro (más recientes primero)
    filtered.sort((a, b) => {
      return new Date(b.registration_date) - new Date(a.registration_date);
    });

    return filtered;
  };

  // Handlers para acciones de las cards
  const handleEdit = (vehicle) => {
    setSelectedVehicleId(vehicle.id);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedVehicleId(null);
  };

  const handleVehicleUpdated = () => {
    // Recargar la lista de vehículos después de una actualización exitosa
    loadVehicles();
  };

  const handleDelete = (vehicle) => {
    setVehicleToDelete(vehicle);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;
    
    try {
      setIsDeleting(true);
      await vehicleService.delete(vehicleToDelete.id);
      
      // Cerrar modal y limpiar estado primero
      setConfirmModalOpen(false);
      setVehicleToDelete(null);
      setIsDeleting(false);
      
      // Luego recargar la lista
      await loadVehicles();
      
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      alert('Error al eliminar el vehículo: ' + err.message);
      setIsDeleting(false);
    }
  };

  const handleCloseConfirmModal = () => {
    if (!isDeleting) {
      setConfirmModalOpen(false);
      setVehicleToDelete(null);
    }
  };

  const handleSell = (vehicle) => {
    console.log('Sell vehicle:', vehicle);
    // Aquí implementarías la lógica de venta
    // Por ejemplo, podrías abrir otro modal para gestionar la venta
  };

  // Lógica de paginación
  const filteredVehicles = getFilteredVehicles();
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll hacia arriba cuando cambie la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Lógica para mostrar páginas con ellipsis
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        endPage = 5;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="vehicles-page">
        <LoadingSpinner size="large" message="Cargando catálogo de vehículos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicles-page">
        <ErrorMessage error={error} onRetry={loadVehicles} />
      </div>
    );
  }

  return (
    <div className="vehicles-page">
      {/* Header con título y botón de agregar */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Catálogo de Vehículos</h1>
          <p>Explora y gestiona el inventario de vehículos disponibles</p>
        </div>
        <div className="page-actions">
          <button className="action-button" onClick={loadVehicles}>
            🔄 Actualizar
          </button>
          <button className="action-button action-button-primary">
            ➕ Agregar Vehículo
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="page-card search-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por marca, modelo, color o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        <div className="search-summary">
          {searchTerm ? (
            <>
              Mostrando {currentVehicles.length} de {filteredVehicles.length} vehículos 
              {filteredVehicles.length !== vehicles.length && ` (${vehicles.length} total)`}
              {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
            </>
          ) : (
            <>
              Total: {vehicles.length} vehículos
              {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
            </>
          )}
        </div>
      </div>

      {/* Grid de vehículos */}
      {currentVehicles.length > 0 ? (
        <>
          <div className="vehicles-grid">
            {currentVehicles.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSell={handleSell}
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination">
                {/* Botón anterior */}
                <button
                  className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Anterior
                </button>

                {/* Primera página y ellipsis */}
                {currentPage > 3 && totalPages > 5 && (
                  <>
                    <button
                      className="pagination-number"
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
                  </>
                )}

                {/* Números de página */}
                {generatePageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`pagination-number ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                {/* Última página y ellipsis */}
                {currentPage < totalPages - 2 && totalPages > 5 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
                    <button
                      className="pagination-number"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                {/* Botón siguiente */}
                <button
                  className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente →
                </button>
              </div>

              {/* Información de paginación */}
              <div className="pagination-info">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredVehicles.length)} de {filteredVehicles.length} vehículos
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <h3>No se encontraron vehículos</h3>
          <p>
            {searchTerm 
              ? 'Intenta ajustar tu búsqueda para encontrar vehículos'
              : 'Comienza agregando tu primer vehículo al inventario'
            }
          </p>
          {!searchTerm && (
            <button className="action-button action-button-primary">
              ➕ Agregar Primer Vehículo
            </button>
          )}
        </div>
      )}

      {/* Modal de Edición */}
      <VehicleEditModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        vehicleId={selectedVehicleId}
        onVehicleUpdated={handleVehicleUpdated}
      />

      {/* Modal de Confirmación para Eliminar */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Vehículo"
        message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este vehículo del inventario?"
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        type="danger"
        vehicle={vehicleToDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Vehicles; 
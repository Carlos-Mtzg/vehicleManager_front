import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ServiceEditModal from '../components/ServiceEditModal';
import ServiceCreateModal from '../components/ServiceCreateModal';
import ServiceConfirmationModal from '../components/ServiceConfirmationModal';
import ErrorModal from '../components/ErrorModal';

const Services = () => {
  const { getApiBaseUrl, getAuthHeaders } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 9 servicios por página

  // Estados del modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  // Estados del modal de creación
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Estados del modal de confirmación para eliminar
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados del modal de error
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [errorModalType, setErrorModalType] = useState('error');

  // Función para cargar servicios
  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${getApiBaseUrl()}/service`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada');
        }
        if (response.status === 403) {
          throw new Error('Acceso denegado - Token inválido o expirado');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // La API devuelve los datos en data.data
      if (data && data.data) {
        setServices(data.data);
      } else {
        setServices([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  }, [getApiBaseUrl, getAuthHeaders]);

  // Cargar servicios al montar el componente
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filtrar servicios por búsqueda
  const getFilteredServices = () => {
    let filtered = [...services];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.id.toString().includes(searchTerm) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Ordenar por fecha de registro (más recientes primero)
    filtered.sort((a, b) => {
      return new Date(b.registration_date || 0) - new Date(a.registration_date || 0);
    });

    return filtered;
  };

  // Handlers para acciones de las cards
  const handleEdit = (service) => {
    setSelectedServiceId(service.id);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedServiceId(null);
  };

  const handleServiceUpdated = () => {
    // Recargar la lista de servicios después de una actualización exitosa
    loadServices();
  };

  const handleDelete = (service) => {
    setServiceToDelete(service);
    setConfirmModalOpen(true);
  };

  const showErrorModal = (message, type = 'error') => {
    setErrorModalMessage(message);
    setErrorModalType(type);
    setErrorModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`${getApiBaseUrl()}/service/${serviceToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        // Cerrar modal de confirmación primero
        setConfirmModalOpen(false);
        setServiceToDelete(null);
        setIsDeleting(false);

        if (response.status === 401) {
          showErrorModal('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning');
          return;
        }
        if (response.status === 409) {
          showErrorModal(
            `No se puede eliminar el servicio "${serviceToDelete.name}" porque está asignado a uno o más vehículos. Primero debes eliminar o reasignar todos los vehículos de este servicio.`, 
            'warning'
          );
          return;
        }
        showErrorModal(`Error al eliminar el servicio: HTTP ${response.status}`, 'error');
        return;
      }
      
      // Cerrar modal y limpiar estado
      setConfirmModalOpen(false);
      setServiceToDelete(null);
      setIsDeleting(false);
      
      // Mostrar mensaje de éxito y recargar
      showErrorModal(`El servicio "${serviceToDelete.name}" ha sido eliminado correctamente.`, 'success');
      await loadServices();
      
    } catch (err) {
      console.error('Error deleting service:', err);
      setConfirmModalOpen(false);
      setServiceToDelete(null);
      setIsDeleting(false);
      
      showErrorModal(
        'Ocurrió un error inesperado al eliminar el servicio. Por favor, intenta nuevamente.', 
        'error'
      );
    }
  };

  const handleCloseConfirmModal = () => {
    if (!isDeleting) {
      setConfirmModalOpen(false);
      setServiceToDelete(null);
    }
  };

  const handleCreateNew = () => {
    setCreateModalOpen(true);
  };

  const handleServiceCreated = () => {
    // Recargar la lista de servicios después de crear uno nuevo
    loadServices();
  };

  // Lógica de paginación
  const filteredServices = getFilteredServices();
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = filteredServices.slice(startIndex, endIndex);

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
      <div className="services-page">
        <LoadingSpinner size="large" message="Cargando catálogo de servicios..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="services-page">
        <ErrorMessage error={error} onRetry={loadServices} />
      </div>
    );
  }

  return (
    <div className="services-page">
      {/* Header con título y botón de agregar */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Gestión de Servicios</h1>
          <p>Administra los servicios disponibles para los vehículos</p>
        </div>
        <div className="page-actions">
          <button className="action-button" onClick={loadServices}>
            🔄 Actualizar
          </button>
          <button className="action-button action-button-primary" onClick={handleCreateNew}>
            ➕ Agregar Servicio
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, código, descripción o ID..."
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
              Mostrando {currentServices.length} de {filteredServices.length} servicios 
              {filteredServices.length !== services.length && ` (${services.length} total)`}
              {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
            </>
          ) : (
            <>
              Total: {services.length} servicios
              {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
            </>
          )}
        </div>
      </div>

      {/* Grid de servicios */}
      {currentServices.length > 0 ? (
        <>
          <div className="services-grid">
            {currentServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={handleEdit}
                onDelete={handleDelete}
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
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredServices.length)} de {filteredServices.length} servicios
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <h3>No se encontraron servicios</h3>
          <p>
            {searchTerm 
              ? 'Intenta ajustar tu búsqueda para encontrar servicios'
              : 'Comienza agregando tu primer servicio al sistema'
            }
          </p>
          {!searchTerm && (
            <button className="action-button action-button-primary" onClick={handleCreateNew}>
              ➕ Agregar Primer Servicio
            </button>
          )}
        </div>
      )}

      {/* Modal de Edición */}
      <ServiceEditModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        serviceId={selectedServiceId}
        onServiceUpdated={handleServiceUpdated}
      />

      {/* Modal de Creación */}
      <ServiceCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onServiceCreated={handleServiceCreated}
      />

      {/* Modal de Confirmación para Eliminar */}
      <ServiceConfirmationModal
        isOpen={confirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        service={serviceToDelete}
        isLoading={isDeleting}
      />

      {/* Modal de Error/Información */}
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        message={errorModalMessage}
        type={errorModalType}
        title={
          errorModalType === 'success' ? 'Operación Exitosa' :
          errorModalType === 'warning' ? 'Advertencia' :
          errorModalType === 'info' ? 'Información' : 'Error'
        }
      />
    </div>
  );
};

export default Services;

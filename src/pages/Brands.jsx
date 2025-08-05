import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import BrandCard from '../components/BrandCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import BrandEditModal from '../components/BrandEditModal';
import BrandCreateModal from '../components/BrandCreateModal';
import BrandConfirmationModal from '../components/BrandConfirmationModal';
import ErrorModal from '../components/ErrorModal';

const Brands = () => {
  const { getApiBaseUrl, getAuthHeaders } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 9 marcas por página (más compactas)

  // Estados del modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState(null);

  // Estados del modal de creación
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Estados del modal de confirmación para eliminar
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados del modal de error
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [errorModalType, setErrorModalType] = useState('error');

  // Función para cargar marcas
  const loadBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${getApiBaseUrl()}/brand`, {
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
        setBrands(data.data);
      } else {
        setBrands([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading brands:', err);
    } finally {
      setLoading(false);
    }
  }, [getApiBaseUrl, getAuthHeaders]);

  // Cargar marcas al montar el componente
  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filtrar marcas por búsqueda
  const getFilteredBrands = () => {
    let filtered = [...brands];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(brand => 
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.id.toString().includes(searchTerm) ||
        (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Ordenar por fecha de registro (más recientes primero)
    filtered.sort((a, b) => {
      return new Date(b.registration_date) - new Date(a.registration_date);
    });

    return filtered;
  };

  // Handlers para acciones de las cards
  const handleEdit = (brand) => {
    setSelectedBrandId(brand.id);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedBrandId(null);
  };

  const handleBrandUpdated = () => {
    // Recargar la lista de marcas después de una actualización exitosa
    loadBrands();
  };

  const handleDelete = (brand) => {
    setBrandToDelete(brand);
    setConfirmModalOpen(true);
  };

  const showErrorModal = (message, type = 'error') => {
    setErrorModalMessage(message);
    setErrorModalType(type);
    setErrorModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!brandToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`${getApiBaseUrl()}/brand/${brandToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        // Cerrar modal de confirmación primero
        setConfirmModalOpen(false);
        setBrandToDelete(null);
        setIsDeleting(false);

        if (response.status === 401) {
          showErrorModal('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'warning');
          return;
        }
        if (response.status === 409) {
          showErrorModal(
            `No se puede eliminar la marca "${brandToDelete.name}" porque tiene vehículos asociados. Primero debes eliminar o reasignar todos los vehículos de esta marca.`, 
            'warning'
          );
          return;
        }
        showErrorModal(`Error al eliminar la marca: HTTP ${response.status}`, 'error');
        return;
      }
      
      // Cerrar modal y limpiar estado
      setConfirmModalOpen(false);
      setBrandToDelete(null);
      setIsDeleting(false);
      
      // Mostrar mensaje de éxito y recargar
      showErrorModal(`La marca "${brandToDelete.name}" ha sido eliminada correctamente.`, 'success');
      await loadBrands();
      
    } catch (err) {
      console.error('Error deleting brand:', err);
      setConfirmModalOpen(false);
      setBrandToDelete(null);
      setIsDeleting(false);
      
      showErrorModal(
        'Ocurrió un error inesperado al eliminar la marca. Por favor, intenta nuevamente.', 
        'error'
      );
    }
  };

  const handleCloseConfirmModal = () => {
    if (!isDeleting) {
      setConfirmModalOpen(false);
      setBrandToDelete(null);
    }
  };

  const handleCreateNew = () => {
    setCreateModalOpen(true);
  };

  const handleBrandCreated = () => {
    // Recargar la lista de marcas después de crear una nueva
    loadBrands();
  };

  // Lógica de paginación
  const filteredBrands = getFilteredBrands();
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBrands = filteredBrands.slice(startIndex, endIndex);

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
      <div className="brands-page">
        <LoadingSpinner size="large" message="Cargando catálogo de marcas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="brands-page">
        <ErrorMessage error={error} onRetry={loadBrands} />
      </div>
    );
  }

  return (
    <div className="brands-page">
      {/* Header con título y botón de agregar */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Gestión de Marcas</h1>
          <p>Administra las marcas de vehículos disponibles en tu inventario</p>
        </div>
        <div className="page-actions">
          <button className="action-button" onClick={loadBrands}>
            🔄 Actualizar
          </button>
          <button className="action-button action-button-primary" onClick={handleCreateNew}>
            ➕ Agregar Marca
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o ID..."
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
              Mostrando {currentBrands.length} de {filteredBrands.length} marcas 
              {filteredBrands.length !== brands.length && ` (${brands.length} total)`}
              {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
            </>
          ) : (
            <>
              Total: {brands.length} marcas
              {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
            </>
          )}
        </div>
      </div>

      {/* Grid de marcas */}
      {currentBrands.length > 0 ? (
        <>
          <div className="brands-grid">
            {currentBrands.map((brand, index) => (
              <BrandCard
                key={brand.id}
                brand={brand}
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
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredBrands.length)} de {filteredBrands.length} marcas
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🏷️</div>
          <h3>No se encontraron marcas</h3>
          <p>
            {searchTerm 
              ? 'Intenta ajustar tu búsqueda para encontrar marcas'
              : 'Comienza agregando tu primera marca al sistema'
            }
          </p>
          {!searchTerm && (
            <button className="action-button action-button-primary" onClick={handleCreateNew}>
              ➕ Agregar Primera Marca
            </button>
          )}
        </div>
      )}

      {/* Modal de Edición */}
      <BrandEditModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        brandId={selectedBrandId}
        onBrandUpdated={handleBrandUpdated}
      />

      {/* Modal de Creación */}
      <BrandCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onBrandCreated={handleBrandCreated}
      />

      {/* Modal de Confirmación para Eliminar */}
      <BrandConfirmationModal
        isOpen={confirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        brand={brandToDelete}
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

export default Brands; 
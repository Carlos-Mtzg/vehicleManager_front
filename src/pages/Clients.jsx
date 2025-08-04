import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import ClientCard from '../components/ClientCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ClientCreateModal from '../components/ClientCreateModal';
import ClientEditModal from '../components/ClientEditModal';
import ConfirmationModal from '../components/ConfirmationModal';

const Clients = () => {
  const { getApiBaseUrl, getAuthHeaders } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 9 clientes por página

  // Estados del modal de creación
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Estados del modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Estados del modal de confirmación para eliminar
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Función para cargar clientes
  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${getApiBaseUrl()}/user`, {
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
        setClients(data.data);
      } else {
        setClients([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  }, [getApiBaseUrl, getAuthHeaders]);

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filtrar clientes por búsqueda
  const getFilteredClients = () => {
    let filtered = [...clients];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.id.toString().includes(searchTerm) ||
        (client.employee?.full_name && client.employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Ordenar por fecha de registro (más recientes primero)
    filtered.sort((a, b) => {
      return new Date(b.registration_date) - new Date(a.registration_date);
    });

    return filtered;
  };

  // Handlers para acciones de las cards
  const handleEdit = (client) => {
    setSelectedClientId(client.id);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedClientId(null);
  };

  const handleClientUpdated = () => {
    // Recargar la lista de clientes después de una actualización exitosa
    loadClients();
  };

  const handleClientCreated = () => {
    // Recargar la lista de clientes después de crear uno nuevo
    loadClients();
  };

  const handleCreateNew = () => {
    setCreateModalOpen(true);
  };

  const handleDelete = (client) => {
    setClientToDelete(client);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`${getApiBaseUrl()}/user/${clientToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada');
        }
        if (response.status === 409) {
          throw new Error('No se puede eliminar este cliente porque tiene registros asociados');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Cerrar modal y limpiar estado
      setConfirmModalOpen(false);
      setClientToDelete(null);
      setIsDeleting(false);
      
      // Recargar la lista
      await loadClients();
      
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('Error al eliminar el cliente: ' + err.message);
      setIsDeleting(false);
    }
  };

  const handleCloseConfirmModal = () => {
    if (!isDeleting) {
      setConfirmModalOpen(false);
      setClientToDelete(null);
    }
  };

  // Lógica de paginación
  const filteredClients = getFilteredClients();
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

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
      <div className="clients-page">
        <LoadingSpinner size="large" message="Cargando base de datos de clientes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="clients-page">
        <ErrorMessage error={error} onRetry={loadClients} />
      </div>
    );
  }

  return (
    <div className="clients-page">
      {/* Header con título y botón de agregar */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Gestión de Clientes</h1>
          <p>Administra la información de tus clientes y sus datos de contacto</p>
        </div>
        <div className="page-actions">
          <button className="action-button" onClick={loadClients}>
            🔄 Actualizar
          </button>
          <button className="action-button action-button-primary" onClick={handleCreateNew}>
            ➕ Agregar Cliente
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="page-card search-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, email, teléfono o empleado..."
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
              Mostrando {currentClients.length} de {filteredClients.length} clientes 
              {filteredClients.length !== clients.length && ` (${clients.length} total)`}
              {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
            </>
          ) : (
            <>
              Total: {clients.length} clientes
              {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
            </>
          )}
        </div>
      </div>

      {/* Grid de clientes */}
      {currentClients.length > 0 ? (
        <>
          <div className="clients-grid">
            {currentClients.map((client, index) => (
              <ClientCard
                key={client.id}
                client={client}
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
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredClients.length)} de {filteredClients.length} clientes
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No se encontraron clientes</h3>
          <p>
            {searchTerm 
              ? 'Intenta ajustar tu búsqueda para encontrar clientes'
              : 'Comienza agregando tu primer cliente al sistema'
            }
          </p>
          {!searchTerm && (
            <button className="action-button action-button-primary" onClick={handleCreateNew}>
              ➕ Agregar Primer Cliente
            </button>
          )}
        </div>
      )}

      {/* Modal de Creación */}
      <ClientCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onClientCreated={handleClientCreated}
      />

      {/* Modal de Edición */}
      <ClientEditModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        clientId={selectedClientId}
        onClientUpdated={handleClientUpdated}
      />

      {/* Modal de Confirmación para Eliminar */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cliente"
        message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este cliente del sistema?"
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        type="danger"
        vehicle={clientToDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Clients; 
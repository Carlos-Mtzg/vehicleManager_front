import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import EmployeeCard from '../components/EmployeeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmployeeCreateModal from '../components/EmployeeCreateModal';
import EmployeeEditModal from '../components/EmployeeEditModal';
import ConfirmationModal from '../components/ConfirmationModal';

const Employees = () => {
  const { getApiBaseUrl, getAuthHeaders } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 9 empleados por página

  // Estados del modal de creación
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Estados del modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Estados del modal de confirmación para habilitar/deshabilitar
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [employeeToToggle, setEmployeeToToggle] = useState(null);
  const [isToggling, setIsToggling] = useState(false);

  // Función para cargar empleados
  const loadEmployees = useCallback(async () => {
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
        setEmployees(data.data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  }, [getApiBaseUrl, getAuthHeaders]);

  // Cargar empleados al montar el componente
  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filtrar empleados por búsqueda
  const getFilteredEmployees = () => {
    let filtered = [...employees];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(employee => 
        employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone.includes(searchTerm) ||
        employee.id.toString().includes(searchTerm)
      );
    }

    // Ordenar por fecha de registro (más recientes primero)
    filtered.sort((a, b) => {
      return new Date(b.registrationDate || b.createdAt) - new Date(a.registrationDate || a.createdAt);
    });

    return filtered;
  };

  // Obtener empleados paginados
  const getPaginatedEmployees = () => {
    const filtered = getFilteredEmployees();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // Calcular total de páginas
  const totalPages = Math.ceil(getFilteredEmployees().length / itemsPerPage);

  // Función para manejar la creación exitosa
  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    loadEmployees();
  };

  // Función para manejar la edición exitosa
  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setSelectedEmployeeId(null);
    loadEmployees();
  };

  // Función para abrir modal de edición
  const handleEdit = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setEditModalOpen(true);
  };

  // Función para abrir modal de confirmación de habilitar/deshabilitar
  const handleToggleStatus = (employee) => {
    setEmployeeToToggle(employee);
    setConfirmModalOpen(true);
  };

  // Función para confirmar habilitar/deshabilitar
  const handleConfirmToggle = async () => {
    if (!employeeToToggle) return;

    try {
      setIsToggling(true);
      
      const endpoint = employeeToToggle.enabled 
        ? `${getApiBaseUrl()}/user/disabled/${employeeToToggle.id}`
        : `${getApiBaseUrl()}/user/enabled/${employeeToToggle.id}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Actualizar el estado local del empleado
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeToToggle.id 
          ? { ...emp, enabled: !emp.enabled }
          : emp
      ));
      
      setConfirmModalOpen(false);
      setEmployeeToToggle(null);
    } catch (err) {
      setError(err.message);
      console.error('Error toggling employee status:', err);
    } finally {
      setIsToggling(false);
    }
  };

  // Función para cancelar habilitar/deshabilitar
  const handleCancelToggle = () => {
    setConfirmModalOpen(false);
    setEmployeeToToggle(null);
  };

  // Obtener empleado seleccionado para edición
  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Gestión de Empleados</h1>
          <p className="page-subtitle">
            Administra la información de los empleados del taller
          </p>
        </div>
        
        <div className="page-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setCreateModalOpen(true)}
          >
            <span className="btn-icon">➕</span>
            Nuevo Empleado
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar empleados por nombre, email, teléfono o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="search-stats">
          <span className="stats-text">
            {getFilteredEmployees().length} empleado{getFilteredEmployees().length !== 1 ? 's' : ''} encontrado{getFilteredEmployees().length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <ErrorMessage 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      {/* Lista de empleados */}
      {getFilteredEmployees().length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍💼</div>
          <h3 className="empty-title">No hay empleados registrados</h3>
          <p className="empty-description">
            {searchTerm 
              ? 'No se encontraron empleados que coincidan con tu búsqueda.'
              : 'Comienza agregando el primer empleado al sistema.'
            }
          </p>
          {!searchTerm && (
            <button 
              className="btn btn-primary"
              onClick={() => setCreateModalOpen(true)}
            >
              <span className="btn-icon">➕</span>
              Agregar Primer Empleado
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="cards-grid">
            {getPaginatedEmployees().map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onEdit={() => handleEdit(employee.id)}
                onToggleStatus={() => handleToggleStatus(employee)}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← Anterior
              </button>
              
              <div className="pagination-info">
                Página {currentPage} de {totalPages}
              </div>
              
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de creación */}
      {createModalOpen && (
        <EmployeeCreateModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Modal de edición */}
      {editModalOpen && selectedEmployee && (
        <EmployeeEditModal
          employee={selectedEmployee}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedEmployeeId(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal de confirmación de habilitar/deshabilitar */}
      {confirmModalOpen && employeeToToggle && (
        <ConfirmationModal
          isOpen={confirmModalOpen}
          onClose={handleCancelToggle}
          title={employeeToToggle.enabled ? "Deshabilitar Empleado" : "Habilitar Empleado"}
          message={`¿Estás seguro de que deseas ${employeeToToggle.enabled ? 'deshabilitar' : 'habilitar'} al empleado "${employeeToToggle.fullName}"? ${employeeToToggle.enabled ? 'No podrá acceder al sistema hasta que sea habilitado nuevamente.' : 'Podrá acceder al sistema normalmente.'}`}
          onConfirm={handleConfirmToggle}
          onCancel={handleCancelToggle}
          isLoading={isToggling}
          confirmText={employeeToToggle.enabled ? "Deshabilitar" : "Habilitar"}
          cancelText="Cancelar"
          type={employeeToToggle.enabled ? "warning" : "success"}
        />
      )}
    </div>
  );
};

export default Employees;

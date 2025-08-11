import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DashboardHome from './pages/DashboardHome';
import Vehicles from './pages/Vehicles';
import Brands from './pages/Brands';
import Clients from './pages/Clients';
import Services from './pages/Services';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta raíz redirige al dashboard si está autenticado, sino al login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Ruta de login */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas del dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="brands" element={<Brands />} />
            <Route path="clients" element={<Clients />} />
            <Route path="services" element={<Services />} />
          </Route>
          
          {/* Ruta para manejar URLs no encontradas */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

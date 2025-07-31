import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DashboardHome from './pages/DashboardHome';
import Vehicles from './pages/Vehicles';
import Brands from './pages/Brands';
import Clients from './pages/Clients';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta raíz redirige al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Ruta de login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas del dashboard */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="brands" element={<Brands />} />
          <Route path="clients" element={<Clients />} />
        </Route>
        
        {/* Ruta para manejar URLs no encontradas */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

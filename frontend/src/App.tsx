import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Notes from './pages/Notes';
import Updates from './pages/Updates';
import Admin from './pages/Admin';
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública: Login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas Protegidas: Todo lo que esté aquí requiere Token */}
        <Route element={<ProtectedRoute />}>
          
          {/* 2. AQUÍ ESTÁ LA CLAVE: Todo lo que esté aquí adentro tendrá Sidebar y TopBar */}
          <Route element={<MainLayout />}>
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/search" element={<Search />} />
             <Route path="/notes" element={<Notes />} />
             <Route path="/updates" element={<Updates />} />
             <Route path="/profile" element={<Profile />} />
             <Route path="/admin" element={<Admin />} />
          </Route>

        </Route>

        {/* Redirección por defecto: Cualquier ruta desconocida va al Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
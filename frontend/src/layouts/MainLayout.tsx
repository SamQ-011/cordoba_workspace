import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layouts/Sidebar';
import { TopBar } from '../components/layouts/TopBar';
import { useUIStore } from '../store/uiStore'; // <--- 1. Importamos el cerebro de la UI
import clsx from 'clsx'; // <--- 2. Importamos clsx para mezclar clases

export const MainLayout = () => {
  // 3. Leemos el estado global: ¿Está colapsado?
  const { isSidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Sidebar Fijo a la izquierda */}
      <Sidebar />

      {/* Contenedor Principal */}
      <div 
        className={clsx(
          "flex-1 flex flex-col min-h-screen relative transition-all duration-300 ease-in-out",
          // 4. AQUÍ ESTÁ EL TRUCO:
          // Si está colapsado (true) -> margen izquierdo 20 (80px)
          // Si está abierto (false)    -> margen izquierdo 64 (256px)
          isSidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        
        {/* Barra Superior */}
        <TopBar />

        {/* Contenido Dinámico de las Páginas */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
};
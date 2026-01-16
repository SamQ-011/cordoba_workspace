import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore'; // <--- IMPORTAR STORE
import { 
  LayoutDashboard, Search, FileText, Bell, User, 
  ShieldAlert, LogOut, ChevronLeft, ChevronRight 
} from 'lucide-react';
import clsx from 'clsx';

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  
  // Usamos el estado global
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  
  const isAdmin = user?.role === 'Admin';

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Notes', path: '/notes', icon: FileText },
    { label: 'Updates', path: '/updates', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User }
  ];

  if (isAdmin) {
    menuItems.unshift({ label: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }

  return (
    <aside 
      className={clsx(
        "bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0 z-30 shadow-2xl font-sans transition-all duration-300 ease-in-out border-r border-slate-800",
        isSidebarCollapsed ? "w-20" : "w-64" // Ancho dinámico
      )}
    >
      
      {/* BOTÓN DE TOGGLE */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-9 bg-blue-600 text-white p-1 rounded-full shadow-lg hover:bg-blue-500 transition-colors z-40 border border-slate-800 flex items-center justify-center"
      >
        {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* LOGO */}
      <div className={clsx("h-20 flex items-center border-b border-white/10 transition-all", isSidebarCollapsed ? "justify-center px-0" : "px-6")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <span className="font-bold text-lg text-white">C</span>
          </div>
          <span className={clsx(
            "text-lg font-bold tracking-tight text-white transition-all duration-300 overflow-hidden whitespace-nowrap",
            isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            Cordoba<span className="text-blue-400 font-light">WorkSpace</span>
          </span>
        </div>
      </div>

      {/* MENÚ */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
        {!isSidebarCollapsed && (
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 animate-in fade-in">
            Main Menu
          </p>
        )}
        
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isSidebarCollapsed ? item.label : ""}
            className={({ isActive }) => clsx(
              "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ease-out text-sm font-medium border border-transparent",
              isActive 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                : "text-slate-400 hover:bg-white/5 hover:text-white",
              isSidebarCollapsed ? "justify-center" : ""
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={20} 
                  className={clsx(
                    "transition-transform duration-300 shrink-0",
                    isActive ? "text-white scale-105" : "text-slate-400 group-hover:text-white"
                  )} 
                />
                <span className={clsx(
                  "transition-all duration-300 overflow-hidden whitespace-nowrap",
                  isSidebarCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
                )}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <button 
          onClick={logout}
          title={isSidebarCollapsed ? "Sign Out" : ""}
          className={clsx(
            "flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group",
            isSidebarCollapsed ? "justify-center px-0" : ""
          )}
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform shrink-0" />
          <span className={clsx(
            "transition-all duration-300 overflow-hidden whitespace-nowrap",
            isSidebarCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
          )}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};
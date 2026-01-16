import { useState } from 'react';
import { 
  LayoutDashboard, Users, Megaphone, FileText, Database, Shield 
} from 'lucide-react';
import clsx from 'clsx';

// Importamos los componentes limpios
import { DashboardTab } from '../components/admin/DashboardTab';
import { UsersTab } from '../components/admin/UsersTab';
import { ReportsTab } from '../components/admin/ReportsTab';
import { BanksTab } from '../components/admin/BanksTab';
import { NewsTab } from '../components/admin/NewsTab';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'reports', label: 'Reportes', icon: FileText },
    { id: 'banks', label: 'Bancos', icon: Database },
    { id: 'news', label: 'Noticias', icon: Megaphone },
  ];

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-slate-900 text-white rounded-2xl">
          <Shield size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Torre de Control</h1>
          <p className="text-slate-500">Panel de Administración General</p>
        </div>
      </div>

      {/* Navegación Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-200 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-6 py-3 rounded-t-xl font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-white border-x border-t border-slate-200 text-blue-600 translate-y-[1px]" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido Dinámico */}
      <div className="min-h-[500px]">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'banks' && <BanksTab />}
        {activeTab === 'news' && <NewsTab />}
      </div>
    </div>
  );
}
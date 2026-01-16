import { useState, useEffect } from 'react';
import { AlertTriangle, Info, Check, Megaphone } from 'lucide-react';
import api from '../api/axios';
import clsx from 'clsx';

// Definimos la estructura de datos (ajusta si tu backend varía)
interface UpdateItem {
  id: number;
  title: string;
  message: string;
  category: 'Critical' | 'Warning' | 'Info';
  date: string;
  read?: boolean; // Estado local para UI
}

export default function Updates() {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'INFO'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await api.get('/updates/');
        // Simulamos un delay o transformamos datos si es necesario
        setUpdates(res.data.map((u: any) => ({ ...u, read: u.read || false })));
      } catch (error) {
        console.error("Error fetching updates", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  const markAsRead = async (id: number) => {
    // Optimistic UI Update (Actualizamos visualmente antes de esperar al server)
    setUpdates(prev => prev.map(u => u.id === id ? { ...u, read: true } : u));
    try {
      await api.post(`/updates/${id}/read`);
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  // Filtrado
  const filteredUpdates = updates.filter(u => {
    // 1. Tab "All": Muestra todo
    if (filter === 'ALL') return true;
    
    // 2. Tab "Critical": Muestra Critical Y Warning
    if (filter === 'CRITICAL') {
      return u.category === 'Critical' || u.category === 'Warning';
    }
    
    // 3. Tab "General": Muestra TODO lo que sobre
    // (Cualquier cosa que NO sea Critical ni Warning cae aquí)
    return u.category !== 'Critical' && u.category !== 'Warning';
  });

  // Configuración de Estilos por Categoría
  const styles = {
    Critical: { icon: AlertTriangle, bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
    Warning: { icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    Info: { icon: Info, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' }
  };

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      
      {/* 1. HEADER + FILTER TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Updates Center</h1>
          <p className="text-slate-500 mt-1">System announcements and operational news.</p>
        </div>

        {/* Filtros Tipo Cápsula */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center self-start md:self-auto">
          {[
            { id: 'ALL', label: 'All Updates' },
            { id: 'CRITICAL', label: 'Critical' },
            { id: 'INFO', label: 'General' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={clsx(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                filter === tab.id 
                  ? "bg-white text-slate-800 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. LISTA DE ACTUALIZACIONES */}
      <div className="max-w-4xl space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading updates...</div>
        ) : filteredUpdates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
            <Megaphone size={40} className="text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm font-medium">No updates found in this category.</p>
          </div>
        ) : (
          filteredUpdates.map((item) => {
            // Fallback por si la categoría viene rara
            const style = styles[item.category] || styles.Info;
            const Icon = style.icon;

            return (
              <div 
                key={item.id} 
                className={clsx(
                  "relative bg-white p-6 rounded-2xl border shadow-sm transition-all duration-300",
                  item.read ? "border-slate-100 opacity-60 grayscale-[0.5]" : "border-slate-200 hover:shadow-md hover:border-blue-200"
                )}
              >
                <div className="flex gap-5 items-start">
                  
                  {/* ICONO DE CATEGORÍA */}
                  <div className={clsx("shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", style.bg, style.text)}>
                    <Icon size={20} />
                  </div>

                  {/* CONTENIDO */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                      <h3 className={clsx("text-base font-bold", item.read ? "text-slate-600" : "text-slate-800")}>
                        {item.title}
                      </h3>
                      
                      {/* Fecha Badge */}
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit">
                        {item.date}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {item.message}
                    </p>
                  </div>

                  {/* ACCIÓN (MARK AS READ) */}
                  <div className="shrink-0 ml-2">
                    <button
                      onClick={() => markAsRead(item.id)}
                      disabled={item.read}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border",
                        item.read
                          ? "bg-transparent border-transparent text-emerald-600 cursor-default"
                          : "bg-white border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                      )}
                      title={item.read ? "Acknowledged" : "Mark as Read"}
                    >
                      {item.read ? (
                        <>
                          <Check size={16} /> <span className="hidden sm:inline">Read</span>
                        </>
                      ) : (
                        <span className="hidden sm:inline">Acknowledge</span>
                      )}
                      {!item.read && <div className="w-2 h-2 bg-blue-500 rounded-full sm:hidden"></div>}
                    </button>
                  </div>

                </div>
                
                {/* Indicador visual de "Nuevo" (Punto azul a la izquierda) */}
                {!item.read && (
                  <div className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full bg-blue-500"></div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
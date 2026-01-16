import { useState, useEffect } from 'react';
import clsx from 'clsx';
import api from '../../api/axios';

export const DashboardTab = () => {
  const [stats, setStats] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data)).catch(console.error);
    api.get('/admin/live-feed').then(res => setFeed(res.data)).catch(console.error);
  }, []);

  if (!stats) return <div className="p-12 text-center text-slate-400">Cargando métricas...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Base de Datos', val: stats.total_banks, sub: 'Bancos Activos', color: 'bg-blue-50 text-blue-700' },
          { label: 'Llamadas Hoy', val: stats.total_calls, sub: 'Registros', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Ventas Hoy', val: stats.sales_today, sub: 'Completed WC', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Estado', val: 'En Línea', sub: 'Sistema Operativo', color: 'bg-slate-50 text-slate-700' }
        ].map((k, i) => (
          <div key={i} className={`p-4 rounded-2xl border border-transparent ${k.color}`}>
            <div className="text-2xl font-bold">{k.val}</div>
            <div className="text-xs font-bold uppercase opacity-60">{k.label}</div>
            <div className="text-xs mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Live Feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-700 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Actividad en Tiempo Real
        </div>
        <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
          {feed.length === 0 ? (
            <p className="p-6 text-center text-slate-400 text-sm">Esperando actividad...</p>
          ) : (
            feed.map((item: any, i) => (
              <div key={i} className="px-6 py-3 text-xs flex justify-between items-center hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400">{item.time}</span>
                  <span className="font-bold text-slate-700 w-32 truncate" title={item.agent_real_name}>
                    {item.agent_real_name}
                  </span>
                  <span className={clsx("px-2 py-0.5 rounded-full border", 
                    item.result.includes('Not') 
                      ? "bg-red-50 text-red-700 border-red-100" 
                      : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  )}>
                    {item.result}
                  </span>
                  <span className="text-slate-500 hidden sm:inline">{item.affiliate}</span>
                </div>
                <span className="font-mono text-slate-400">{item.cordoba_id}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
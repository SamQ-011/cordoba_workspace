import { useState, useEffect } from 'react';
import { Database, Save, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import api from '../../api/axios';

export const BanksTab = () => {
  const [misses, setMisses] = useState<any[]>([]);
  const [newBank, setNewBank] = useState({ name: '', abreviation: '' });

  const fetchMisses = () => api.get('/creditors/misses/list').then(res => setMisses(res.data)).catch(console.error);
  useEffect(() => { fetchMisses(); }, []);

  const handleDismiss = async (id: number) => {
    await api.delete(`/creditors/misses/${id}`);
    fetchMisses();
  };

  const handleAddBank = async () => {
    if (!newBank.name || !newBank.abreviation) return alert("Faltan datos");
    try {
      await api.post('/creditors/', newBank);
      alert("✅ Banco creado exitosamente");
      setNewBank({ name: '', abreviation: '' });
    } catch (error) { alert("Error creando banco"); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      
      {/* Columna Izq: Agregar Banco */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Database size={18} className="text-blue-500" /> Nuevo Acreedor
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500">Nombre Oficial</label>
            <input className="w-full p-2 border rounded-lg mt-1" placeholder="Ej: JPMORGAN CHASE BANK" value={newBank.name} onChange={e => setNewBank({...newBank, name: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Código/Abreviación</label>
            <input className="w-full p-2 border rounded-lg mt-1 font-mono uppercase" placeholder="Ej: CHASE" value={newBank.abreviation} onChange={e => setNewBank({...newBank, abreviation: e.target.value.toUpperCase()})} />
          </div>
          <button onClick={handleAddBank} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
            <Save size={16} /> Guardar Banco
          </button>
        </div>
      </div>

      {/* Columna Der: Reportes de Agentes */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" /> 
            Reportes de Agentes ({misses.length})
          </h3>
          <button onClick={fetchMisses} className="text-xs text-blue-600 font-bold hover:underline">Refrescar</button>
        </div>

        <div className="space-y-3">
          {misses.length === 0 ? (
            <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400">
              <CheckCircle2 size={32} className="mx-auto mb-2 opacity-20" />
              <p>Todo limpio. No hay reportes pendientes.</p>
            </div>
          ) : (
            misses.map((m: any) => (
              <div key={m.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-red-100 transition-all">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded text-sm">{m.abreviation}</span>
                    <span className="text-xs text-slate-400">reportado en</span>
                    <span className="font-mono text-xs text-slate-600 font-medium">{m.cordoba_id}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => handleDismiss(m.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Descartar reporte"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
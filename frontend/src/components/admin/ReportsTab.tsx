import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import clsx from 'clsx';
import api from '../../api/axios';

export const ReportsTab = () => {
  const [params, setParams] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    report_type: 'Estratégico (KPIs & Negocio)'
  });
  const [loading, setLoading] = useState(false);

  const downloadReport = async () => {
    setLoading(true);
    try {
      const response = await api.post('/admin/export-excel', params, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_${params.start_date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) { alert("Error generando reporte"); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6 text-slate-800">
        <div className="p-2 bg-green-100 text-green-700 rounded-lg"><FileText size={24} /></div>
        <h3 className="text-xl font-bold">Generador de Reportes Excel</h3>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Desde</label>
            <input type="date" className="w-full p-3 border rounded-xl" value={params.start_date} onChange={e => setParams({...params, start_date: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Hasta</label>
            <input type="date" className="w-full p-3 border rounded-xl" value={params.end_date} onChange={e => setParams({...params, end_date: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2">Tipo de Reporte</label>
          <div className="grid grid-cols-1 gap-2">
            {['Estratégico (KPIs & Negocio)', 'Operativo (Desempeño & Detalle)', 'Calidad (Fricción & Errores)'].map(type => (
              <button
                key={type}
                onClick={() => setParams({...params, report_type: type})}
                className={clsx("p-3 rounded-xl border text-left text-sm transition-all", params.report_type === type ? 'border-green-500 bg-green-50 text-green-800 font-bold ring-1 ring-green-500' : 'border-slate-200 hover:border-slate-300')}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={downloadReport} 
          disabled={loading}
          className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
        >
          {loading ? 'Generando...' : <><Download size={20} /> Descargar Reporte Excel</>}
        </button>
      </div>
    </div>
  );
};
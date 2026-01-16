import { useState, useEffect } from 'react';
import { Megaphone, Archive } from 'lucide-react';
import clsx from 'clsx';
import api from '../../api/axios';

export const NewsTab = () => {
  const [activeNews, setActiveNews] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', message: '', category: 'Info', date: new Date().toISOString().split('T')[0] });

  const fetchNews = () => api.get('/updates/').then(res => setActiveNews(res.data));
  useEffect(() => { fetchNews(); }, []);

  const handlePublish = async () => {
    if (!form.title || !form.message) return alert("Faltan datos");
    try {
      await api.post('/admin/updates', form);
      alert("Noticia publicada");
      setForm({ ...form, title: '', message: '' });
      fetchNews();
    } catch (e) { alert("Error publicando"); }
  };

  const handleArchive = async (id: number) => {
    if(!confirm("¿Archivar esta noticia? Dejará de ser visible.")) return;
    await api.patch(`/admin/updates/${id}/archive`);
    fetchNews();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* Editor */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Megaphone size={18} className="text-indigo-500" /> Publicar Novedad
        </h3>
        <div className="space-y-3">
          <input className="w-full p-2 border rounded-lg text-sm" placeholder="Título Corto" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <textarea className="w-full p-2 border rounded-lg text-sm h-24 resize-none" placeholder="Mensaje detallado..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-3">
            <select className="p-2 border rounded-lg text-sm bg-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="Info">Info (Azul)</option>
              <option value="Warning">Warning (Ámbar)</option>
              <option value="Critical">Critical (Rojo)</option>
            </select>
            <input type="date" className="p-2 border rounded-lg text-sm" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          </div>

          <button onClick={handlePublish} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Publicar Ahora</button>
        </div>
      </div>

      {/* Lista Activas */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="font-bold text-slate-800">Noticias Activas ({activeNews.length})</h3>
        {activeNews.map((n: any) => (
          <div key={n.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex gap-4 group">
            <div className={clsx("w-1 h-full rounded-full self-stretch", 
              n.category === 'Critical' ? 'bg-red-500' : n.category === 'Warning' ? 'bg-amber-500' : 'bg-blue-500'
            )} />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-800">{n.title}</h4>
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">{n.date}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{n.message}</p>
            </div>
            <button 
              onClick={() => handleArchive(n.id)}
              className="self-start text-slate-300 hover:text-red-500 transition-colors"
              title="Archivar"
            >
              <Archive size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
import { useState } from 'react';
import { Database, UploadCloud, AlertTriangle, CheckCircle2, Save, X, Play } from 'lucide-react';
import api from '../../api/axios';
import type { BatchResponse } from '../../types/search';

export default function BatchSearch() {
  const [input, setInput] = useState('');
  const [data, setData] = useState<BatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Reporting States
  const [cordobaId, setCordobaId] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const handleProcess = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/creditors/batch', { raw_text: input });
      setData(res.data);
    } catch (error) {
      alert("Error processing batch.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setData(null);
    setCordobaId('');
  };

  const handleReport = async () => {
    if (!cordobaId || !data?.unknown.length) return;
    setIsReporting(true);
    try {
      const promises = data.unknown.map(code => 
        api.post('/creditors/report-miss', { abreviation: code, cordoba_id: cordobaId })
      );
      await Promise.all(promises);
      alert('✅ Report sent successfully.');
      setData(prev => prev ? { ...prev, unknown: [] } : null);
      setCordobaId('');
    } catch (error) {
      alert('❌ Error sending report.');
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      
      {/* --- LEFT COLUMN: INPUT --- */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-white p-1 rounded-2xl shadow-card border border-slate-200 h-full flex flex-col relative group">
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
            <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <UploadCloud size={16} className="text-blue-500" /> Input Data
            </h3>
            
            {input && (
              <button 
                onClick={handleClear}
                className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 flex items-center gap-1 transition-all px-3 py-1.5 rounded-full shadow-sm hover:shadow"
              >
                <X size={12} /> CLEAR
              </button>
            )}
          </div>

          {/* Text Area */}
          <textarea
            className="flex-1 w-full p-4 bg-white focus:bg-slate-50/50 outline-none transition-all font-mono text-xs leading-relaxed resize-none text-slate-600 rounded-b-xl min-h-[300px]"
            placeholder={`Paste your list here...\nExample:\nCHASE BANK\nAMEX - $500\nBOFA 12/05`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        <button
          onClick={handleProcess}
          disabled={!input || loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
        >
          {loading ? <span className="animate-spin">⏳</span> : <Play size={18} fill="currentColor" />}
          {loading ? 'Analyzing...' : 'Process List'}
        </button>
      </div>

      {/* --- RIGHT COLUMN: RESULTS --- */}
      <div className="lg:col-span-8">
        {!data ? (
          <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <Database size={48} className="mb-4 opacity-10" />
            <p className="text-sm font-medium">Waiting for data to analyze...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. FOUND TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-emerald-50/50 flex justify-between items-center">
                <h3 className="font-bold text-emerald-800 text-sm flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500" /> 
                  Found ({data.found.length})
                </h3>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {data.found.length === 0 ? (
                  <p className="p-8 text-center text-slate-400 text-xs">No known codes detected.</p>
                ) : (
                  <table className="min-w-full divide-y divide-slate-50">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Input</th>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Detected</th>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Official Bank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.found.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-2 text-xs font-mono text-slate-400 truncate max-w-[120px]">{item.input}</td>
                          <td className="px-4 py-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              {item.code}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-xs font-medium text-slate-700">{item.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* 2. UNKNOWN ZONE */}
            {data.unknown.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-red-100 bg-red-50/30 flex justify-between items-center">
                  <h3 className="font-bold text-red-700 text-sm flex items-center gap-2">
                    <AlertTriangle size={18} /> 
                    Unknown ({data.unknown.length})
                  </h3>
                </div>
                
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* List */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 h-32 overflow-y-auto">
                    <pre className="text-slate-600 text-xs font-mono leading-relaxed">
                      {data.unknown.join('\n')}
                    </pre>
                  </div>

                  {/* Report Action */}
                  <div className="flex flex-col justify-end">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Are these valid banks?</p>
                      
                      <div className="flex flex-col gap-2 w-full">
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-red-400 focus:ring-red-400 outline-none transition-all placeholder:text-slate-300"
                          placeholder="Cordoba ID (e.g. 11854)"
                          value={cordobaId}
                          onChange={(e) => setCordobaId(e.target.value)}
                        />
                        <button
                          onClick={handleReport}
                          disabled={isReporting || !cordobaId}
                          className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                          <Save size={14} />
                          {isReporting ? 'Sending...' : 'Report Missing'}
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Database, Search as SearchIcon } from 'lucide-react';
import clsx from 'clsx';
import BatchSearch from '../components/search/BatchSearch';
import ManualSearch from '../components/search/ManualSearch';

export default function Search() {
  const [activeTab, setActiveTab] = useState<'batch' | 'manual'>('batch');

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      
      {/* Header + Selector Moderno */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Creditor Search</h1>
          <p className="text-slate-500 mt-1">Identify bank codes and creditor abbreviations.</p>
        </div>

        {/* Selector tipo "Píldora" (Segmented Control) */}
        <div className="bg-slate-100 p-1.5 rounded-xl flex items-center self-start md:self-auto">
          <button
            onClick={() => setActiveTab('batch')}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm",
              activeTab === 'batch' 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 shadow-none"
            )}
          >
            <Database size={16} /> Batch Process
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm",
              activeTab === 'manual' 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 shadow-none"
            )}
          >
            <SearchIcon size={16} /> Manual Search
          </button>
        </div>
      </div>

      {/* Renderizado de Componentes */}
      <div className="min-h-[500px]">
        {activeTab === 'batch' ? <BatchSearch /> : <ManualSearch />}
      </div>
      
    </div>
  );
}
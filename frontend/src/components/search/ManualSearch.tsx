import { useState, useEffect } from 'react';
import { Search, Copy, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import clsx from 'clsx';
import type { Creditor } from '../../types/search';

export default function ManualSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Creditor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const res = await api.get(`/creditors/?q=${query}`);
          setResults(res.data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Search Bar */}
      <div className="relative mb-8 group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className={clsx("h-6 w-6 transition-colors", loading ? "text-blue-500 animate-pulse" : "text-slate-300 group-hover:text-blue-400")} />
        </div>
        <input
          type="text"
          className="block w-full pl-14 pr-4 py-5 border-2 border-slate-100 rounded-2xl bg-white placeholder:text-slate-300 focus:border-blue-500 focus:ring-0 shadow-sm text-xl transition-all font-medium text-slate-700"
          placeholder="Type to search (e.g. CHASE)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Results */}
      <div className="space-y-3">
        {results.length > 0 ? (
          results.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 font-bold font-mono text-sm border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                  {item.abreviation}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{item.name}</h4>
                  <p className="text-xs text-slate-400">Database ID: {item.id}</p>
                </div>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(item.abreviation)}
                className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                title="Copy Code"
              >
                <Copy size={20} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            {query.length > 1 && !loading && (
               <div className="text-slate-400 flex flex-col items-center">
                 <AlertCircle size={40} className="mb-2 opacity-20" />
                 <p>No results found for "{query}"</p>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
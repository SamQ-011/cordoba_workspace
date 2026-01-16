import { useEffect, useState } from 'react';
import { History, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import clsx from 'clsx';

interface LogItem {
  id: number;
  created_at: string;
  customer: string;
  cordoba_id: string;
  result: string;
  affiliate: string;
}

interface Props {
  refreshTrigger: number; // Un contador simple para forzar recarga
}

export default function NotesHistory({ refreshTrigger }: Props) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      // setLoading(true); // Opcional: no poner loading para que sea "silencioso" al actualizar
      try {
        const res = await api.get('/logs/history');
        setLogs(res.data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [refreshTrigger]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric'
    }).format(date);
  };

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center gap-2 mb-4 px-1">
        <History size={18} className="text-slate-400" />
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
          Recent Activity (Last 15)
        </h3>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="p-8 flex justify-center text-slate-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No activity recorded today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-bold">
                <tr>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Result</th>
                  <th className="px-6 py-3">Affiliate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => {
                  const isCompleted = log.result.includes('Completed') && !log.result.includes('Not');
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-3 text-slate-500 font-mono text-xs whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-3 font-bold text-slate-700">
                        {log.customer}
                      </td>
                      <td className="px-6 py-3 font-mono text-slate-500 text-xs">
                        {log.cordoba_id}
                      </td>
                      <td className="px-6 py-3">
                        <span className={clsx(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                          isCompleted 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        )}>
                          {isCompleted ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          {isCompleted ? 'COMPLETED' : 'NOT COMPLETED'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs truncate max-w-[150px]" title={log.affiliate}>
                        {log.affiliate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
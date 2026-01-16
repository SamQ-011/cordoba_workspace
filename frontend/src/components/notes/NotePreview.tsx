import { Save, Copy, Check, FileText } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface NotePreviewProps {
  finalNote: string;
  setFinalNote: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

export default function NotePreview({ finalNote, setFinalNote, onSave, saving }: NotePreviewProps) {
  const [copied, setCopied] = useState(false);

  // Detectar status para el Badge
  const isCompleted = finalNote.includes("WC Completed");
  const statusColor = isCompleted ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200";
  const statusText = isCompleted ? "COMPLETED" : "NOT COMPLETED";

  const handleCopy = () => {
    navigator.clipboard.writeText(finalNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      
      {/* TARJETA PRINCIPAL (Limpia, sin bordes raros) */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        
        {/* HEADER: Título + Badge de Estado + Botón Copiar */}
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText size={12} /> GENERATED NOTE
            </span>
            {/* Badge de Estado Elegante */}
            <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded border w-fit mt-1", statusColor)}>
              {statusText}
            </span>
          </div>

          {/* BOTÓN COPIAR RESALTADO (Estilo Action) */}
          <button 
            onClick={handleCopy}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95",
              copied 
                ? "bg-emerald-500 text-white shadow-emerald-200" 
                : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white hover:shadow-blue-200"
            )}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'COPIED!' : 'COPY TEXT'}
          </button>
        </div>

        {/* ÁREA DE TEXTO (Tipografía Moderna) */}
        <div className="flex-1 p-2 bg-white">
          <textarea
            className="w-full h-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
            style={{ fontFamily: 'inherit' }} // Forzar fuente sans-serif (Inter/System)
            value={finalNote}
            onChange={(e) => setFinalNote(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

      {/* BOTÓN DE GUARDAR */}
      <button
        onClick={onSave}
        disabled={saving}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99]"
      >
        {saving ? (
          <span className="animate-spin text-white/50">⏳</span> 
        ) : (
          <Save size={20} />
        )}
        {saving ? 'Saving...' : 'Save Log to Database'}
      </button>

    </div>
  );
}
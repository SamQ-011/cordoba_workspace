import { X, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: any;
  isSaving: boolean;
}

export default function ConfirmationModal({ isOpen, onClose, onConfirm, data, isSaving }: ConfirmationModalProps) {
  if (!isOpen || !data) return null;

  const isCompleted = data.result === 'Completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop (Fondo oscuro borroso) */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
            <AlertCircle size={16} className="text-blue-500" />
            Confirm Submission
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="text-center mb-2">
            <p className="text-slate-500 text-sm">Please verify the details before saving to the database.</p>
          </div>

          {/* Tarjeta de Resumen */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
            
            {/* Fila 1: Cliente */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Customer</span>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">{data.customer}</p>
                <p className="text-xs font-mono text-slate-500">{data.cordoba_id}</p>
              </div>
            </div>

            {/* Fila 2: Resultado */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Outcome</span>
              <span className={clsx(
                "px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5",
                isCompleted 
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                  : "bg-rose-100 text-rose-700 border border-rose-200"
              )}>
                {isCompleted ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {data.result}
              </span>
            </div>

            {/* Fila 3: Info Source / Progress */}
            <div className="flex justify-between items-start pt-1">
              <span className="text-xs font-bold text-slate-400 uppercase mt-0.5">Info Status</span>
              <p className="text-xs text-slate-600 text-right max-w-[180px] leading-tight">
                {data.info_until}
              </p>
            </div>
          </div>

          {/* Alerta de comentario si existe */}
          {data.comments && (
            <div className="flex gap-3 bg-amber-50 p-3 rounded-lg border border-amber-100">
              <span className="text-xs font-bold text-amber-700 uppercase shrink-0">Note:</span>
              <p className="text-xs text-amber-800 italic line-clamp-2">{data.comments}</p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? <span className="animate-spin">⏳</span> : null}
            {isSaving ? 'Saving...' : 'Confirm & Save'}
          </button>
        </div>

      </div>
    </div>
  );
}
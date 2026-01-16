import { RotateCcw, CheckCircle2, XCircle, FileText } from 'lucide-react';
import clsx from 'clsx';

const PROGRESS_OPTIONS = [
  "All info provided", "All, info provided by another agent", "No info provided", 
  "the text message of the VCF", "the banking info verification", 
  "the enrollment plan verification", "the Yes/No verification questions", 
  "the creditors verification", "the right of offset", "Intro"
];

// Opciones para cuando se completa la venta
const COMPLETED_SOURCES = [
  "All info provided", 
  "All, info provided by another agent"
];

const TRANSFER_FAIL_REASONS = [
  "Unsuccessful, number was not in service.",
  "Unsuccessful, attempted to contact sales back with no success.",
  "Unsuccessful, the SA was unavailable.",
  "Unsuccessful, the Cx disconnected the call."
];

interface NoteFormProps {
  rawText: string;
  setRawText: (v: string) => void;
  outcome: 'Completed' | 'Not Completed';
  setOutcome: (v: 'Completed' | 'Not Completed') => void;
  
  // --- NUEVO: Props para la fuente de info en Completed ---
  completedSource: string;
  setCompletedSource: (v: string) => void;
  // -----------------------------------------------------

  reason: string;
  setReason: (v: string) => void;
  stage: string;
  setStage: (v: string) => void;
  returned: 'Yes' | 'No';
  setReturned: (v: 'Yes' | 'No') => void;
  transferStatus: 'Successful' | 'Unsuccessful';
  setTransferStatus: (v: 'Successful' | 'Unsuccessful') => void;
  transferFailReason: string;
  setTransferFailReason: (v: string) => void;
  onReset: () => void;
}

export default function NoteForm(props: NoteFormProps) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 h-full">
      
      {/* Header Compacto */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-50">
        <h3 className="font-bold text-slate-700 text-xs flex items-center gap-2">
          <FileText size={14} className="text-blue-500" />
          CASE DETAILS
        </h3>
        <button onClick={props.onReset} className="text-[10px] text-slate-400 hover:text-blue-500 flex items-center gap-1 transition-colors">
          <RotateCcw size={10} /> RESET
        </button>
      </div>

      {/* 1. INPUT CRM */}
      <textarea
        className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50/50 text-xs font-mono h-24 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none placeholder:text-slate-300"
        placeholder="Paste Forth CRM data here..."
        value={props.rawText}
        onChange={(e) => props.setRawText(e.target.value)}
      />

      {/* 2. CALL OUTCOME */}
      <div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => props.setOutcome('Completed')}
            className={clsx(
              "flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-bold transition-all border",
              props.outcome === 'Completed' 
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm" 
                : "bg-white border-slate-200 text-slate-400 hover:border-emerald-200 hover:text-emerald-600"
            )}
          >
            <CheckCircle2 size={14} /> Completed
          </button>

          <button
            onClick={() => props.setOutcome('Not Completed')}
            className={clsx(
              "flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-bold transition-all border",
              props.outcome === 'Not Completed' 
                ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm" 
                : "bg-white border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-600"
            )}
          >
            <XCircle size={14} /> Not Completed
          </button>
        </div>
      </div>

      {/* 3A. LÓGICA PARA COMPLETED (NUEVO) */}
      {props.outcome === 'Completed' && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
          <label className="text-[10px] font-bold text-emerald-700 mb-1 block uppercase">
            Info Source (For Database Only)
          </label>
          <select 
            className="w-full px-2 py-1.5 border border-emerald-200 rounded-md text-xs bg-white focus:border-emerald-500 outline-none h-8 text-emerald-800 font-medium"
            value={props.completedSource}
            onChange={(e) => props.setCompletedSource(e.target.value)}
          >
            {COMPLETED_SOURCES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      )}

      {/* 3B. LÓGICA PARA NOT COMPLETED */}
      {props.outcome === 'Not Completed' && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200 bg-slate-50/80 p-3 rounded-lg border border-slate-100">
          
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Internal Reason</label>
              <input 
                type="text" 
                className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs focus:border-rose-400 outline-none bg-white h-8"
                placeholder="Why did it fail?"
                value={props.reason}
                onChange={(e) => props.setReason(e.target.value)}
              />
            </div>
            <div className="w-24">
              <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Return?</label>
              <div className="flex bg-slate-200/50 p-0.5 rounded-md h-8">
                {['Yes', 'No'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => props.setReturned(opt as 'Yes' | 'No')}
                    className={clsx(
                      "flex-1 text-[10px] font-bold rounded-sm transition-all",
                      props.returned === opt ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Progress (Info Until)</label>
            <select 
              className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:border-blue-400 outline-none h-8"
              value={props.stage}
              onChange={(e) => props.setStage(e.target.value)}
            >
              {PROGRESS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Transfer</label>
            <div className="flex items-center gap-4 mb-2">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="radio" checked={props.transferStatus === 'Successful'} onChange={() => props.setTransferStatus('Successful')} className="accent-emerald-600 w-3 h-3" />
                <span className="text-slate-600">Successful</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="radio" checked={props.transferStatus === 'Unsuccessful'} onChange={() => props.setTransferStatus('Unsuccessful')} className="accent-rose-500 w-3 h-3" />
                <span className="text-slate-600">Unsuccessful</span>
              </label>
            </div>

            {props.transferStatus === 'Unsuccessful' && (
              <select 
                className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs bg-white h-8"
                value={props.transferFailReason}
                onChange={(e) => props.setTransferFailReason(e.target.value)}
              >
                {TRANSFER_FAIL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
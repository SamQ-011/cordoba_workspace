import { useState } from 'react';
import { Users, UserPlus, Trash2, Copy, Check, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';

interface Attendee {
  id: number;
  name: string;
  relation: string;
}

export default function ThirdPartyGenerator() {
  const [attendees, setAttendees] = useState<Attendee[]>([
    { id: 1, name: '', relation: '' }
  ]);
  const [script, setScript] = useState('');
  const [copied, setCopied] = useState(false);

  // --- ACCIONES DE LISTA ---
  const addAttendee = () => {
    setAttendees([...attendees, { id: Date.now(), name: '', relation: '' }]);
  };

  const removeAttendee = (id: number) => {
    if (attendees.length === 1) return; 
    setAttendees(attendees.filter(a => a.id !== id));
  };

  const updateAttendee = (id: number, field: 'name' | 'relation', value: string) => {
    setAttendees(attendees.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  // --- GENERADOR (Lógica Ajustada) ---
  const generateScript = () => {
    // 1. Filtramos vacíos
    const valid = attendees.filter(a => a.name.trim() && a.relation.trim());
    
    if (valid.length === 0) {
      alert("Please fill in at least one person's details.");
      return;
    }

    // 2. Formateamos cada persona individualmente
    // Ej: "Patricia Lee, the client's fiance"
    const parts = valid.map(p => `${p.name}, the client's ${p.relation}`);

    let joinedList = "";
    let authPhrase = "";

    // 3. Aplicamos lógica según cantidad (1, 2 o 3+)
    if (valid.length === 1) {
      // CASO 1: Una persona
      joinedList = parts[0];
      authPhrase = "The client authorizes this person to be present during the call";
    } else if (valid.length === 2) {
      // CASO 2: Dos personas (separadas por 'and')
      joinedList = `${parts[0]} and ${parts[1]}`;
      authPhrase = "The client authorizes the presence of these individuals during the call";
    } else {
      // CASO 3+: Tres o más (separadas por ';' y la última con 'and')
      const last = parts.pop(); // Sacamos el último
      joinedList = `${parts.join("; ")} and ${last}`; // Unimos el resto con ;
      authPhrase = "The client authorizes the presence of these individuals during the call";
    }
    
    // 4. Construimos el texto final
    // Nota: Agregamos el punto final a la lista si no lo tiene la frase siguiente
    const text = `✅ Third Party Authorization:\nThird party: ${joinedList}.\n${authPhrase}`;
    
    setScript(text);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in duration-500">
      
      {/* IZQUIERDA: FORMULARIO */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
        
        <div className="flex items-center justify-between pb-2 border-b border-slate-50">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
            <Users size={16} className="text-blue-500" />
            ATTENDEES LIST
          </h3>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">
            Count: {attendees.length}
          </span>
        </div>

        <div className="space-y-3">
          {attendees.map((person, index) => (
            <div key={person.id} className="flex gap-3 items-end animate-in slide-in-from-left-2 duration-300">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Name #{index + 1}</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:border-blue-400 outline-none transition-all"
                  placeholder="e.g. Patricia Lee"
                  value={person.name}
                  onChange={(e) => updateAttendee(person.id, 'name', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase">Relation</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:border-blue-400 outline-none transition-all"
                  placeholder="e.g. fiance / sister"
                  value={person.relation}
                  onChange={(e) => updateAttendee(person.id, 'relation', e.target.value)}
                />
              </div>
              
              {attendees.length > 1 && (
                <button 
                  onClick={() => removeAttendee(person.id)}
                  className="mb-1 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={addAttendee}
            className="flex-1 py-2.5 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={14} /> Add Person
          </button>
          <button 
            onClick={generateScript}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck size={14} /> Generate Note
          </button>
        </div>

      </div>

      {/* DERECHA: RESULTADO (Smart Card) */}
      <div className="h-full">
        {script ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full min-h-[250px] animate-in zoom-in-95 duration-300">
            
            {/* HEADER */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} /> AUTHORIZATION NOTE
              </span>
              
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

            {/* AREA DE TEXTO */}
            <div className="flex-1 p-2 bg-white">
              <textarea
                className="w-full h-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                style={{ fontFamily: 'inherit' }}
                value={script}
                readOnly
              />
            </div>

          </div>
        ) : (
          <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
            <Users size={48} className="mb-4 opacity-10" />
            <p className="text-sm font-medium">Add attendees to generate note.</p>
          </div>
        )}
      </div>

    </div>
  );
}
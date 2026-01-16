import { useState, useEffect } from 'react';
import { parseCRMText, type ParsedData } from '../utils/noteParser';
import api from '../api/axios';
import clsx from 'clsx';
import { FileText, Users } from 'lucide-react';

// Importamos los componentes
import NoteForm from '../components/notes/NoteForm';
import NotePreview from '../components/notes/NotePreview';
import ThirdPartyGenerator from '../components/notes/ThirdPartyGenerator';
import ConfirmationModal from '../components/common/ConfirmationModal'; // <--- NUEVO
import NotesHistory from '../components/notes/NotesHistory'; // <--- NUEVO

export default function Notes() {
  
  const [activeTab, setActiveTab] = useState<'general' | 'third-party'>('general');

  // --- ESTADOS GENERALES ---
  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<ParsedData>({ 
    cordoba_id: 'unknown', raw_name_guess: 'unknown', marketing_company: 'Unknown Affiliate', language: 'English' 
  });

  const [outcome, setOutcome] = useState<'Completed' | 'Not Completed'>('Not Completed');
  const [completedSource, setCompletedSource] = useState("All info provided");
  const [reason, setReason] = useState('');
  const [stage, setStage] = useState("All info provided");
  const [returned, setReturned] = useState<'Yes' | 'No'>('No');
  const [transferStatus, setTransferStatus] = useState<'Successful' | 'Unsuccessful'>('Unsuccessful');
  const [transferFailReason, setTransferFailReason] = useState("Unsuccessful, number was not in service.");

  const [finalNote, setFinalNote] = useState('');
  
  // --- ESTADOS DE CONFIRMACIÓN E HISTORIAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null); // Datos esperando confirmación
  const [saving, setSaving] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(0); // Trigger para actualizar tabla

  // --- LOGIC: PARSEO ---
  useEffect(() => {
    const data = parseCRMText(rawText);
    setParsed({
      cordoba_id: data.cordoba_id || 'unknown',
      raw_name_guess: data.raw_name_guess || 'unknown',
      marketing_company: data.marketing_company || 'Unknown Affiliate',
      language: data.language || 'English'
    });
  }, [rawText]);

  // --- LOGIC: GENERAR NOTA ---
  useEffect(() => {
    const cid = parsed.cordoba_id;
    const name = parsed.raw_name_guess;
    const aff = parsed.marketing_company;
    let note = "";

    if (outcome === 'Not Completed') {
      const returnText = returned === 'Yes' ? 'Returned' : 'Not Returned';
      const transText = transferStatus === 'Successful' ? 'Successful' : transferFailReason;
      
      note = `❌ WC Not Completed – ${returnText}\nCX: ${name} || ${cid}\n\n• Reason: ${reason}\n\n• Call Progress: ${stage}\n• Transfer Status: ${transText}\nAffiliate: ${aff}`;
    } else {
      note = `✅ WC Completed\nCX: ${name} || ${cid}\nAffiliate: ${aff}`;
    }
    setFinalNote(note);
  }, [parsed, outcome, reason, stage, returned, transferStatus, transferFailReason, completedSource]);

  // 1. PRIMER PASO: Validar y Abrir Modal
  const handleInitiateSave = () => {
    if (!parsed.cordoba_id || parsed.cordoba_id === 'unknown') {
      alert("⚠️ Missing Cordoba ID. Please paste CRM profile first.");
      return;
    }

    const dbInfoUntil = outcome === 'Completed' ? completedSource : stage;

    // Preparamos el payload pero NO lo enviamos todavía
    const payload = {
      customer: parsed.raw_name_guess,
      cordoba_id: parsed.cordoba_id.replace(/\D/g, ''),
      result: outcome,
      affiliate: parsed.marketing_company,
      info_until: dbInfoUntil,
      client_language: parsed.language,
      comments: reason,
      transfer_status: outcome === 'Completed' ? 'Successful' : (transferStatus === 'Successful' ? 'Successful' : transferFailReason)
    };

    setPendingData(payload); // Guardamos en memoria
    setIsModalOpen(true);    // Abrimos modal
  };

  // 2. SEGUNDO PASO: Confirmar y Enviar a BD
  const handleConfirmSave = async () => {
    if (!pendingData) return;
    setSaving(true);
    try {
      await api.post('/logs/', pendingData);
      
      // Éxito
      setIsModalOpen(false);
      setPendingData(null);
      setRefreshHistory(prev => prev + 1); // Actualizar tabla historial automáticamente
      
      // Opcional: Resetear formulario o dejarlo (usualmente se deja por si hay que copiar algo más)
      // handleReset(); 

    } catch (error) {
      console.error(error);
      alert("❌ Error saving log");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setRawText('');
    setReason('');
    setOutcome('Not Completed');
  };

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      
      {/* Header + Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Note Generator</h1>
          <p className="text-slate-500 mt-1">Automated log creation & Legal scripts.</p>
        </div>

        <div className="bg-slate-100 p-1.5 rounded-xl flex items-center self-start md:self-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm",
              activeTab === 'general' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 shadow-none"
            )}
          >
            <FileText size={16} /> General Notes
          </button>
          <button
            onClick={() => setActiveTab('third-party')}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm",
              activeTab === 'third-party' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 shadow-none"
            )}
          >
            <Users size={16} /> Third Party
          </button>
        </div>
      </div>

      {activeTab === 'general' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12">
            <NoteForm 
              rawText={rawText} setRawText={setRawText}
              outcome={outcome} setOutcome={setOutcome}
              completedSource={completedSource} setCompletedSource={setCompletedSource}
              reason={reason} setReason={setReason}
              stage={stage} setStage={setStage}
              returned={returned} setReturned={setReturned}
              transferStatus={transferStatus} setTransferStatus={setTransferStatus}
              transferFailReason={transferFailReason} setTransferFailReason={setTransferFailReason}
              onReset={handleReset}
            />
            <NotePreview 
              finalNote={finalNote} 
              setFinalNote={setFinalNote} 
              onSave={handleInitiateSave} // CAMBIO: Llama a Initiate, no Save directo
              saving={saving} 
            />
          </div>

          {/* HISTORIAL ABAJO (Fuera del Grid) */}
          <NotesHistory refreshTrigger={refreshHistory} />
        </>
      ) : (
        <ThirdPartyGenerator />
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSave}
        data={pendingData}
        isSaving={saving}
      />

    </div>
  );
}
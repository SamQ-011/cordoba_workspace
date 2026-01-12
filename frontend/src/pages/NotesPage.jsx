import React, { useState, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
    ClipboardList, Save, RotateCcw, 
    CheckCircle, XCircle, Copy, Send, Users 
} from 'lucide-react';

const TRANSFER_FAIL_REASONS = [
    "Unsuccessful, number was not in service.",
    "Unsuccessful, attempted to contact sales back with no success.",
    "Unsuccessful, the SA was unavailable.",
    "Unsuccessful, the call was concluded before the verification outcome was completed.",
    "Unsuccessful, the Cx disconnected the call before I could transfer the call back to Sales.",
    "Unsuccessful, the Cx disconnected the call and requested for a call back later.",
    "Unsuccessful, I tried to transfer the client to their representative by calling the company’s extension, but no one answered.",
    "Unsuccessful, I tried to transfer the client to their representative by calling the company’s extension, but it goes straight to voicemail.",
    "Unsuccessful, the client is busy and will be waiting for their representative’s call."
];

const NotesPage = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState('smart');
    const [rawText, setRawText] = useState('');
    const [outcome, setOutcome] = useState('Not Completed');
    const [stage, setStage] = useState('All info provided');
    const [returned, setReturned] = useState('No');
    const [transferStatus, setTransferStatus] = useState('Unsuccessful');
    const [failReason, setFailReason] = useState(TRANSFER_FAIL_REASONS[0]);
    const [internalComment, setInternalComment] = useState('');

    // Lógica de Parseo Rescatada de notas.py
    const parsedData = useMemo(() => {
        if (!rawText) return {};
        const data = {};
        const idMatch = rawText.match(/(CORDOBA-\d+)/i);
        data.cid = idMatch ? idMatch[1] : 'unknown';
        const lines = rawText.split('\n').filter(l => l.trim());
        if (lines.length > 0) {
            data.name = lines[0].replace(/Purchaser.*|Co-Applicant.*/i, '').trim();
        }
        const affMatch = rawText.match(/(?:Affiliate Marketing Company|Marketing Company|Assigned Company)\s*(.*)/i);
        data.affiliate = affMatch ? affMatch[1].trim() : 'Unknown Affiliate';
        return data;
    }, [rawText]);

    const finalNote = useMemo(() => {
        const { name, cid, affiliate } = parsedData;
        if (!name) return "";
        if (outcome === 'Completed') {
            return `✅ WC Completed\nCX: ${name} || ${cid}\nAffiliate: ${affiliate}`;
        } else {
            const statTitle = returned === 'Yes' ? 'Returned' : 'Not Returned';
            const transStatus = transferStatus === 'Successful' ? 'Successful' : failReason;
            return `❌ WC Not Completed – ${statTitle}\nCX: ${name} || ${cid}\n\n• Reason: ${internalComment}\n\n• Call Progress: ${stage}\n• Transfer Status: ${transStatus}\nAffiliate: ${affiliate}`;
        }
    }, [parsedData, outcome, stage, returned, transferStatus, failReason, internalComment]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1 className="page-title">Notes Intelligence</h1>
                    <p className="page-subtitle">Standardized documentation and record keeping.</p>
                </div>
            </header>

            <div className="notes-tabs">
                <button className={tab === 'smart' ? 'active' : ''} onClick={() => setTab('smart')}>
                    <ClipboardList size={16} /> Smart Generator
                </button>
                <button className={tab === 'legal' ? 'active' : ''} onClick={() => setTab('legal')}>
                    <Users size={16} /> Third Party
                </button>
            </div>

            <div className="notes-grid">
                {/* PANEL DE CONFIGURACIÓN */}
                <div className="notes-panel">
                    <textarea 
                        className="crm-input"
                        placeholder="Paste CRM Profile here..."
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                    />

                    <div className="outcome-btns">
                        <button className={`btn-opt ${outcome === 'Completed' ? 'active-ok' : ''}`} onClick={() => setOutcome('Completed')}>
                            <CheckCircle size={16} /> Completed
                        </button>
                        <button className={`btn-opt ${outcome === 'Not Completed' ? 'active-fail' : ''}`} onClick={() => setOutcome('Not Completed')}>
                            <XCircle size={16} /> Not Completed
                        </button>
                    </div>

                    {outcome === 'Not Completed' && (
                        <div className="fail-flow anim-fade">
                            {/* REQUERIMIENTO: Reason arriba */}
                            <div className="input-group">
                                <label>Internal Reason</label>
                                <textarea 
                                    className="reason-input"
                                    placeholder="Why was it not completed?"
                                    value={internalComment}
                                    onChange={(e) => setInternalComment(e.target.value)}
                                />
                            </div>

                            <div className="input-group">
                                <label>Call Progress</label>
                                <select value={stage} onChange={(e) => setStage(e.target.value)}>
                                    <option>All info provided</option>
                                    <option>Banking info verification</option>
                                    <option>Creditors verification</option>
                                    <option>Intro</option>
                                </select>
                            </div>

                            <div className="dual-row">
                                <div className="unit">
                                    <label>Returned?</label>
                                    <div className="pill-box">
                                        <button className={returned === 'Yes' ? 'active' : ''} onClick={() => setReturned('Yes')}>Yes</button>
                                        <button className={returned === 'No' ? 'active' : ''} onClick={() => setReturned('No')}>No</button>
                                    </div>
                                </div>
                                <div className="unit">
                                    <label>Transfer?</label>
                                    <div className="pill-box">
                                        <button className={transferStatus === 'Successful' ? 'active' : ''} onClick={() => setTransferStatus('Successful')}>OK</button>
                                        <button className={transferStatus === 'Unsuccessful' ? 'active' : ''} onClick={() => setTransferStatus('Unsuccessful')}>FAIL</button>
                                    </div>
                                </div>
                            </div>

                            {transferStatus === 'Unsuccessful' && (
                                <div className="input-group anim-fade">
                                    <label>Fail Detail</label>
                                    <select value={failReason} onChange={(e) => setFailReason(e.target.value)}>
                                        {TRANSFER_FAIL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* PANEL DE PREVISUALIZACIÓN CLARO */}
                <div className="notes-panel preview-panel">
                    <div className="preview-box">
                        <div className="preview-head">
                            <span>Final Note Content</span>
                            <button className="copy-link" onClick={() => navigator.clipboard.writeText(finalNote)}>
                                <Copy size={14} /> Copy Note
                            </button>
                        </div>
                        <div className="preview-body">
                            <pre>{finalNote || "Waiting for CRM data..."}</pre>
                        </div>
                    </div>

                    <div className="panel-actions">
                        <button className="save-btn" disabled={!finalNote}>
                            <Save size={18} /> Save to Database
                        </button>
                        <button className="reset-btn" onClick={() => {setRawText(''); setInternalComment('');}}>
                            <RotateCcw size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesPage;
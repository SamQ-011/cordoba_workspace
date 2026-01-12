import React, { useState } from 'react';
import api from '../api/axios';
import { sanitizeInput } from '../utils/searchUtils';
import { Search, Layers, AlertCircle, CheckCircle, Send, RotateCcw } from 'lucide-react';

const SearchPage = () => {
    const [mode, setMode] = useState('single');
    const [query, setQuery] = useState('');
    const [batchInput, setBatchInput] = useState('');
    const [results, setResults] = useState([]);
    const [missingItems, setMissingItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cordobaId, setCordobaId] = useState('');
    const [reportStatus, setReportStatus] = useState(null);

    // --- FUNCIÓN DE RESET TOTAL ---
    const handleReset = () => {
        setQuery('');
        setBatchInput('');
        setResults([]);
        setMissingItems([]);
        setError('');
        setCordobaId('');
        setReportStatus(null);
    };

    // --- LÓGICA DE VALIDACIÓN EXACTA ---
    const handleSearchProcess = (backendData, originalQueries) => {
        // Obtenemos las abreviaciones que SÍ están en la DB (Normalizadas)
        const foundSet = new Set(
            backendData.map(item => (item.abreviation || "").trim().toUpperCase())
        );

        // Identificamos las que NO están en el set de la DB
        const missing = originalQueries.filter(q => {
            const normalizedInput = q.trim().toUpperCase();
            return !foundSet.has(normalizedInput);
        });
        
        setResults(backendData);
        setMissingItems(missing);
    };

    const handleSingleSearch = async (e) => {
        e.preventDefault();
        const cleanQuery = sanitizeInput(query);
        if (!cleanQuery) return;

        setLoading(true);
        setError('');
        try {
            const response = await api.get('/creditors/', { params: { q: cleanQuery } });
            handleSearchProcess(response.data, [cleanQuery]);
        } catch (err) {
            setError('System error. Check connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleBatchSearch = async () => {
        const lines = batchInput.split('\n')
            .map(line => sanitizeInput(line))
            .filter(l => l && l.trim().length > 0);

        if (lines.length === 0) {
        setResults([]);
        setMissingItems([]);
        return;
    }

        setLoading(true);
        setError('');
        try {
            const response = await api.post('/creditors/batch', { items: lines });
            handleSearchProcess(response.data, lines);
        } catch (err) {
            setError('Batch processing failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleReport = async () => {
        if (!cordobaId.trim() || missingItems.length === 0) return;
        setLoading(true);
        try {
            await api.post('/creditors/report-miss', {
                cordoba_id: cordobaId,
                items: missingItems
            });
            setReportStatus('success');
            setCordobaId('');
        } catch (err) {
            setReportStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1 className="page-title">Entity Intelligence</h1>
                    <p className="page-subtitle">Verify records and maintain database integrity.</p>
                </div>
                {/* Botón de Reset en el Header para acceso rápido */}
                <button className="reset-action-btn" onClick={handleReset} title="Clear all data">
                    <RotateCcw size={16} /> Reset Workspace
                </button>
            </header>

            <div className="search-card">
                <div className="search-tabs">
                    <button className={`tab-btn ${mode === 'batch' ? 'active' : ''}`} onClick={() => setMode('batch')}>
                        <Layers size={16} /> Batch Analysis
                    </button>
                    <button className={`tab-btn ${mode === 'single' ? 'active' : ''}`} onClick={() => setMode('single')}>
                        <Search size={16} /> Individual
                    </button>
                    
                </div>

                <div className="search-body">
                    {mode === 'single' ? (
                        <form onSubmit={handleSingleSearch} className="search-input-group">
                            <input type="text" placeholder="Search by name or code..." value={query} onChange={(e) => setQuery(e.target.value)} />
                            <button type="submit" disabled={loading}>Search</button>
                        </form>
                    ) : (
                        <div className="batch-group">
                            <textarea placeholder="Paste lines from your Script..." value={batchInput} onChange={(e) => setBatchInput(e.target.value)} rows={4} />
                            <div className="batch-actions">
                                <button onClick={handleBatchSearch} disabled={loading} className="batch-btn">Run Analysis</button>
                                <button onClick={handleReset} className="reset-secondary-btn">Clear Input</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* TABLA DE RESULTADOS (SOLO CODE + NAME + STATUS) */}
            {results.length > 0 && (
                <div className="results-section">
                    <h3 className="section-subtitle">Identified Records</h3>
                    <div className="table-container">
                        <table className="harmonized-table">
                            <thead>
                                <tr><th>CODE</th><th>ENTITY NAME</th><th style={{ textAlign: 'right' }}>STATUS</th></tr>
                            </thead>
                            <tbody>
                                {results.map((item, i) => (
                                    <tr key={i}>
                                        <td className="mono-code">{item.abreviation}</td>
                                        <td className="entity-name">{item.name}</td>
                                        <td style={{ textAlign: 'right' }}><CheckCircle size={18} className="check-icon" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SECCIÓN DE FALTANTES (PILLS) */}
            {missingItems.length > 0 && (
                <div className="missing-section-minimal">
                    <div className="missing-header">
                        <AlertCircle size={18} />
                        <span>{missingItems.length} items not found in master database</span>
                    </div>
                    <div className="missing-pills">
                        {missingItems.map((m, i) => <span key={i} className="missing-pill">{m}</span>)}
                    </div>
                    <div className="report-mini-form">
                        <input type="text" placeholder="Cordoba ID..." value={cordobaId} onChange={(e) => setCordobaId(e.target.value)} />
                        <button onClick={handleReport} disabled={loading}><Send size={14} /> Report Miss</button>
                    </div>
                    {reportStatus === 'success' && <p className="status-msg-success">Administrator notified.</p>}
                </div>
            )}
        </div>
    );
};

export default SearchPage;
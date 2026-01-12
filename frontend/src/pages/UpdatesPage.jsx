import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Info, AlertTriangle, AlertCircle, CheckCircle, Search, Eye, EyeOff } from 'lucide-react';

const UpdatesPage = () => {
    const { user } = useAuth();
    const [updates, setUpdates] = useState([]);
    const [filter, setFilter] = useState('All'); // All, Unread, Read
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const categories = {
        CRITICAL: { icon: <AlertCircle size={18} />, class: 'cat-critical' },
        WARNING:  { icon: <AlertTriangle size={18} />, class: 'cat-warning' },
        INFO:     { icon: <Info size={18} />, class: 'cat-info' },
        SUCCESS:  { icon: <CheckCircle size={18} />, class: 'cat-success' }
    };

    useEffect(() => {
        fetchUpdates();
    }, []);

    const fetchUpdates = async () => {
        try {
            const response = await api.get('/updates/');
            setUpdates(response.data);
        } catch (err) {
            console.error("Error fetching updates:", err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (updateId) => {
        try {
            await api.post(`/updates/${updateId}/read`);
            // Actualizamos localmente para no recargar todo
            setUpdates(updates.map(u => u.id === updateId ? { ...u, is_read: true } : u));
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    };

    // --- LÓGICA DE FILTRADO Y ORDENAMIENTO (Basada en updates.py) ---
    const filteredUpdates = updates
        .filter(u => {
            const matchesSearch = u.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 u.message.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'All' ? true : 
                                 filter === 'Unread' ? !u.is_read : u.is_read;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            // Prioridad: No leídos -> Fecha reciente
            if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
            return new Date(b.date) - new Date(a.date);
        });

    const isNew = (date) => {
        const diff = (new Date() - new Date(date)) / (1000 * 60 * 60 * 24);
        return diff < 3; // Menos de 3 días
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1 className="page-title">Team Updates</h1>
                    <p className="page-subtitle">Stay informed about system changes and critical alerts.</p>
                </div>
            </header>

            {/* BARRA DE FILTROS */}
            <div className="updates-filter-bar">
                <div className="search-box">
                    <Search size={16} />
                    <input 
                        type="text" 
                        placeholder="Filter announcements..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-tabs">
                    {['All', 'Unread', 'Read'].map(f => (
                        <button 
                            key={f} 
                            className={`filter-tab ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* LISTA DE NOVEDADES */}
            <div className="updates-list">
                {filteredUpdates.length === 0 ? (
                    <div className="empty-state">No announcements found.</div>
                ) : (
                    filteredUpdates.map(item => (
                        <div key={item.id} className={`update-card ${item.is_read ? 'read' : 'unread'} ${categories[item.category]?.class}`}>
                            <div className="update-icon">
                                {categories[item.category]?.icon || <Bell size={18} />}
                            </div>
                            <div className="update-content">
                                <div className="update-meta">
                                    <span className="update-cat">{item.category}</span>
                                    <span className="update-date">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    {!item.is_read && isNew(item.date) && <span className="new-badge">NEW</span>}
                                </div>
                                <h3 className="update-title">{item.title}</h3>
                                <p className="update-message">{item.message}</p>
                            </div>
                            {!item.is_read && (
                                <button className="mark-read-btn" onClick={() => markAsRead(item.id)} title="Mark as Read">
                                    <Eye size={16} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UpdatesPage;
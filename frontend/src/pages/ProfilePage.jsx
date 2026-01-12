import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, ShieldCheck, Lock, Key, AlertCircle, CheckCircle } from 'lucide-react';

const ProfilePage = () => {
    const { user } = useAuth(); // Obtenemos info del agente desde el contexto
    
    // Estados para el formulario de password
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setStatus({ type: '', msg: '' });

        // Validaciones idénticas a perfil.py
        if (!currentPassword || !newPassword) {
            setStatus({ type: 'error', msg: 'All fields are required.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', msg: 'New passwords do not match.' });
            return;
        }

        if (newPassword.length < 6) {
            setStatus({ type: 'error', msg: 'Password too short (min 6 chars).' });
            return;
        }

        setLoading(true);
        try {
            // Llamada al endpoint de actualización de credenciales
            await api.post('/auth/update-password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            
            setStatus({ type: 'success', msg: 'Credentials updated successfully.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.detail || 'Error updating password.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1 className="page-title">User Profile</h1>
                    <p className="page-subtitle">Account management & security settings.</p>
                </div>
            </header>

            <div className="profile-grid">
                {/* 1. INFORMACIÓN DE CUENTA */}
                <div className="profile-card info-card">
                    <div className="profile-avatar">
                        <User size={40} />
                    </div>
                    <div className="profile-details">
                        {/* Mostramos datos reales del usuario */}
                        <h2>{user?.real_name || 'System Agent'}</h2>
                        <div className="profile-meta">
                            <span className="badge-outline">Username: <strong>{user?.username || 'N/A'}</strong></span>
                            <span className="badge-outline">Role: <strong>{user?.role || 'Agent'}</strong></span>
                        </div>
                        <p className="admin-notice">Contact IT Admin for role or name changes.</p>
                    </div>
                </div>

                {/* 2. MÓDULO DE SEGURIDAD */}
                <div className="profile-card security-card">
                    <div className="card-header">
                        <ShieldCheck size={20} />
                        <h3>Security Settings</h3>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="security-form">
                        <div className="input-field">
                            <label><Lock size={14} /> Current Password</label>
                            <input 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-row">
                            <div className="input-field">
                                <label><Key size={14} /> New Password</label>
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min. 6 chars"
                                />
                            </div>
                            <div className="input-field">
                                <label><CheckCircle size={14} /> Confirm New</label>
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {status.msg && (
                            <div className={`form-feedback ${status.type}`}>
                                {status.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                                {status.msg}
                            </div>
                        )}

                        <button type="submit" className="update-btn" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Credentials'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
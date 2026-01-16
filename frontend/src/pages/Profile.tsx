import { useState } from 'react';
import { User, Shield, Key, Save, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export default function Profile() {
  const { user } = useAuthStore();
  
  // Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Loading & Feedback States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // 1. Frontend Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    // 2. Backend Call
    setLoading(true);
    try {
      await api.put('/auth/me/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || 'Error updating password.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Profile</h1>
        <p className="text-slate-500 mt-1">Account management and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* INFO CARD (Left) */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 h-24 relative">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg text-white">
                  <User size={32} />
                </div>
              </div>
            </div>
            <div className="pt-12 pb-8 px-6 text-center">
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <p className="text-sm text-slate-500 font-medium mb-4">@{user?.username}</p>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 uppercase tracking-wide">
                <Shield size={12} />
                {user?.role}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 leading-relaxed">
                  If you need to change your name or role, please contact the IT Administrator.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY FORM (Right) */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Key size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Change Password</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
              
              {/* Feedback Messages */}
              {message && (
                <div className={`p-4 rounded-xl flex items-start gap-3 text-sm ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
                }`}>
                  {message.type === 'success' ? <Shield size={18} /> : <AlertCircle size={18} />}
                  <span className="font-medium">{message.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900"
                    placeholder="Min. 6 chars"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Confirm New
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {loading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Save size={18} />
                  )}
                  {loading ? 'Updating...' : 'Update Credentials'}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
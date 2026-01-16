import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import clsx from 'clsx';
import api from '../../api/axios';

export const UsersTab = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ username: '', name: '', password: '', role: 'Agent' });

  const fetchUsers = () => api.get('/admin/users').then(res => setUsers(res.data));
  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!form.username || !form.password) return alert("Faltan datos");
    try {
      await api.post('/admin/users', form);
      alert("Usuario creado");
      setForm({ username: '', name: '', password: '', role: 'Agent' });
      fetchUsers();
    } catch (e) { alert("Error creando usuario"); }
  };

  const toggleStatus = async (user: any) => {
    await api.put(`/admin/users/${user.id}`, { active: !user.active });
    fetchUsers();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* Formulario Crear */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Plus size={18} /> Nuevo Usuario
        </h3>
        <div className="space-y-3">
          <input className="w-full p-2 border rounded-lg text-sm" placeholder="Username (Login)" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          <input className="w-full p-2 border rounded-lg text-sm" placeholder="Nombre Completo" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input className="w-full p-2 border rounded-lg text-sm" type="password" placeholder="Contraseña Inicial" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <select className="w-full p-2 border rounded-lg text-sm bg-white" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="Agent">Agente</option>
            <option value="Admin">Administrador</option>
          </select>
          <button onClick={handleCreate} className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800">Crear Usuario</button>
        </div>
      </div>

      {/* Lista Usuarios */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
              <tr>
                <th className="p-4">Usuario</th>
                <th className="p-4">Nombre</th>
                <th className="p-4">Rol</th>
                <th className="p-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-slate-700">{u.username}</td>
                  <td className="p-4">{u.name}</td>
                  <td className="p-4">
                    <span className={clsx("px-2 py-1 rounded-md text-xs font-bold", u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => toggleStatus(u)} className={clsx("px-3 py-1 rounded-full text-xs font-bold transition-colors", u.active ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700' : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-700')}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
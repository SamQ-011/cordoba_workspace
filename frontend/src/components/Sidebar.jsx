import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Search, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  User as UserIcon, 
  Pencil
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Notes', path: '/notes', icon: Pencil }, 
    { name: 'Updates', path: '/updates', icon: Bell },
    { name: 'My Profile', path: '/profile', icon: UserIcon },
];

const finalMenuItems = user?.role === 'Admin' 
    ? [...menuItems, { name: 'Admin Tower', path: '/admin', icon: ShieldCheck }]
    : menuItems;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <span className="brand-text">CORDOBA PRO</span>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <UserIcon size={18} />
                    <span>{user?.username || 'Agent'}</span>
                </div>
                <button onClick={logout} className="logout-btn">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
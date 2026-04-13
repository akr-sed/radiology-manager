import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, UserCog, LogOut } from 'lucide-react';
import './Layout.css';

const navLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/chefs-service', label: 'Chefs de Service', icon: UserCog },
  { to: '/admin/services', label: 'Services', icon: Building2 },
  { to: '/admin/patients', label: 'Patients', icon: Users },
];

function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return pathname === '/admin/dashboard' || pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Admin</h1>
        </div>
        <nav className="sidebar-nav">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={isActive(to) ? 'active' : ''}>
              <Icon />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout}>
            <LogOut />
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;

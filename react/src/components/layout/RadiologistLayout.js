import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, UserCircle, LogOut } from 'lucide-react';
import './Layout.css';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/patients', label: 'Patients', icon: Users },
  { to: '/dashboard/rendez-vous', label: 'Rendez-vous', icon: Calendar },
  { to: '/dashboard/compte', label: 'Mon Compte', icon: UserCircle },
];

function RadiologistLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
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
          <h1>Radiologue</h1>
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

export default RadiologistLayout;

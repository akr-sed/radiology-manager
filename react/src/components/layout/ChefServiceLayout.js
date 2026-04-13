import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Stethoscope, Calendar, UserCircle, LogOut } from 'lucide-react';
import './Layout.css';

const navLinks = [
  { to: '/chef-service/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chef-service/patients', label: 'Patients', icon: Users },
  { to: '/chef-service/gerer-radiologues', label: 'Radiologues', icon: Stethoscope },
  { to: '/chef-service/rendez-vous', label: 'Rendez-vous', icon: Calendar },
  { to: '/chef-service/compte', label: 'Mon Compte', icon: UserCircle },
];

function ChefServiceLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/chef-service/dashboard') {
      return pathname === '/chef-service/dashboard' || pathname === '/chef-service';
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
          <h1>Chef de Service</h1>
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

export default ChefServiceLayout;

import React, { useEffect } from 'react';
import { Link, useLocation, Navigate, Outlet, useNavigate } from 'react-router-dom';
import './RadiologyAnnotator.css';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

function RadiologistLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const roles = user.roles || [];

    if (!localStorage.getItem('access_token') || !roles.includes('radiologue')) {
      navigate('/');
    }
  }, [navigate]);



  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">Service Radiologie</h1>
          <p className="user-welcome">Bienvenue, amona amina</p>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
                <DashboardIcon className="nav-icon" />
                Tableau de Bord
              </Link>
            </li>
            <li>
              <Link to="/dashboard/patients" className={isActive('/patients') ? 'active' : ''}>
                <PeopleIcon className="nav-icon" />
                Gérer Patient
              </Link>
            </li>
            <li>
              <Link to="/dashboard/rendez-vous" className={isActive('/rendez-vous') ? 'active' : ''}>
                <CalendarTodayIcon className="nav-icon" />
                Gérer RDV
              </Link>
            </li>
            <li>
              <Link to="/dashboard/compte" className={isActive('/compte') ? 'active' : ''}>
                <AccountCircleIcon className="nav-icon" />
                Gérer mon Compte
              </Link>
            </li>
            <li className="logout">
              <Link to="/" onClick={() => localStorage.clear()}>
                <LogoutIcon className="nav-icon" />
                Déconnexion
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default RadiologistLayout;
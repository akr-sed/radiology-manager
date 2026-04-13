import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../logo.svg'; // ← adapte le chemin ici !

function Navbar() {
  const userRole = localStorage.getItem('user_role');

  return (
    <nav className="navbar">
      <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center' }}>
        
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Plateforme de Radiologie
        </Link>
      </div>

      <div className="navbar-menu">
        {userRole === 'RADIOLOGUE' && (
          <Link to="/profile">Profil</Link>
        )}
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
        >
          Déconnexion
        </button>
        <img
          src={logo}
          alt="Logo"
          style={{ height: '40px', marginRight: '10px' }}
        />
      </div>
      
    </nav>
  );
}

export default Navbar;

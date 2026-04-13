import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { Activity, Calendar, FileText, User, Users } from 'lucide-react';
import fetchWithAuth from "../fetchWithAuth";
import config from '../../config';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    patients: { total: 0, nouveaux: 0, variation: 0 },
    rendezVous: { total: 0, prochain: { heure: '', type: '' }, variation: 0 },
    examens: { total: 0, enAttente: 0, variation: 0 },
    rapports: { total: 0, dateLimite: '', variation: 0 },
    radiologues: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        console.log("Token récupéré:", token ? "Présent" : "Absent");

        if (!token) {
          throw new Error("Token d'authentification manquant");
        }

        const response = await fetchWithAuth(`http://${config.DjangoHost}:${config.Port}/api/login/verify/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log("Réponse de l'API verify:", response.status);

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('access_token');
            navigate('/login');
            return;
          }
          throw new Error(`Erreur d'authentification: ${response.status}`);
        }

        const data = await response.json();
        console.log("Données utilisateur:", data);

        if (data.status === 'success') {
          setUser(data.user);
          await fetchStats(token);
        } else {
          throw new Error("Erreur dans les données utilisateur reçues");
        }
      } catch (error) {
        console.error('Erreur utilisateur:', error);
        setError(error.message || "Erreur de connexion");
      }
    };

    const fetchStats = async (token) => {
      try {
        const response = await fetchWithAuth(`http://${config.DjangoHost}:${config.Port}/api/dashboard/stats/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log("Réponse de l'API stats:", response.status);

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('access_token');
            navigate('/login');
            return;
          }
          throw new Error(`Erreur serveur stats: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'success') {
          setStats(data.stats);
        } else {
          throw new Error("Erreur dans les statistiques");
        }
      } catch (error) {
        console.error('Erreur statistiques:', error);
        setError(error.message || "Erreur de récupération des statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Une erreur s'est produite: {error}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, change, icon, className }) => {
    const isPositive = change >= 0;
    return (
      <div className={`stat-card ${className}`}>
        <div className="stat-card-header">
          <h3>{title}</h3>
          <div className="stat-card-icon">{icon}</div>
        </div>
        <div className="stat-card-value">{value}</div>
        {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
        {change !== undefined && (
          <div className={`stat-card-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{change}% depuis la semaine dernière
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tableau de Bord</h1>
        <p>Bienvenue, {user?.prenom} {user?.nom}</p>
      </div>

      <div className="dashboard-content">

        {/* Statistiques principales */}
        <div className="dashboard-section stats-overview">
          <div className="stats-grid">
            <StatCard 
              title="Examens aujourd'hui" 
              value={stats.examens.total}
              subtitle={`${stats.examens.enAttente} en attente d'analyse`}
              change={stats.examens.variation}
              icon={<Activity size={20} />}
              className="stat-card-examens"
            />

            <StatCard 
              title="Patients cette semaine" 
              value={stats.patients.total}
              subtitle={`${stats.patients.nouveaux} nouveaux patients`}
              change={stats.patients.variation}
              icon={<User size={20} />}
              className="stat-card-patients"
            />

            <StatCard 
              title="Rapports en attente" 
              value={stats.rapports.total}
              subtitle={`Date limite: ${stats.rapports.dateLimite}`}
              change={stats.rapports.variation}
              icon={<FileText size={20} />}
              className="stat-card-rapports"
            />

            <StatCard 
              title="Rendez-vous" 
              value={stats.rendezVous.total}
              subtitle={`Prochain: ${stats.rendezVous.prochain.heure || ''} ${stats.rendezVous.prochain.type ? `- ${stats.rendezVous.prochain.type}` : ''}`}
              change={stats.rendezVous.variation}
              icon={<Calendar size={20} />}
              className="stat-card-rdv"
            />
          </div>
        </div>

        {/* Prochain rendez-vous */}
        <div className="dashboard-section">
                  <div className="section-header">
                    <h2>Prochain rendez-vous</h2>
                    <Link to={(() => { const r = (JSON.parse(localStorage.getItem('user') || '{}').roles || []); return r.includes('admin') ? '/admin/dashboard' : r.includes('chef_service') ? '/chef-service/rendez-vous' : '/dashboard/rendez-vous'; })()} className="section-link">Voir tous</Link>
                  </div>
                  <div className="next-appointment">
                    <div className="appointment-icon">
                      <Calendar size={24} />
                    </div>
                    <div className="appointment-details">
                      <p className="appointment-type">{stats.rendezVous.prochain.type}</p>
                      <p className="appointment-time">{stats.rendezVous.prochain.heure}</p>
                    </div>
                    <Link to={(() => { const r = (JSON.parse(localStorage.getItem('user') || '{}').roles || []); return r.includes('admin') ? '/admin/dashboard' : r.includes('chef_service') ? '/chef-service/rendez-vous' : '/dashboard/rendez-vous'; })()} className="appointment-action">
                      Détails
                    </Link>
                  </div>
                </div>

        {/* Rappels */}
        <div className="dashboard-section">
          <h2>Rappels</h2>
          <div className="reminders">
            <div className="reminder-item">
              <div className="reminder-icon">
                <FileText size={20} />
              </div>
              <p>{stats.rapports.total} rapports en attente à finaliser aujourd'hui</p>
            </div>
            <div className="reminder-item">
              <div className="reminder-icon">
                <Activity size={20} />
              </div>
              <p>{stats.examens.enAttente} analyses d'examens à traiter</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="dashboard-section">
          <h2>Navigation</h2>
          <div className="main-navigation">
            {(() => {
              const userData = JSON.parse(localStorage.getItem('user') || '{}');
              const roles = userData.roles || [];
              if (roles.includes('admin')) {
                return (
                  <>
                    <Link to="/admin/chefs-service" className="nav-link">
                      <Users size={18} />
                      <span>Chefs de Service</span>
                    </Link>
                    <Link to="/admin/services" className="nav-link">
                      <Activity size={18} />
                      <span>Services</span>
                    </Link>
                    <Link to="/admin/patients" className="nav-link">
                      <User size={18} />
                      <span>Patients</span>
                    </Link>
                  </>
                );
              }
              return (
                <>
                  <Link to="/dashboard/patients" className="nav-link">
                    <User size={18} />
                    <span>Patients</span>
                  </Link>
                  <Link to="/dashboard/rendez-vous" className="nav-link">
                    <Calendar size={18} />
                    <span>Rendez-vous</span>
                  </Link>
                  <Link to="/dashboard/compte" className="nav-link">
                    <FileText size={18} />
                    <span>Mon Compte</span>
                  </Link>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

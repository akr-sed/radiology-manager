import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './../radiologist/Dashboard.css';
import { Calendar, FileText, Activity, User, Users } from 'lucide-react';
import fetchWithAuth from "../fetchWithAuth";
import config from '../../config';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    patients: { total: 0, nouveaux: 0, variation: "0%" },
    rendezVous: { total: 0, prochain: { heure: '-', type: '-' }, variation: "0%" },
    examens: { total: 0, enAttente: 0, variation: "0%" },
    rapports: { total: 0, dateLimite: 'Aucune', variation: "0%" },
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error("Aucun token trouvé. L'utilisateur n'est pas connecté.");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetchWithAuth(`http://${config.DjangoHost}/api/login/verify/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'success') {
          setUser(data.user);
          fetchStats(token);
        } else {
          console.error('Réponse invalide:', data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async (token) => {
      try {
        const response = await fetchWithAuth(`http://${config.DjangoHost}/api/dashboard/stats/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'success') {
          setStats({
            patients: data.stats.patients || { total: 0, nouveaux: 0, variation: "0%" },
            rendezVous: data.stats.rendezVous || { total: 0, prochain: { heure: '-', type: '-' }, variation: "0%" },
            examens: data.stats.examens || { total: 0, enAttente: 0, variation: "0%" },
            rapports: data.stats.rapports || { total: 0, dateLimite: 'Aucune', variation: "0%" },
          });
        } else {
          console.error('Réponse invalide pour les stats:', data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tableau de Bord</h1>
        <p>Bienvenue, {user?.prenom} {user?.nom}</p>
      </div>

      <div className="dashboard-content">
        {/* Statistiques */}
        <div className="stats-grid">
          <div className="stat-card stat-card-examens">
            <div className="stat-card-header">
              <h3>Examens aujourd'hui</h3>
              <div className="stat-card-icon"><Activity size={20} /></div>
            </div>
            <div className="stat-card-value">{stats.examens.total}</div>
            <div className="stat-card-subtitle">{stats.examens.enAttente} en attente d'analyse</div>
            <div className="stat-card-change positive">+{stats.examens.variation}% depuis la semaine dernière</div>
          </div>

          <div className="stat-card stat-card-patients">
            <div className="stat-card-header">
              <h3>Patients cette semaine</h3>
              <div className="stat-card-icon"><User size={20} /></div>
            </div>
            <div className="stat-card-value">{stats.patients.total}</div>
            <div className="stat-card-subtitle">{stats.patients.nouveaux} nouveaux patients</div>
            <div className="stat-card-change negative">{stats.patients.variation}% depuis la semaine dernière</div>
          </div>

          <div className="stat-card stat-card-rapports">
            <div className="stat-card-header">
              <h3>Rapports en attente</h3>
              <div className="stat-card-icon"><FileText size={20} /></div>
            </div>
            <div className="stat-card-value">{stats.rapports.total}</div>
            <div className="stat-card-subtitle">Date limite: {stats.rapports.dateLimite}</div>
            <div className="stat-card-change positive">+{stats.rapports.variation}% depuis la semaine dernière</div>
          </div>

          <div className="stat-card stat-card-rdv">
            <div className="stat-card-header">
              <h3>Rendez-vous</h3>
              <div className="stat-card-icon"><Calendar size={20} /></div>
            </div>
            <div className="stat-card-value">{stats.rendezVous.total}</div>
            <div className="stat-card-subtitle">Prochain: {stats.rendezVous.prochain.heure} - {stats.rendezVous.prochain.type}</div>
            <div className="stat-card-change positive">+{stats.rendezVous.variation}% depuis la semaine dernière</div>
          </div>
        </div>

        {/* Prochain rendez-vous */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Prochain rendez-vous</h2>
            <Link to="/dashboard/rendez-vous" className="section-link">Voir tous</Link>
          </div>
          <div className="next-appointment">
            <div className="appointment-icon">
              <Calendar size={24} />
            </div>
            <div className="appointment-details">
              <p className="appointment-type">{stats.rendezVous.prochain.type}</p>
              <p className="appointment-time">{stats.rendezVous.prochain.heure}</p>
            </div>
            <Link to="/dashboard/rendez-vous/details" className="appointment-action">
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
            <Link to="/chef-service/patients" className="nav-link">
              <User size={20} /> Patients
            </Link>
            <Link to="/chef-service/gerer-radiologues" className="nav-link">
              <Users size={20} /> Gérer Radiologues
            </Link>
            <Link to="/chef-service/rendez-vous" className="nav-link">
              <Calendar size={20} /> Rendez-vous
            </Link>
            <Link to="/chef-service/compte" className="nav-link">
              <FileText size={20} /> Mon Compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
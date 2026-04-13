import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  Activity,
  FileText,
  UserCog,
  Building2,
  Stethoscope,
  UserCircle,
} from "lucide-react";
import fetchWithAuth from "../fetchWithAuth";
import API_BASE from "../../config";
import "./Dashboard.css";

const STAT_CARDS = [
  {
    key: "patients",
    label: "Patients",
    Icon: Users,
    color: "#0091FF",
    bgColor: "rgba(0, 145, 255, 0.1)",
    formatSubtitle: (s) => `${s.nouveaux ?? 0} nouveaux`,
  },
  {
    key: "rendezVous",
    label: "Rendez-vous",
    Icon: Calendar,
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.1)",
    formatSubtitle: (s) => `Prochain: ${s.heure ?? "-"}`,
  },
  {
    key: "examens",
    label: "Examens",
    Icon: Activity,
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.1)",
    formatSubtitle: (s) => `${s.enAttente ?? 0} en attente`,
  },
  {
    key: "rapports",
    label: "Rapports",
    Icon: FileText,
    color: "#22C55E",
    bgColor: "rgba(34, 197, 94, 0.1)",
    formatSubtitle: (s) => `Dernier: ${s.dateLimite ?? "-"}`,
  },
];

const NAV_CONFIG = {
  admin: [
    { label: "Chefs de Service", to: "/admin/chefs-service", Icon: UserCog },
    { label: "Services", to: "/admin/services", Icon: Building2 },
    { label: "Patients", to: "/admin/patients", Icon: Users },
  ],
  chef_service: [
    { label: "Patients", to: "/chef-service/patients", Icon: Users },
    {
      label: "Radiologues",
      to: "/chef-service/gerer-radiologues",
      Icon: Stethoscope,
    },
    { label: "Rendez-vous", to: "/chef-service/rendez-vous", Icon: Calendar },
    { label: "Mon Compte", to: "/chef-service/compte", Icon: UserCircle },
  ],
  radiologue: [
    { label: "Patients", to: "/dashboard/patients", Icon: Users },
    { label: "Rendez-vous", to: "/dashboard/rendez-vous", Icon: Calendar },
    { label: "Mon Compte", to: "/dashboard/compte", Icon: UserCircle },
  ],
};

function getNavLinks() {
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const roles = stored.roles || [];

  for (const role of ["admin", "chef_service", "radiologue"]) {
    if (roles.includes(role)) {
      return NAV_CONFIG[role];
    }
  }
  return [];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [userRes, statsRes] = await Promise.all([
        fetchWithAuth(`${API_BASE}/api/login/verify/`, {
          method: "POST",
        }),
        fetchWithAuth(`${API_BASE}/api/dashboard/stats/`, {
          method: "GET",
        }),
      ]);

      if (!userRes.ok) throw new Error("Impossible de vérifier l'utilisateur");
      if (!statsRes.ok) throw new Error("Impossible de charger les statistiques");

      const userData = await userRes.json();
      const statsData = await statsRes.json();

      setUser(userData);
      setStats(statsData);
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner" />
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button className="dashboard-retry-btn" onClick={loadData}>
          Réessayer
        </button>
      </div>
    );
  }

  const navLinks = getNavLinks();

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Tableau de Bord</h1>
        <p className="dashboard-subtitle">
          Bienvenue, {user?.prenom ?? ""} {user?.nom ?? ""}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid">
        {STAT_CARDS.map(({ key, label, Icon, color, bgColor, formatSubtitle }) => {
          const cardStats = stats?.[key] || {};
          const variation = cardStats.variation;
          const isPositive = variation >= 0;

          return (
            <div className="dashboard-stat-card" key={key}>
              <div className="stat-card-header">
                <span className="stat-card-label">{label}</span>
                <div
                  className="stat-card-icon"
                  style={{ backgroundColor: bgColor }}
                >
                  <Icon size={20} color={color} />
                </div>
              </div>
              <div className="stat-card-value">{cardStats.total ?? 0}</div>
              <div className="stat-card-footer">
                <span className="stat-card-subtitle">
                  {formatSubtitle(cardStats)}
                </span>
                {variation !== undefined && variation !== null && (
                  <span
                    className={`stat-card-variation ${
                      isPositive ? "variation-positive" : "variation-negative"
                    }`}
                  >
                    {isPositive ? `+${variation}%` : `${variation}%`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Section */}
      {navLinks.length > 0 && (
        <div className="dashboard-nav-section">
          <h2 className="dashboard-nav-title">Navigation rapide</h2>
          <div className="dashboard-nav-grid">
            {navLinks.map(({ label, to, Icon }) => (
              <Link to={to} className="dashboard-nav-link" key={to}>
                <Icon size={22} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

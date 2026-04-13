import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";
import API_BASE from '../../config';

function MainPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fonction pour afficher/masquer le formulaire de login
  const handleShowLogin = () => {
    window.location.href = "/login";
  };
  const handleCloseLogin = () => {
    setShowLogin(false);
    setError("");
    setCredentials({ email: "", password: "" });
  };

  // Logique de connexion (reprise de Login.js)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (credentials.email && credentials.password) {
      try {
        const response = await fetch(`${API_BASE}/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("Login successful:", data);

          // Store tokens
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          localStorage.setItem("user", JSON.stringify(data.user));

          const roles = data.user.roles || [];

          if (roles.includes("radiologue")) {
            navigate("/dashboard");
          } else if (roles.includes("chef_service")) {
            navigate("/chef-service");
          } else if (roles.includes("admin")) {
            navigate("/admin");
          } else {
            setError("Accès refusé : Rôle non reconnu.");
          }
        } else {
          setError(data.message || "Erreur de connexion");
        }
      } catch (err) {
        console.error("Erreur serveur:", err);
        setError("Erreur serveur. Veuillez réessayer plus tard.");
      }
    }
  };

  return (
    <div className="main-page">
      {/* Header */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo">
            <h1>RadioCare</h1>
            <span>Système de Radiologie</span>
          </div>
          <button className="login-btn" onClick={handleShowLogin}>
            Se Connecter
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>Plateforme de Gestion Radiologique</h2>
          <p>
            Solution complète pour la gestion des patients, rendez-vous et
            examens radiologiques
          </p>
          <div className="hero-buttons">
            <button className="primary-btn" onClick={handleShowLogin}>
              Commencer
            </button>
            <button className="secondary-btn">En savoir plus</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-content">
          <h3>Fonctionnalités Principales</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h4>Gestion Patients</h4>
              <p>Gérez facilement les dossiers et informations des patients</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h4>Planification</h4>
              <p>Organisez les rendez-vous et examens radiologiques</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h4>Sécurité</h4>
              <p>Données sécurisées et conformes aux normes médicales</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>Rapports</h4>
              <p>Génération automatique de rapports et statistiques</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Login (reprend le style de Login.js) */}
      {showLogin && (
        <div className="login-overlay">
          <div className="login-modal">
            <div className="login-container">
              <div className="login-box">
                <button className="close-btn" onClick={handleCloseLogin}>
                  ×
                </button>
                <h1 className="login-title">Radiologie</h1>
                <h2>Connexion</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={credentials.email}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mot de passe:</label>
                    <input
                      type="password"
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  {error && <p className="error-message">{error}</p>}
                  <button type="submit">Se connecter</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;

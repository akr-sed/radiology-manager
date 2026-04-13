import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../components/services/NotificationContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { notifications, loading, error, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState('all'); // 'all' ou 'unread'
  const [filter, setFilter] = useState(''); // Filtre par texte
  const navigate = useNavigate();

  // Rechargement des notifications lors du montage du composant
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filtrer les notifications selon les critères
  const filteredNotifications = notifications.filter(notification => {
    // Filtre par onglet actif
    if (activeTab === 'unread' && notification.lue) {
      return false;
    }
    
    // Filtre par texte de recherche
    if (filter && !notification.message.toLowerCase().includes(filter.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleNotificationClick = (notification) => {
    // Marquer comme lue si ce n'est pas déjà fait
    if (!notification.lue) {
      markAsRead(notification.id);
    }

    // Naviguer vers le lien associé à la notification si disponible
    if (notification.lien) {
      navigate(notification.lien);
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'PPpp', { locale: fr });
    } catch (error) {
      return 'Date inconnue';
    }
  };

  // Fonction pour obtenir l'icône en fonction du type de notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <i className="fas fa-calendar-alt"></i>;
      case 'message':
        return <i className="fas fa-envelope"></i>;
      case 'alert':
        return <i className="fas fa-exclamation-circle"></i>;
      case 'test':
        return <i className="fas fa-vial"></i>;
      default:
        return <i className="fas fa-bell"></i>;
    }
  };

  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <h1>Notifications</h1>
        <div className="notifications-actions">
          <button 
            className="btn-mark-all-read" 
            onClick={markAllAsRead}
            disabled={!notifications.some(n => !n.lue)}
          >
            Tout marquer comme lu
          </button>
        </div>
      </header>

      <div className="notifications-filters">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Toutes
          </button>
          <button 
            className={`tab ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Non lues
          </button>
        </div>

        <div className="search-filter">
          <input
            type="text"
            placeholder="Rechercher dans les notifications..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filter && (
            <button className="clear-filter" onClick={() => setFilter('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Chargement des notifications...</span>
        </div>
      ) : error ? (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={fetchNotifications}>Réessayer</button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="empty-notifications">
          <i className="fas fa-bell-slash"></i>
          <p>
            {activeTab === 'all' 
              ? filter 
                ? "Aucune notification ne correspond à votre recherche." 
                : "Vous n'avez pas de notifications."
              : filter
                ? "Aucune notification non lue ne correspond à votre recherche."
                : "Vous n'avez pas de notifications non lues."
            }
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`notification-card ${!notification.lue ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-details">
                <p className="notification-message">{notification.message}</p>
                <div className="notification-meta">
                  <span className="notification-time">{formatDateTime(notification.date_creation)}</span>
                  {!notification.lue && <span className="unread-badge">Non lu</span>}
                  {notification.type === 'appointment' && (
                    <span className="notification-type">Rendez-vous</span>
                  )}
                </div>
              </div>
              {notification.lien && (
                <div className="notification-action">
                  <i className="fas fa-chevron-right"></i>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
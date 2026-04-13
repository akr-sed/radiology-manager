import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  ListItemButton,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

// ✅ Corrige le chemin selon ton projet :
import logo from '../logo.svg';

const drawerWidth = 250;

const AdminSidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Tableau de Bord', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Chefs de Service', icon: <PeopleIcon />, path: '/admin/chefs-service' },
    { text: 'Services', icon: <LocalHospitalIcon />, path: '/admin/services' },
    { text: 'Patients', icon: <PersonIcon />, path: '/admin/patients' },
  ];

  const isSelected = (path) => location.pathname === path;

  const handleNavigation = (path) => navigate(path);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#0091FF',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between', // ✅ Push le logo en bas
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <List sx={{ mt: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isSelected(item.path)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  {React.cloneElement(item.icon, { color: 'inherit' })}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={onLogout}>
              <ListItemIcon sx={{ color: 'white' }}>
                <LogoutIcon color="inherit" />
              </ListItemIcon>
              <ListItemText primary="Déconnexion" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* ✅ Logo en bas */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <img
          src={logo}
          alt="Logo"
          style={{ maxWidth: '80%', height: 'auto' }}
        />
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;

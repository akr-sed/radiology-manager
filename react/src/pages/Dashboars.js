import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';

const StatCard = ({ title, value, subtitle, icon: Icon }) => (
  <Paper sx={{ p: 3, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" color="textSecondary">
        {title}
      </Typography>
      <Icon sx={{ ml: 'auto', color: '#0091FF' }} />
    </Box>
    <Typography variant="h3" component="div" sx={{ mb: 1 }}>
      {value}
    </Typography>
    <Typography variant="body2" color="textSecondary">
      {subtitle}
    </Typography>
  </Paper>
);

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tableau de Bord
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Patients"
            value="245"
            subtitle="+12 depuis le mois dernier"
            icon={PersonIcon}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Rendez-vous Aujourd'hui"
            value="8"
            subtitle="3 restants"
            icon={EventIcon}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Rapports en Attente"
            value="5"
            subtitle="2 urgents"
            icon={AssessmentIcon}
          />
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Activité Hebdomadaire
              </Typography>
              <BarChartIcon sx={{ ml: 'auto', color: '#0091FF' }} />
            </Box>
            <Typography variant="h3" component="div" sx={{ mb: 1 }}>
              32
            </Typography>
            <Typography variant="body2" color="textSecondary">
              +8% depuis la semaine dernière
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 
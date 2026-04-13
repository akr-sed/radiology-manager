import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ActionCard = ({ title, icon: Icon, onClick }) => (
  <Card sx={{ height: '100%' }}>
    <CardActionArea
      onClick={onClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
      }}
    >
      <Icon sx={{ fontSize: 60, color: '#0091FF', mb: 2 }} />
      <CardContent>
        <Typography variant="h6" component="div" align="center">
          {title}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

const GererService = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Créer Service',
      icon: AddIcon,
      path: '/admin/services/creer',
    },
    {
      title: 'Modifier Service',
      icon: EditIcon,
      path: '/admin/services/modifier/1',
    },
    {
      title: 'Supprimer Service',
      icon: DeleteIcon,
      path: '/admin/services/supprimer/1',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Gérer les Services
      </Typography>

      <Grid container spacing={4}>
        {actions.map((action) => (
          <Grid item xs={12} md={4} key={action.title}>
            <ActionCard
              title={action.title}
              icon={action.icon}
              onClick={() => navigate(action.path)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GererService; 
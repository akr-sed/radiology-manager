import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
} from '@mui/material';

const ConsulterImage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Simuler les données de l'image
  const imageData = {
    nom: 'Radio_Patient_123.jpg',
    date: '2024-03-15',
    type: 'Radiographie',
    patient: 'John Smith',
    description: 'Radiographie du thorax',
    url: 'https://example.com/placeholder-image.jpg',
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Consulter l'Image
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <img
              src={imageData.url}
              alt={imageData.nom}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '500px',
                objectFit: 'contain',
              }}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Détails de l'Image
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              <strong>Nom :</strong> {imageData.nom}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Date :</strong> {imageData.date}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Type :</strong> {imageData.type}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Patient :</strong> {imageData.patient}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Description :</strong> {imageData.description}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/gestion-images')}
                fullWidth
              >
                Retour
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConsulterImage; 
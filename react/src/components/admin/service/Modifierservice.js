import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';

const ModifierService = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [success, setSuccess] = useState(false);

  // Simuler la récupération des données du service
  const [formData, setFormData] = useState({
    nom: 'Service de Radiologie',
    capacite: '50',
    description: 'Service de radiologie générale',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici, vous pouvez ajouter la logique pour mettre à jour dans une base de données
    console.log('Service modifié:', formData);
    setSuccess(true);
    setTimeout(() => {
      navigate('/admin/services');
    }, 2000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Modifier le Service
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Service modifié avec succès !
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nom du service"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Capacité"
            name="capacite"
            type="number"
            value={formData.capacite}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Enregistrer
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/services')}
            >
              Annuler
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ModifierService; 
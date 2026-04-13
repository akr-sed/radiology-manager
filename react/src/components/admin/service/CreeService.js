import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';

const CreerService = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    capacite: '',
    description: '',
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici, vous pouvez ajouter la logique pour sauvegarder dans une base de données
    console.log('Service créé:', formData);
    setSuccess(true);
    setTimeout(() => {
      navigate('/admin/services');
    }, 2000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Créer un Service
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Service créé avec succès !
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
              Créer
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

export default CreerService; 
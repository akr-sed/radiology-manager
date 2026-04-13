import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const ModifierChef = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [success, setSuccess] = useState(false);

  const services = [
    'Radiologie',
    'IRM',
    'Scanner',
    'Échographie',
  ];

  // Simuler la récupération des données du chef de service
  const [formData, setFormData] = useState({
    nom: 'Smith',
    prenom: 'John',
    email: 'john.smith@hopital.fr',
    telephone: '0612345678',
    specialite: 'Radiologie diagnostique',
    service: 'Radiologie',
    experience: '15',
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
    console.log('Chef de service modifié:', formData);
    setSuccess(true);
    setTimeout(() => {
      navigate('/admin/chefs-service');
    }, 2000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Modifier le Chef de Service
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Chef de service modifié avec succès !
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Prénom"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Téléphone"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Spécialité"
            name="specialite"
            value={formData.specialite}
            onChange={handleChange}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Service</InputLabel>
            <Select
              name="service"
              value={formData.service}
              onChange={handleChange}
              label="Service"
            >
              {services.map((service) => (
                <MenuItem key={service} value={service}>
                  {service}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Années d'expérience"
            name="experience"
            type="number"
            value={formData.experience}
            onChange={handleChange}
            margin="normal"
            required
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
              onClick={() => navigate('/admin/chefs-service')}
            >
              Annuler
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ModifierChef; 
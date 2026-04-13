import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AjouterChef = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: '',
    service: '',
    experience: '',
  });
  const [success, setSuccess] = useState(false);

  const services = [
    'Radiologie',
    'IRM',
    'Scanner',
    'Échographie',
  ];

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
    console.log('Chef de service ajouté:', formData);
    setSuccess(true);
    setTimeout(() => {
      navigate('/admin/chefs-service');
    }, 2000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ajouter un Chef de Service
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Chef de service ajouté avec succès !
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
              Ajouter
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

export default AjouterChef; 
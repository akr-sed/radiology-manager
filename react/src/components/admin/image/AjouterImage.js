import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Alert,
} from '@mui/material';

const AjouterImage = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici, vous pouvez ajouter la logique pour envoyer l'image au serveur
    console.log('Image à ajouter:', file);
    setSuccess(true);
    setTimeout(() => {
      navigate('/gestion-images');
    }, 2000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ajouter une Image
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Image ajoutée avec succès !
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="file"
            onChange={handleFileChange}
            margin="normal"
            required
            InputLabelProps={{
              shrink: true,
            }}
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
              onClick={() => navigate('/gestion-images')}
            >
              Annuler
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AjouterImage; 
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

const SupprimerImage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [openDialog, setOpenDialog] = useState(true);
  const [success, setSuccess] = useState(false);

  // Simuler les données de l'image
  const imageData = {
    nom: 'Radio_Patient_123.jpg',
    date: '2024-03-15',
    type: 'Radiographie',
  };

  const handleConfirmDelete = () => {
    // Ici, vous pouvez ajouter la logique pour supprimer l'image
    console.log('Image supprimée:', id);
    setOpenDialog(false);
    setSuccess(true);
    setTimeout(() => {
      navigate('/gestion-images');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/gestion-images');
  };

  if (success) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="success">
          Image supprimée avec succès !
        </Alert>
      </Box>
    );
  }

  return (
    <Dialog
      open={openDialog}
      onClose={handleCancel}
    >
      <DialogTitle>
        Confirmer la suppression
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer cette image ?
        </DialogContentText>
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle1">
            <strong>Nom :</strong> {imageData.nom}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Date :</strong> {imageData.date}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Type :</strong> {imageData.type}
          </Typography>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>
          Annuler
        </Button>
        <Button 
          onClick={handleConfirmDelete}
          color="error"
          variant="contained"
        >
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SupprimerImage; 
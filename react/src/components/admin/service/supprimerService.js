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

const SupprimerService = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [openDialog, setOpenDialog] = useState(true);
  const [success, setSuccess] = useState(false);

  // Simuler les données du service
  const serviceData = {
    nom: 'Service de Radiologie',
    capacite: '50',
    description: 'Service de radiologie générale',
  };

  const handleConfirmDelete = () => {
    // Ici, vous pouvez ajouter la logique pour supprimer de la base de données
    console.log('Service supprimé:', id);
    setOpenDialog(false);
    setSuccess(true);
    setTimeout(() => {
      navigate('/admin/services');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/admin/services');
  };

  if (success) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="success">
          Service supprimé avec succès !
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
          Êtes-vous sûr de vouloir supprimer le service suivant ?
        </DialogContentText>
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle1">
            <strong>Nom :</strong> {serviceData.nom}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Capacité :</strong> {serviceData.capacite}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Description :</strong> {serviceData.description}
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

export default SupprimerService; 
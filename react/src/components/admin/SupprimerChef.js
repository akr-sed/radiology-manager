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

const SupprimerChef = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [openDialog, setOpenDialog] = useState(true);
  const [success, setSuccess] = useState(false);

  // Simuler les données du chef de service
  const chefData = {
    nom: 'Smith',
    prenom: 'John',
    email: 'john.smith@hopital.fr',
    service: 'Radiologie',
    specialite: 'Radiologie diagnostique',
  };

  const handleConfirmDelete = () => {
    // Ici, vous pouvez ajouter la logique pour supprimer de la base de données
    console.log('Chef de service supprimé:', id);
    setOpenDialog(false);
    setSuccess(true);
    setTimeout(() => {
      navigate('/admin/chefs-service');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/admin/chefs-service');
  };

  if (success) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="success">
          Chef de service supprimé avec succès !
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
          Êtes-vous sûr de vouloir supprimer le chef de service suivant ?
        </DialogContentText>
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle1">
            <strong>Nom :</strong> {chefData.nom}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Prénom :</strong> {chefData.prenom}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Email :</strong> {chefData.email}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Service :</strong> {chefData.service}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Spécialité :</strong> {chefData.specialite}
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

export default SupprimerChef; 
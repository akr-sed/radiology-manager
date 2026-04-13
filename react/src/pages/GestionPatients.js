import React, { useState } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const GestionPatients = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Exemple de données de patients
  const patients = [
    { id: 1, nom: 'Dupont', prenom: 'Jean', dateNaissance: '01/01/1980', email: 'jean.dupont@example.com' },
    { id: 2, nom: 'Martin', prenom: 'Sophie', dateNaissance: '15/05/1990', email: 'sophie.martin@example.com' },
    { id: 3, nom: 'Bernard', prenom: 'Pierre', dateNaissance: '20/03/1975', email: 'pierre.bernard@example.com' },
  ];

  const filteredPatients = patients.filter(patient =>
    patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Patients
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher un patient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Date de Naissance</TableCell>
              <TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.nom}</TableCell>
                <TableCell>{patient.prenom}</TableCell>
                <TableCell>{patient.dateNaissance}</TableCell>
                <TableCell>{patient.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GestionPatients; 
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

const ConsulterPatient = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Données de test
  const patients = [
    {
      id: 1,
      nom: 'Dupont',
      prenom: 'Jean',
      dateNaissance: '15/03/1980',
      telephone: '0612345678',
      dernierRDV: '10/03/2024',
    },
    {
      id: 2,
      nom: 'Martin',
      prenom: 'Marie',
      dateNaissance: '22/07/1992',
      telephone: '0687654321',
      dernierRDV: '12/03/2024',
    },
    // Ajoutez plus de patients ici
  ];

  const filteredPatients = patients.filter(patient =>
    `${patient.nom} ${patient.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Consulter les Patients
      </Typography>

      <Box sx={{ mb: 3 }}>
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
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Date de naissance</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Dernier RDV</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.id}</TableCell>
                <TableCell>{patient.nom}</TableCell>
                <TableCell>{patient.prenom}</TableCell>
                <TableCell>{patient.dateNaissance}</TableCell>
                <TableCell>{patient.telephone}</TableCell>
                <TableCell>{patient.dernierRDV}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => console.log('Voir images du patient:', patient.id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ConsulterPatient; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout components
import AdminLayout from './components/layout/AdminLayout';
import RadiologistLayout from './components/layout/RadiologistLayout';
import ChefServiceLayout from './components/layout/ChefServiceLayout';
import MainPage from './components/layout/MainPage';

// Auth
import Login from './components/auth/Login';

// Shared components
import Dashboard from './components/shared/Dashboard';
import PatientList from './components/shared/PatientList';
import PatientDetail from './components/shared/PatientDetail';
import PatientForm from './components/shared/PatientForm';
import EditPatient from './components/shared/EditPatient';
import AppointmentManagement from './components/shared/AppointmentManagement';
import AccountManagement from './components/shared/AccountManagement';

// Admin components
import ServiceManagement from './components/admin/ServiceManagement';
import ChefServiceManagement from './components/admin/ChefServiceManagement';

// Chef service components
import GererRadiologues from './components/chef-service/GererRadiologues';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chefs-service" element={<ChefServiceManagement />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="patients" element={<PatientList />} />
        </Route>

        {/* Radiologist routes */}
        <Route path="/dashboard/*" element={<RadiologistLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="patient/:id" element={<PatientDetail />} />
          <Route path="ajouter-patient" element={<PatientForm />} />
          <Route path="modifier-patient/:id" element={<EditPatient />} />
          <Route path="rendez-vous" element={<AppointmentManagement />} />
          <Route path="compte" element={<AccountManagement />} />
        </Route>

        {/* Chef de service routes */}
        <Route path="/chef-service/*" element={<ChefServiceLayout />}>
          <Route index element={<Navigate to="/chef-service/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="patient/:id" element={<PatientDetail />} />
          <Route path="ajouter-patient" element={<PatientForm />} />
          <Route path="modifier-patient/:id" element={<EditPatient />} />
          <Route path="gerer-radiologues" element={<GererRadiologues />} />
          <Route path="rendez-vous" element={<AppointmentManagement />} />
          <Route path="compte" element={<AccountManagement />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

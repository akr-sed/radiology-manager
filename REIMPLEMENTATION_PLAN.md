# Radiology Manager - Reimplementation Plan

## Overview
Rewrite the React frontend from scratch with consistent routing, proper auth, clean UI using MUI + Lucide icons. Backend stays mostly as-is (auth decorators already fixed). No AI features, no real-time notifications, no secrétaire role.

## Design System
- Primary: #0091FF (keep existing blue)
- Background: #f5f6fa
- Text: #1a1a2e
- Success: #22C55E
- Error: #EF4444
- Warning: #F59E0B
- Font: system-ui with clean medical feel
- Icons: Lucide React (already in deps)
- Components: MUI (already in deps)
- All clickable elements: cursor-pointer
- Transitions: 200ms ease

## Roles & Routes

| Role | Prefix | Sidebar Links |
|------|--------|---------------|
| Admin | /admin | Dashboard, Chefs de Service, Services, Patients |
| Chef de Service | /chef-service | Dashboard, Patients, Radiologues, Rendez-vous, Mon Compte |
| Radiologue | /dashboard | Dashboard, Patients, Rendez-vous, Mon Compte |

## Tasks

### Task 1: Shared Infrastructure
**Files:** `react/src/config.js`, `react/src/components/fetchWithAuth.js`, `react/src/App.js`
**Spec:**
- config.js: export API_BASE = `http://localhost:8000`
- fetchWithAuth.js: wrapper around fetch that adds Bearer token, handles 401 redirect, handles network errors gracefully
- App.js: clean route definitions for all 3 role layouts with all child routes
- Imports for all page components

### Task 2: Auth - Login Page
**Files:** `react/src/components/auth/Login.js`, `react/src/components/auth/Login.css`
**Spec:**
- Centered card layout on a clean background
- Email + password fields with proper labels (not just placeholders)
- Submit button with loading state
- Error message display
- On success: store tokens + user in localStorage, navigate based on role
- POST to `/login/` endpoint
- Clean, professional medical look

### Task 3: Shared Layout Components
**Files:** `react/src/components/layout/AdminLayout.js`, `react/src/components/layout/RadiologistLayout.js`, `react/src/components/layout/ChefServiceLayout.js`, `react/src/components/layout/Sidebar.css`
**Spec:**
- Each layout: fixed left sidebar (250px) + scrollable main content area
- Sidebar: logo/title at top, nav links in middle, logout at bottom
- Nav links use Lucide icons, highlight active route
- Sidebar color: #0091FF background, white text
- Active link: rgba(255,255,255,0.2) background
- Hover: rgba(255,255,255,0.1)
- Main content: padding 24px, background #f5f6fa
- Responsive: sidebar collapses on mobile
- Admin sidebar: Dashboard, Chefs de Service, Services, Patients, Logout
- Chef sidebar: Dashboard, Patients, Radiologues, Rendez-vous, Mon Compte, Logout
- Radiologue sidebar: Dashboard, Patients, Rendez-vous, Mon Compte, Logout

### Task 4: Dashboard Component (shared by all roles)
**Files:** `react/src/components/shared/Dashboard.js`, `react/src/components/shared/Dashboard.css`
**Spec:**
- Greeting: "Bienvenue, {prenom} {nom}"
- 4 stat cards in a grid: Patients, Rendez-vous, Examens, Rapports
- Each card: title, big number, subtitle, week variation %
- Cards use soft shadows, rounded corners, white background
- Navigation section at bottom with role-appropriate links
- Calls: POST `/api/login/verify/` then GET `/api/dashboard/stats/`
- Uses fetchWithAuth for all API calls
- Loading spinner while fetching
- Error state with retry button

### Task 5: Patient Management
**Files:** `react/src/components/shared/PatientList.js`, `react/src/components/shared/PatientForm.js`, `react/src/components/shared/PatientDetail.js`, `react/src/components/shared/EditPatient.js`
**Spec:**
- **PatientList**: Table with columns (Nom, Prenom, Email, Date naissance, Actions). Search bar. Add button. Edit/Delete/View action buttons per row.
  - GET `/api/patients/`
  - DELETE `/api/supprimerPatient/{id}/`
  - Role-aware: link to correct prefix (/dashboard/patient/X or /chef-service/patient/X)
- **PatientForm**: Modal or page for adding patient. Fields: nom, prenom, email, date_naissance, sexe, phonenumber, adresse. Validation. POST `/api/ajouterPatient`
- **PatientDetail**: Shows patient info + list of images. Link to edit. Link to upload image.
  - GET `/api/patient/{id}/`
  - POST `/api/patient/listimages/` to get images
- **EditPatient**: Pre-filled form. PUT `/api/patient/{id}/`
- All use fetchWithAuth. Loading/error states. Uses current URL to determine role prefix.

### Task 6: Radiologue Management (Chef de Service only)
**Files:** `react/src/components/chef-service/GererRadiologues.js`
**Spec:**
- Table listing radiologues (Nom, Prenom, Email, Phone, Actions)
- Search bar
- Add button opens modal form (nom, prenom, email, password, phone, adresse, date_naissance)
- Edit button opens same modal pre-filled (password optional on edit)
- Delete with confirmation
- Endpoints: GET `/api/radiologues/`, POST `/api/ajouterRadiologue/`, PUT `/api/modifierRadiologue/{id}/`, DELETE `/api/supprimer_radiologue/{id}/`

### Task 7: Appointment (RDV) Management
**Files:** `react/src/components/shared/AppointmentManagement.js`
**Spec:**
- Table: Date, Patient, Radiologue, Type, Lieu, Status, Accepté, Actions
- Add RDV form: select patient, select radiologue, date picker, lieu, type
- Edit RDV (same form, pre-filled)
- Delete with confirmation
- For radiologues: accept/reject buttons on pending RDVs
- Status badges with colors (Planifié=blue, Confirmé=green, Rejeté/Refusé=red)
- Endpoints: GET `/api/rdv_list/`, POST `/api/ajouter_rdv/`, PUT `/api/modifier_rdv/{id}/`, DELETE `/api/supprimer_rdv/{id}/`, POST `/api/repondre_rdv/{id}/`
- Chef de service: also POST `/api/rdv_list/?chef_id={id}` to filter
- Load patients list and radiologues list for the dropdowns

### Task 8: Service Management (Admin only)
**Files:** `react/src/components/admin/ServiceManagement.js`
**Spec:**
- Table: Nom, Hopital, Adresse, Actions
- Add/Edit/Delete services
- Endpoints: GET `/api/services`, POST to add, PUT to modify, DELETE to remove
- Simple CRUD with modal forms
- Fields: nom, nom_hopital, adresse

### Task 9: Chef de Service Management (Admin only)
**Files:** `react/src/components/admin/ChefServiceManagement.js`
**Spec:**
- Table: Nom, Prenom, Email, Phone, Actions
- Add chef: nom, prenom, email, password, phone, adresse, date_naissance
- Edit/Delete
- Endpoints: GET `/api/ChefService`, POST `/api/ajouterChefService`, PUT `/api/modifierChefService`, DELETE `/api/supprimerChefService`

### Task 10: Account Management
**Files:** `react/src/components/shared/AccountManagement.js`
**Spec:**
- View current user profile (from localStorage user data)
- Edit form: nom, prenom, phone, adresse, date_naissance
- Change password (old password + new password + confirm)
- Uses `/api/modifier-compte/` endpoint
- Available to all roles

### Task 11: Image Upload Component
**Files:** `react/src/components/shared/ImageUpload.js`
**Spec:**
- Drag & drop or click to select image file
- Preview before upload
- Upload via FormData to POST `/api/patient/addimg/`
- Requires patient ID
- Success/error feedback
- Used within PatientDetail page

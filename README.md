# Radiology Manager

A web application for managing a hospital radiology department. Built with Django (REST API) and React.

## Features

- **Role-based access**: Admin, Chef de Service, Radiologue
- **Patient management**: Full CRUD with medical image uploads
- **Appointment system**: Create, assign, accept/reject workflow
- **Radiologue management**: Chef de service manages radiologists
- **Service management**: Admin configures services with modality, organ, and AI model selection
- **Dashboard**: Statistics and quick navigation per role

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 4.2, Django REST Framework, SimpleJWT |
| Frontend | React 19, React Router 7, Lucide Icons |
| Database | MySQL 5.7+ |
| Auth | JWT (access + refresh tokens) |

---

## Prerequisites

Install these before starting:

- **Python 3.10+**
- **Node.js 18+** (with npm)
- **MySQL 5.7+**

---

## Setup Guide

### 1. Clone the repository

```bash
git clone https://github.com/akr-sed/radiology-manager.git
cd radiology-manager
```

### 2. Database setup

#### Linux / macOS

```bash
# Start MySQL
sudo systemctl start mysql        # Linux
brew services start mysql          # macOS

# Create the database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS gestion_radiologie CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### Windows (PowerShell)

```powershell
# Make sure MySQL is running (check Services app or run:)
net start mysql

# Create the database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS gestion_radiologie CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

> **Note**: If your MySQL root user has a password, edit `PFE/settings.py` line 108:
> ```python
> 'PASSWORD': 'your_password_here',
> ```

### 3. Python dependencies

#### Linux / macOS

```bash
# (Optional) Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install pymysql django==4.2.7 djangorestframework==3.14.0 \
  djangorestframework-simplejwt django-cors-headers==4.3.1 \
  channels==4.0.0 daphne==4.0.0 channels-redis==4.1.0 \
  pillow==10.2.0 reportlab==4.0.9 redis numpy==1.26.4 \
  opencv-python pandas pypandoc==1.12
```

#### Windows (PowerShell)

```powershell
# (Optional) Create a virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install pymysql django==4.2.7 djangorestframework==3.14.0 ^
  djangorestframework-simplejwt django-cors-headers==4.3.1 ^
  channels==4.0.0 daphne==4.0.0 channels-redis==4.1.0 ^
  pillow==10.2.0 reportlab==4.0.9 redis numpy==1.26.4 ^
  opencv-python pandas pypandoc==1.12
```

### 4. Run database migrations

```bash
python3 manage.py migrate          # Linux / macOS
python manage.py migrate           # Windows
```

### 5. Create test accounts

```bash
python3 manage.py shell            # Linux / macOS
python manage.py shell             # Windows
```

Then paste this in the shell:

```python
from APPI.models.Role import Role
from APPI.models.compte import Compte
from django.contrib.auth.models import Group

# Create roles
for titre in ['radiologue', 'chef_service', 'admin']:
    group, _ = Group.objects.get_or_create(name=titre)
    Role.objects.get_or_create(titre=titre, defaults={'group': group})

# Create accounts (password: test1234)
accounts = [
    ('radiologue@test.com', 'Dupont', 'Jean', 'radiologue'),
    ('chef@test.com', 'Martin', 'Pierre', 'chef_service'),
    ('admin@test.com', 'Admin', 'Super', 'admin'),
]

for email, nom, prenom, role in accounts:
    if not Compte.objects.filter(email=email).exists():
        user = Compte.objects.create_user(
            email=email, password='test1234',
            nom=nom, prenom=prenom, phonenumber='0600000000'
        )
        user.set_password('test1234')
        Compte.objects.filter(pk=user.pk).update(password=user.password)
        role_obj = Role.objects.get(titre=role)
        user.roles.add(role_obj)
        user.groups.add(Group.objects.get(name=role))
        if role == 'admin':
            Compte.objects.filter(pk=user.pk).update(is_staff=True, is_superuser=True)
        print(f'Created: {email}')

exit()
```

### 6. Install React dependencies

```bash
cd react
npm install
cd ..
```

### 7. Start the application

You need **two terminals**:

**Terminal 1 -- Django backend:**

```bash
python3 manage.py runserver        # Linux / macOS
python manage.py runserver         # Windows
```

**Terminal 2 -- React frontend:**

```bash
cd react
npm start
```

### 8. Open in browser

Go to **http://localhost:3000**

---

## Login Accounts

| Role | Email | Password |
|------|-------|----------|
| Radiologue | `radiologue@test.com` | `test1234` |
| Chef de Service | `chef@test.com` | `test1234` |
| Admin | `admin@test.com` | `test1234` |

---

## Project Structure

```
.
├── PFE/                          # Django project settings
│   ├── settings.py               # Database, CORS, JWT config
│   ├── urls.py                   # Root URL routing
│   └── __init__.py               # PyMySQL initialization
│
├── APPI/                         # Django app
│   ├── models/                   # Data models
│   │   ├── compte.py             # User model (Compte)
│   │   ├── patient.py            # Patient model
│   │   ├── Role.py               # Roles + auth decorators
│   │   ├── RDV.py                # Appointment model
│   │   ├── Radiologue.py         # Radiologist model
│   │   ├── Service.py            # Service model (modality, organ, AI model)
│   │   └── ...
│   ├── action/                   # API views (controllers)
│   │   ├── actionLogin.py        # Login + token verify
│   │   ├── actionsGererPatient/  # Patient CRUD
│   │   ├── actionsGererRDV/      # Appointment CRUD
│   │   ├── actionsGererRadiologue/ # Radiologist CRUD
│   │   ├── actionsGererService/  # Service CRUD
│   │   ├── actionsGererChefService/ # Chef de Service CRUD
│   │   └── stats.py              # Dashboard statistics
│   └── urls.py                   # API endpoint routing
│
├── react/                        # React frontend
│   └── src/
│       ├── config.js             # API base URL
│       ├── App.js                # Route definitions
│       ├── components/
│       │   ├── auth/Login.js     # Login page
│       │   ├── layout/           # Sidebar layouts (Admin, Radiologist, Chef)
│       │   ├── shared/           # Shared components (Dashboard, Patients, etc.)
│       │   ├── admin/            # Admin-only components
│       │   └── chef-service/     # Chef de service components
│       └── fetchWithAuth.js      # Auth wrapper for API calls
│
├── Models/                       # AI model weights (not in repo)
│   ├── YOLOV11_ECO.pt
│   ├── YOLOV11_IRM.pt
│   └── YOLOV11_MAMO.pt
│
└── manage.py
```

---

## API Authentication

All API calls (except `/login/`) require a JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

The `fetchWithAuth()` wrapper in the frontend handles this automatically. On 401 responses, the user is redirected to the login page.

### Role-based access

- **Admin**: Full access to all endpoints
- **Chef de Service**: Patient, radiologue, and appointment management
- **Radiologue**: Own patients, own appointments (accept/reject)

---

## AI Models (Optional)

The service configuration supports AI model assignment. The YOLO model weight files (`.pt`) are not included in the repository due to their size. Place them in the `Models/` directory:

- `YOLOV11_ECO.pt` -- Ultrasound analysis
- `YOLOV11_IRM.pt` -- MRI analysis
- `YOLOV11_MAMO.pt` -- Mammography analysis

To install AI dependencies:

```bash
pip install ultralytics langchain==0.2.0 langchain-core==0.2.0 langchain-community==0.2.0 transformers==4.35.0
```

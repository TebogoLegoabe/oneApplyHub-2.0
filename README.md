# 🏠 oneApplyHub - Student Accommodation Platform

A comprehensive web platform designed specifically for **Wits and UJ students** to find, review, and apply for student accommodation in Johannesburg. Built with Flask and React to provide a seamless experience for students searching for their ideal living space.

## ✨ Features

### 🔍 **Property Discovery**

- Browse verified student accommodation properties
- Advanced filtering by price, location, property type, and amenities
- Interactive property listings with detailed information
- NSFAS-accredited property flagging

### 📝 **Student Reviews System**

- Read honest reviews from verified university students
- Detailed rating system (overall, value, location, safety, cleanliness, management, facilities)
- Mark reviews as helpful (one vote per user, enforced server-side)
- Anonymous review option for privacy
- Admin moderation queue — reviews are hidden until approved

### 👤 **User Authentication & Security**

- Secure JWT-based authentication
- University email verification via one-time email codes
- Google OAuth sign-in (access-token and legacy ID-token flows)
- Time-based one-time password (TOTP) multi-factor authentication with QR provisioning and one-time backup codes
- Forgot/reset password flow with expiring single-use tokens
- Rate limiting on all sensitive auth endpoints

### 🎓 **Student Applications**

- Guided accommodation application form with a unique tracked reference number
- Application status workflow: `pending → under_review → approved/rejected`
- Students can view their own submission and its status

## 🛠️ Tech Stack

### **Frontend** ([frontend/package.json](frontend/package.json))

- **React 19** - User interface library
- **React Router 7** - Client-side routing
- **Axios** - HTTP client for the API
- **Recharts** - Dashboard charts and analytics visualizations
- **Lucide React** - Icon set
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** (`AuthContext`, `ThemeContext`) - Global state management

## 🗄️ Database Models

Defined under [backend/app/models/](backend/app/models/).

### `User` ([user.py](backend/app/models/user.py))

Account, role, and security state for a student or admin.

- Profile: `email`, `name`, `university`, `year_of_study`, `faculty`, `verified`
- Roles: `is_admin`, `is_super_admin`
- Password reset: `reset_token`, `reset_token_expires`
- Email OTP verification: `verification_code`, `verification_code_expires`
- Google OAuth: `google_id`, `oauth_provider`
- TOTP MFA: `mfa_enabled`, `mfa_secret`, `mfa_backup_codes`, `mfa_pending_token`, `mfa_pending_expires`
- Relationships: `reviews` (one-to-many), `application` (one-to-one)

### `Property` ([property.py](backend/app/models/property.py))

An accommodation listing.

- `name`, `address`, `property_type`, `price_min`, `price_max`, `description`, `amenities` (JSON string), `contact_info`, `university`
- Moderation: `approved`
- `nsfas_accredited` flag
- Computed: `average_rating()`, `review_count()` (SQL aggregates over approved reviews)
- Relationships: `reviews`, `images`

### `PropertyImage` ([property.py](backend/app/models/property.py))

- `property_id` (FK), `image_url`, `caption`, `is_primary`

### `Review` ([review.py](backend/app/models/review.py))

A student's review of a property.

- Ratings: `overall_rating` (required), `value_rating`, `location_rating`, `safety_rating`, `cleanliness_rating`, `management_rating`, `facilities_rating`
- Content: `review_text`, `pros`, `cons`, `recommend`, `anonymous`
- Engagement: `helpful_count`
- Moderation: `approved` (hidden from public views until an admin approves it)
- Constraint: one review per `(user_id, property_id)` pair

### `HelpfulVote` ([review.py](backend/app/models/review.py))

Tracks which user marked which review as helpful, to prevent duplicate votes.

---

## 🚀 Local Development Setup

> **Prerequisites:** Python 3.8+, Node.js 16+, Git

### Quick Start (All Platforms)

**1. Clone the repo**

```bash
git clone https://github.com/TebogoLegoabe/oneApplyHub-2.0.git
cd oneApplyHub-2.0
```

**2. Backend**

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Mac/Linux:
source venv/bin/activate
# Bash
source venv/Scripts/activate
# Windows Command Prompt:
venv\Scripts\activate
# Windows PowerShell:
venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (DB URL is pre-configured)
cp .env.example .env        # Mac/Linux
copy .env.example .env      # Windows cmd
Copy-Item .env.example .env # Windows PowerShell

# Start the backend
python run.py
```

API runs at **http://localhost:5000** — health check: http://localhost:5000/api/health

**3. Frontend** (new terminal)

```bash
cd frontend

npm install

cp .env.example .env        # Mac/Linux
copy .env.example .env      # Windows cmd
Copy-Item .env.example .env # Windows PowerShell

npm start
```

App opens at **http://localhost:3000**

---

### Database

The project uses a **shared Railway PostgreSQL database**. `backend/.env.example`
only has a placeholder for `DATABASE_URL` (the real value is a secret and isn't
committed) — get the actual connection string from the Railway dashboard
(Postgres service → Variables → `DATABASE_URL`) or ask a teammate, then paste it
into your own `backend/.env`.

No local database installation needed.

> ⚠️ The team shares one database. Avoid destructive operations and use clearly
> labelled test data (e.g. "Test User — John") so everyone knows what's real.

---

### Create a Local Admin Account

```bash
cd backend
python create_admin.py
```

Follow the prompts. Admin dashboard is at http://localhost:3000/admin

---

### Troubleshooting

**`(venv)` not showing / module not found**
Virtual environment isn't activated. Run the `activate` command for your OS above.

**Port already in use**

```bash
# Mac/Linux
lsof -ti:5000 | xargs kill   # kill backend port
lsof -ti:3000 | xargs kill   # kill frontend port

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Database connection error**
Make sure you're connected to the internet — the database is hosted on Railway.
Check that `DATABASE_URL` in `backend/.env` matches `backend/.env.example` exactly.

**Windows PowerShell: Activate.ps1 blocked**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**`npm install` fails**

```bash
npm cache clean --force
npm install
```

---

### Useful Dev Commands

```bash
# Pull latest changes
git pull origin main

# Apply new database migrations (after pulling changes with DB updates)
cd backend && flask db upgrade

# Seed properties if the DB looks empty
cd backend && python seed.py
```

---

## 🗂️ Project Structure

```
oneApplyHub-2.0/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # App factory, extensions, blueprint registration
│   │   ├── mailer.py            # Verification/reset email senders
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── property.py
│   │   │   ├── review.py
│   │   │   └── application.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── properties.py
│   │   │   ├── reviews.py
│   │   │   ├── admin.py
│   │   │   └── applications.py
│   │   └── utils/                # Validation helpers (email/password/utcnow)
│   ├── migrations/                # Flask-Migrate/Alembic migrations
│   ├── data/                      # Seed data
│   ├── config.py
│   ├── run.py
│   ├── seed.py
│   ├── create_admin.py
│   ├── add_sample_properties.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout/            # Header, MiniHeader, AppSidebar, Footer
    │   │   ├── AdminRoute.jsx
    │   │   ├── ProtectedRoute.js
    │   │   ├── GoogleSignInButton.jsx
    │   │   └── ErrorBoundary.jsx
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── ThemeContext.js
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── VerifyEmailPage.jsx
    │   │   ├── ForgotPasswordPage.jsx
    │   │   ├── ResetPasswordPage.jsx
    │   │   ├── MFASetupPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── PropertiesPage.jsx
    │   │   ├── PropertyDetailPage.jsx
    │   │   ├── ReviewsPage.jsx
    │   │   ├── CreateReviewPage.jsx
    │   │   ├── StudentApplicationPage.jsx
    │   │   ├── BursaryPage.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── services/api.js        # Axios instance + API calls
    │   └── utils/                 # Formatting, SA ID validation
    ├── public/
    └── package.json
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Tebogo Legoabe** - [TebogoLegoabe](https://github.com/TebogoLegoabe)

- **To be updated :)**

## 🙏 Acknowledgments

- Built for Wits and UJ students
- Inspired by the need for reliable student accommodation information
- Thanks to all students who will contribute reviews and feedback

## 🌐 Live Demo

https://www.oneapplyhub.co.za/

## 📞 Support

If you have any questions or need help getting started:

1. Check the [Issues](https://github.com/TebogoLegoabe/oneApplyHub-2.0/issues) page
2. Create a new issue if your problem isn't already listed
3. Contact the development team

---

**Happy coding! 🚀** Help make student accommodation hunting easier for everyone!

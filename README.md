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

## 🚀 Getting Started

### Prerequisites

- **Python 3.8+**
- **Node.js 16+** and **npm**
- **Git**

### 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/TebogoLegoabe/oneApplyHub-2.0.git
   cd oneApplyHub-2.0
   ```

2. **Backend Setup**

   ```bash
   cd backend

   # Create virtual environment
   # (use python3/pip3 below instead if your system has no plain "python" alias — common on macOS/Linux)
   python -m venv venv

   # Activate virtual environment
   # Windows (cmd.exe):
   venv\Scripts\activate
   # Windows (PowerShell):
   venv\Scripts\Activate.ps1
   # Windows (Git Bash) / macOS / Linux:
   source venv/Scripts/activate   # Git Bash on Windows
   source venv/bin/activate       # macOS / Linux

   # Install dependencies
   # (use "python -m pip" rather than a bare "pip" — guarantees the install
   # target is the active venv even if its pip launcher script is missing,
   # e.g. when venv creation is interrupted by OneDrive sync or antivirus)
   python -m pip install -r requirements.txt

   # Create your .env file from the template (see Environment Variables below)
   cp .env.example .env        # Git Bash / macOS / Linux
   # copy .env.example .env    # Windows cmd.exe
   # Copy-Item .env.example .env  # Windows PowerShell

   # Create the database tables from the current models, then tell
   # Alembic you're already at the latest migration. (`flask db upgrade`
   # alone won't work on a brand-new database — the migration history
   # only contains incremental changes on top of an already-existing schema.)
   python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
   flask db stamp head
   ```

3. **Frontend Setup**

   ```bash
   cd ../frontend

   # Install dependencies
   npm install

   # Optional - only needed for the "Sign in with Google" button
   cp .env.example .env        # Git Bash / macOS / Linux
   # copy .env.example .env    # Windows cmd.exe
   # Copy-Item .env.example .env  # Windows PowerShell
   ```

### 🔑 Environment Variables

Both apps read configuration from a `.env` file that is **not committed to git**
(it's covered by `.gitignore`). Each app ships a `.env.example` template —
copy it to `.env` as shown above, then fill in any values you need.

#### Backend ([backend/.env.example](backend/.env.example))

| Variable | Required? | Notes |
| --- | --- | --- |
| `FLASK_ENV` | Yes | Set to `development` for local work. Anything else (or unset) makes the app **fail to start** unless `SECRET_KEY`/`JWT_SECRET_KEY` are set — that's the intended production safety check in [config.py](backend/config.py). |
| `SECRET_KEY`, `JWT_SECRET_KEY` | Only when `FLASK_ENV` is not `development` | Generate with `python -c "import secrets; print(secrets.token_hex(32))"`. In dev, leaving these blank just logs a warning and uses an insecure default. |
| `DATABASE_URL` | No | Defaults to a local SQLite file at `backend/studentstay.db`. Set this for Postgres/Railway. |
| `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USE_TLS`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_DEFAULT_SENDER` | No | Only needed to actually send verification/reset emails. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | No | Only needed for Google OAuth sign-in. |
| `FRONTEND_URL` | No | Used to build links in verification/reset emails. |
| `REDIS_URL` | No | Rate-limit storage backend; defaults to in-memory (fine for a single dev process). |

#### Frontend ([frontend/.env.example](frontend/.env.example))

| Variable | Required? | Notes |
| --- | --- | --- |
| `REACT_APP_GOOGLE_CLIENT_ID` | No | Only needed for the "Sign in with Google" button. Get one from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials). |

### 🏃‍♂️ Running the Application

1. **Start the Backend Server**

   ```bash
   cd backend
   python run.py
   ```

   The Flask API will run on `http://localhost:5000`

2. **Start the Frontend Development Server on another terminal**

   ```bash
   cd frontend
   npm start
   ```

   The React app will run on `http://localhost:3000`

3. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - The app proxies API requests to the Flask backend

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

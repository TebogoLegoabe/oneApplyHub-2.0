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

### 🛡️ **Admin Dashboard**

- Platform-wide stats (users, properties, reviews, applications)
- Approve/reject/edit/delete properties
- Moderate and delete reviews
- Manage users (verify, promote/demote admin & super admin, delete)
- Review and update student application statuses

### 📱 **Responsive Design**

- Mobile-first responsive design with a collapsible sidebar
- Touch-friendly interface
- Works seamlessly across all devices

### 🎯 **University-Specific Features**

- Tailored for Wits and UJ students
- University-specific filtering and content
- Academic year and faculty information integration

## 🛠️ Tech Stack

### **Frontend** ([frontend/package.json](frontend/package.json))

- **React 19** - User interface library
- **React Router 7** - Client-side routing
- **Axios** - HTTP client for the API
- **Recharts** - Dashboard charts and analytics visualizations
- **Lucide React** - Icon set
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** (`AuthContext`, `ThemeContext`) - Global state management

### **Backend** ([backend/requirements.txt](backend/requirements.txt))

| Package                                                                                                  | Purpose                                                   |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Flask                                                                                                    | Core web framework                                        |
| Flask-SQLAlchemy                                                                                         | ORM / database models                                     |
| Flask-Migrate                                                                                            | Alembic-based schema migrations                           |
| Flask-JWT-Extended                                                                                       | JWT issuing/validation for authenticated routes           |
| Flask-CORS                                                                                               | Cross-origin resource sharing                             |
| Flask-Limiter                                                                                            | Per-route rate limiting (in-memory or Redis-backed)       |
| Flask-Mail                                                                                               | Transactional email (verification codes, password resets) |
| SQLAlchemy                                                                                               | SQL toolkit underlying the ORM                            |
| google-auth                                                                                              | Verifies Google OAuth ID tokens                           |
| requests                                                                                                 | HTTP calls to Google's userinfo endpoint                  |
| pyotp                                                                                                    | TOTP generation/verification for MFA                      |
| qrcode[pil]                                                                                              | Generates MFA setup QR codes                              |
| psycopg2-binary                                                                                          | PostgreSQL driver (production database)                   |
| python-dotenv                                                                                            | Loads `.env` files in development                         |
| gunicorn                                                                                                 | Production WSGI server                                    |
| PyJWT, itsdangerous, Werkzeug, Jinja2, MarkupSafe, click, blinker, colorama, greenlet, typing_extensions | Flask/Werkzeug dependency stack                           |

### **Database**

- **SQLite** for local development
- **PostgreSQL** in production (Railway), via `DATABASE_URL`

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

- `review_id` (FK, cascade delete), `user_id` (FK, cascade delete)
- Constraint: unique `(review_id, user_id)` pair

### `Application` ([application.py](backend/app/models/application.py))

A student's accommodation application.

- `user_id` (FK, unique — one application per user), auto-generated `reference` (e.g. `APP-XXXXXXXX`)
- Indexed fields: `first_name`, `last_name`, `university`, `student_number`
- `form_data` — full submitted form, stored as JSON
- Workflow: `status` (`pending` → `under_review` → `approved`/`rejected`), `admin_notes`

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
   pip install -r requirements.txt

   # Create your .env file (see Environment Variables below)

   # Create the database tables from the current models, then tell
   # Alembic you're already at the latest migration. (`flask db upgrade`
   # alone won't work on a brand-new database — the migration history
   # only contains incremental changes on top of an already-existing schema.)
   python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
   flask db stamp head

   # Create an admin user (optional, interactive prompt)
   python create_admin.py

   # Add sample data (optional)
   python add_sample_properties.py
   ```

3. **Frontend Setup**

   ```bash
   cd ../frontend

   # Install dependencies
   npm install
   ```

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

## 📚 API Endpoints

### **Authentication** (`/api/auth`)

- `POST /api/auth/register` - Register with a university email
- `POST /api/auth/login` - Login (returns an access token, or an MFA challenge)
- `GET /api/auth/profile` - Get the current user's profile
- `POST /api/auth/send-verification` - Resend the email verification code
- `POST /api/auth/verify-email` - Verify email with the OTP code
- `POST /api/auth/google/verify` - Sign in with Google (access token or ID token)
- `POST /api/auth/forgot-password` - Request a password reset email
- `POST /api/auth/reset-password` - Reset password with a reset token
- `POST /api/auth/mfa/verify-login` - Complete login with a TOTP/backup code
- `POST /api/auth/mfa/setup` - Generate a TOTP secret + QR code
- `POST /api/auth/mfa/enable` - Confirm TOTP code and enable MFA (returns backup codes)
- `POST /api/auth/mfa/disable` - Disable MFA

### **Properties** (`/api/properties`)

- `GET /api/properties` - List approved properties (filter by university, type, price, search; paginated)
- `GET /api/properties/:id` - Get a specific approved property

### **Reviews** (`/api/reviews`)

- `GET /api/reviews` - List approved reviews (filter by university, min rating, search; paginated)
- `GET /api/reviews/property/:id` - Get approved reviews for a specific property
- `POST /api/reviews/property/:id` - Submit a review (verified users only)
- `POST /api/reviews/:id/helpful` - Mark a review as helpful
- `GET /api/reviews/dashboard` - Aggregate stats for the student dashboard (auth required)
- `GET /api/reviews/user/stats` - Current user's own review stats (auth required)

### **Applications** (`/api/applications`)

- `POST /api/applications` - Submit a student accommodation application
- `GET /api/applications/my` - Get the current user's application

### **Admin** (`/api/admin`) — requires `is_admin`

- `GET /api/admin/stats` - Platform-wide counts
- `GET /api/admin/properties` - List properties (filter by status; paginated)
- `POST /api/admin/properties` - Create a property
- `PUT /api/admin/properties/:id` - Update a property
- `PATCH /api/admin/properties/:id/approve` - Toggle property approval
- `DELETE /api/admin/properties/:id` - Delete a property (and its reviews/images)
- `GET /api/admin/users` - List users (filter by university/verified; paginated)
- `PATCH /api/admin/users/:id` - Verify a user, or grant/revoke admin/super-admin (super admin only for role changes)
- `DELETE /api/admin/users/:id` - Delete a user
- `GET /api/admin/reviews` - List reviews (filter by status; paginated)
- `PATCH /api/admin/reviews/:id/approve` - Toggle review approval
- `DELETE /api/admin/reviews/:id` - Delete a review
- `GET /api/admin/applications` - List student applications (filter by status; paginated)
- `PATCH /api/admin/applications/:id/status` - Update an application's status/notes

### **Misc**

- `GET /` - Health check
- `GET /api/health` - Health check including DB connectivity
- `GET /api/stats` - Public platform stats (approved properties/reviews, verified students)

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

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Core
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key
FLASK_ENV=development
DATABASE_URL=sqlite:///studentstay.db

# Flask-Mail (verification codes, password resets)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=noreply@oneapplyhub.co.za

# Google OAuth (optional — Google sign-in is disabled if unset)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Rate limiting (optional — falls back to in-memory storage)
REDIS_URL=redis://localhost:6379

# Frontend origin (added to CORS allow-list and used in reset-password links)
FRONTEND_URL=http://localhost:3000
```

In production, `SECRET_KEY` and `JWT_SECRET_KEY` are required — the app refuses to start without them when `FLASK_ENV` is not `development`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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

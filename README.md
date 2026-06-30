# 🏠 oneApplyHub

oneApplyHub is a student accommodation platform for Wits and UJ students. Students can discover verified accommodation, read reviews, apply for accommodation, and track application status. Admins can manage properties, users, reviews, and applications.

## ✨ Features

### Property discovery

- Browse verified student accommodation properties
- Filter by price, location, property type, university, and amenities
- View NSFAS accredited accommodation
- See ratings and reviews from students

### Student reviews

- Verified student reviews
- Ratings for value, location, safety, cleanliness, management, and facilities
- Helpful votes with server side duplicate prevention
- Anonymous review option
- Admin moderation before public display

### Authentication and security

- JWT based authentication
- University email verification with one time codes
- Google OAuth sign in
- MFA with authenticator apps and backup codes
- Forgot password and reset password flow
- Rate limiting on sensitive auth endpoints

### Applications

- Guided student accommodation application form
- Unique application reference number
- Status workflow: `pending`, `under_review`, `approved`, `rejected`
- Students can view their own application status

## 🛠️ Tech stack

### Frontend

- React 19
- React Router 7
- Axios
- Recharts
- Lucide React
- Tailwind CSS
- Context API

### Backend

- Flask
- Flask SQLAlchemy
- Flask Migrate
- Flask JWT Extended
- Flask Limiter
- Flask Mail
- PostgreSQL
- Gunicorn

## 📁 Project structure

```text
oneApplyHub-2.0/
  backend/
    app/
      models/
      routes/
      utils.py
    migrations/
    .env.example
    requirements.txt
    run.py
  frontend/
    src/
    .env.example
    package.json
  docker-compose.yml
  README.md
```

## 🚀 Local development setup

### Prerequisites

Install these first:

```bash
python --version
node --version
docker --version
docker compose version
```

Recommended versions:

```text
Python 3.10 or newer
Node.js 18 or newer
Docker Desktop
```

## 🗄️ Local PostgreSQL and pgAdmin with Docker

This project includes a `docker-compose.yml` file for local PostgreSQL and pgAdmin.

### 1. Start the database tools

From the project root:

```bash
docker compose up -d postgres pgadmin
```

This starts:

```text
PostgreSQL: localhost:5432
pgAdmin:    http://localhost:5050
```

### 2. Open pgAdmin

Go to:

```text
http://localhost:5050
```

Default local pgAdmin login from `docker-compose.yml`:

```text
Email: admin@oneapplyhub.local
Password: CHANGE_ME
```

### 3. Register the local PostgreSQL server in pgAdmin

In pgAdmin:

```text
Right click Servers
Choose Register
Choose Server
```

General tab:

```text
Name: oneApplyHub Local
```

Connection tab:

```text
Host name/address: postgres
Port: 5432
Maintenance database: oneapplyhub_dev
Username: oneapplyhub
Password: CHANGE_ME
```

Use `postgres` as the host inside pgAdmin because pgAdmin and PostgreSQL are running in the same Docker network.

Use `localhost` as the host from your Flask app because Flask runs on your machine.

## 🔧 Backend setup

### 1. Create and activate a virtual environment

```bash
cd backend
python -m venv venv
```

Mac or Linux:

```bash
source venv/bin/activate
```

Windows PowerShell:

```powershell
venv\Scripts\Activate.ps1
```

Windows Command Prompt:

```cmd
venv\Scripts\activate
```

Windows Git Bash:

```bash
cd backend/venv/Scripts
source activate
```

After activation, Git Bash should show `(venv)` before the prompt:

```bash
(venv)
User@TebogoLegoabe MINGW64 ~/OneDrive/Desktop/oneApplyHub/oneApplyHub-2.0/backend/venv/Scripts (main)
$
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Create backend environment file

```bash
cp .env.example .env
```

On Windows Command Prompt:

```cmd
copy .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Your local database URL should look like this:

```env
DATABASE_URL=postgresql://oneapplyhub:CHANGE_ME@localhost:5432/oneapplyhub_dev
```

### 4. Set secret keys

Generate two local secret keys:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Paste them into `backend/.env`:

```env
SECRET_KEY=your_generated_secret
JWT_SECRET_KEY=your_generated_jwt_secret
```

### 5. Run database migrations

From the `backend` folder:

```bash
flask db upgrade
```

If Flask cannot find the app, run:

Mac or Linux:

```bash
export FLASK_APP=run.py
flask db upgrade
```

Windows PowerShell:

```powershell
$env:FLASK_APP="run.py"
flask db upgrade
```

### 6. Start the backend

```bash
python run.py
```

Backend runs at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

## 💻 Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
```

Create frontend environment file:

```bash
cp .env.example .env
```

On Windows Command Prompt:

```cmd
copy .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Make sure this is set:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

Frontend runs at:

```text
http://localhost:3000
```

## 👤 Create a local admin account

From the `backend` folder:

```bash
python create_admin.py
```

Then go to:

```text
http://localhost:3000/admin
```

## 🧪 Useful Docker commands

Stop containers:

```bash
docker compose down
```

Start containers again:

```bash
docker compose up -d postgres pgadmin
```

View logs:

```bash
docker compose logs -f postgres
```

Reset the local database completely:

```bash
docker compose down -v
docker compose up -d postgres pgadmin
cd backend
flask db upgrade
```

Only use `docker compose down -v` when you're okay with deleting all local database data.

## 🔐 Secrets and production notes

Do not commit real values for:

```text
DATABASE_URL
SECRET_KEY
JWT_SECRET_KEY
MAIL_PASSWORD
GOOGLE_CLIENT_SECRET
REDIS_URL
```

Production secrets should live in Railway, Vercel, or the hosting provider environment variable settings.

If a real secret is accidentally committed, delete it from the file, rotate the secret in the provider dashboard, and assume the old value is compromised.

## 🧯 Troubleshooting

### Backend cannot connect to PostgreSQL

Check that Docker is running:

```bash
docker compose ps
```

Check that the backend `.env` uses `localhost`, not `postgres`:

```env
DATABASE_URL=postgresql://oneapplyhub:CHANGE_ME@localhost:5432/oneapplyhub_dev
```

### pgAdmin cannot connect to PostgreSQL

Inside pgAdmin, use this host:

```text
postgres
```

Not `localhost`.

### Port already in use

Mac or Linux:

```bash
lsof -ti:5000 | xargs kill
lsof -ti:3000 | xargs kill
```

Windows:

```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Virtual environment not active

Activate it again:

```bash
cd backend
source venv/bin/activate
```

Windows PowerShell:

```powershell
cd backend
venv\Scripts\Activate.ps1
```

Windows Git Bash:

```bash
cd backend/venv/Scripts
source activate
```

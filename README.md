# 🏠 oneApplyHub

oneApplyHub is a student accommodation platform for matric learners and university students. Students can discover verified accommodation, read reviews, apply for accommodation, and track application status. Admins can manage properties, users, reviews, and applications.

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
- Email verification with one time codes
- Google sign in for users who already registered first
- MFA with authenticator apps and backup codes
- Forgot password and reset password flow
- Rate limiting on sensitive auth endpoints

### Applications

- Guided student accommodation application form
- Unique application reference number
- Status workflow: `pending`, `under_review`, `approved`, `rejected`
- Students can view their own application status
- Documents can be uploaded later while an application is pending

### Admin roles

- Super admin: `info@oneapplyhub.co.za`
- Super admin can manage all users, properties, reviews, applications, and managing-admin assignments
- Managing admins can manage only assigned properties and the students/applications linked to those properties

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
      utils/
    sql/
    .env.example
    create_admin.py
    requirements.txt
    run.py
  frontend/
    src/
    .env.example
    package.json
  docker-compose.yml
  README.md
```

## 🚀 Quick local setup checklist

From the project root:

```bash
git pull
```

Start PostgreSQL and pgAdmin:

```bash
docker compose up -d postgres pgadmin
```

Set up backend:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

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
cd ../..
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Create backend `.env`:

Git Bash or Mac/Linux:

```bash
cp .env.example .env
```

Windows Command Prompt:

```cmd
copy .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Generate two secret keys:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
python -c "import secrets; print(secrets.token_hex(32))"
```

Put them into `backend/.env`:

```env
SECRET_KEY=paste_first_generated_key_here
JWT_SECRET_KEY=paste_second_generated_key_here
DATABASE_URL=postgresql://oneapplyhub:CHANGE_ME@localhost:5432/oneapplyhub_dev
FRONTEND_URL=http://localhost:3000
```

The local database password must match `docker-compose.yml`:

```yaml
POSTGRES_USER: oneapplyhub
POSTGRES_PASSWORD: CHANGE_ME
POSTGRES_DB: oneapplyhub_dev
```

Run migrations or create tables:

```bash
flask db upgrade
```

Create or promote the local super admin:

```bash
python create_admin.py
```

For the official super admin, press Enter when asked for email. It defaults to:

```text
info@oneapplyhub.co.za
```

Start the backend:

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

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Create frontend environment file:

Git Bash or Mac/Linux:

```bash
cp .env.example .env
```

Windows Command Prompt:

```cmd
copy .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Make sure this is set in `frontend/.env`:

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

## 🗄️ pgAdmin setup

Open pgAdmin:

```text
http://localhost:5050
```

Default local pgAdmin login from `docker-compose.yml`:

```text
Email: admin@oneapplyhub.local
Password: CHANGE_ME
```

Register the local PostgreSQL server in pgAdmin:

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

## 👤 Super admin and managing admins

Create or promote the super admin locally:

```bash
cd backend
python create_admin.py
```

The official super admin email is:

```text
info@oneapplyhub.co.za
```

After logging in as super admin, go to:

```text
http://localhost:3000/admin/property-admins
```

There you can assign managing admins to properties.

Managing admins can only manage:

- Their assigned properties
- Reviews for those assigned properties
- Applications where students selected one of those assigned properties
- Student/applicant records connected to those visible applications

## 🧪 Useful Docker commands

Check running containers:

```bash
docker compose ps
```

Stop containers:

```bash
docker compose down
```

Start containers again:

```bash
docker compose up -d postgres pgadmin
```

View PostgreSQL logs:

```bash
docker compose logs -f postgres
```

Reset the local database completely:

```bash
docker compose down -v
docker compose up -d postgres pgadmin
cd backend
flask db upgrade
python create_admin.py
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

### Missing `SECRET_KEY` or `JWT_SECRET_KEY`

Error:

```text
RuntimeError: Missing required environment variables: SECRET_KEY, JWT_SECRET_KEY
```

Fix:

```bash
cd backend
cp .env.example .env
python -c "import secrets; print(secrets.token_hex(32))"
python -c "import secrets; print(secrets.token_hex(32))"
```

Then add both generated values to `backend/.env`:

```env
SECRET_KEY=first_generated_value
JWT_SECRET_KEY=second_generated_value
```

### Password authentication failed for user `oneapplyhub`

Error:

```text
psycopg2.OperationalError: connection to server at "localhost", port 5432 failed: FATAL: password authentication failed for user "oneapplyhub"
```

This means `backend/.env` has the wrong database password.

For the default local Docker setup, use:

```env
DATABASE_URL=postgresql://oneapplyhub:CHANGE_ME@localhost:5432/oneapplyhub_dev
```

This must match `docker-compose.yml`:

```yaml
POSTGRES_USER: oneapplyhub
POSTGRES_PASSWORD: CHANGE_ME
POSTGRES_DB: oneapplyhub_dev
```

If you previously started Docker with a different password, the old password is stored in the Docker volume. Either use the old password in `.env`, or reset the local DB:

```bash
docker compose down -v
docker compose up -d postgres pgadmin
```

Then rerun:

```bash
cd backend
flask db upgrade
python create_admin.py
```

### Backend cannot connect to PostgreSQL

Check Docker is running:

```bash
docker compose ps
```

Start the database:

```bash
docker compose up -d postgres pgadmin
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

Activate it again.

Mac or Linux:

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
cd ../..
```

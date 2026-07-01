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

## 🚀 Tested local setup on Windows

These steps use Docker PostgreSQL on host port `15432`. This avoids conflicts with any local Windows PostgreSQL service already using ports `5432` or `5433`.

### 1. Pull latest code

From the project root:

```powershell
git pull
```

### 2. Start PostgreSQL and pgAdmin

From the project root:

```powershell
docker compose down -v
docker compose up -d postgres pgadmin
docker compose ps
```

Expected PostgreSQL status:

```text
oneapplyhub-postgres   Up ... (healthy)   0.0.0.0:15432->5432/tcp
```

`docker compose down -v` deletes only your local Docker database volume. Use it when resetting local dev data is okay.

### 3. Test the database port from Windows

From the project root:

```powershell
cd backend
python -c "import psycopg2; conn=psycopg2.connect(host='127.0.0.1', port=15432, dbname='oneapplyhub_dev', user='oneapplyhub', password='oneapplyhub123'); print('connected')"
```

Expected output:

```text
connected
```

### 4. Create and activate the backend virtual environment

From the `backend` folder:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, run this once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then activate again:

```powershell
.\venv\Scripts\Activate.ps1
```

Expected prompt:

```text
(venv) PS ...\oneApplyHub-2.0\backend>
```

### 5. Install backend dependencies

```powershell
pip install -r requirements.txt
```

### 6. Create backend `.env`

From the `backend` folder:

```powershell
Copy-Item .env.example .env
notepad .env
```

Generate two secret keys:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
python -c "import secrets; print(secrets.token_hex(32))"
```

Put them into `backend/.env`:

```env
SECRET_KEY=paste_first_generated_key_here
JWT_SECRET_KEY=paste_second_generated_key_here
DATABASE_URL=postgresql://oneapplyhub:oneapplyhub123@127.0.0.1:15432/oneapplyhub_dev
FRONTEND_URL=http://localhost:3000
```

### 7. Create the local super admin

From the `backend` folder:

```powershell
python create_admin.py
```

When asked for email, press Enter to use the default official super admin email:

```text
info@oneapplyhub.co.za
```

Example successful result:

```text
Done
----
Email : info@oneapplyhub.co.za
Role  : Super Admin
Status: verified and active
```

### 8. Start the backend

```powershell
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

```powershell
cd frontend
npm install
```

Create frontend environment file:

```powershell
Copy-Item .env.example .env
notepad .env
```

Make sure this is set in `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:

```powershell
npm start
```

Frontend runs at:

```text
http://localhost:3000
```

## 🗄️ pgAdmin setup

Open pgAdmin in the browser:

```text
http://localhost:5050
```

Default local pgAdmin login from `docker-compose.yml`:

```text
Email: admin@oneapplyhub.local
Password: oneapplyhub123
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

Connection tab when using Docker pgAdmin at `http://localhost:5050`:

```text
Host name/address: postgres
Port: 5432
Maintenance database: oneapplyhub_dev
Username: oneapplyhub
Password: oneapplyhub123
```

Connection tab when using the desktop pgAdmin app on Windows:

```text
Host name/address: 127.0.0.1
Port: 15432
Maintenance database: oneapplyhub_dev
Username: oneapplyhub
Password: oneapplyhub123
```

## 👤 Super admin and managing admins

The official super admin email is:

```text
info@oneapplyhub.co.za
```

Create or promote the super admin locally:

```powershell
cd backend
python create_admin.py
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

```powershell
docker compose ps
```

Stop containers:

```powershell
docker compose down
```

Start containers again:

```powershell
docker compose up -d postgres pgadmin
```

View PostgreSQL logs:

```powershell
docker compose logs -f postgres
```

Reset the local database completely:

```powershell
docker compose down -v
docker compose up -d postgres pgadmin
cd backend
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

### `docker compose up` says no configuration file provided

You are not in the project root. Run:

```powershell
cd "C:\Users\User\OneDrive\Desktop\oneApplyHub\oneApplyHub-2.0"
docker compose up -d postgres pgadmin
```

### Missing `SECRET_KEY` or `JWT_SECRET_KEY`

Error:

```text
RuntimeError: Missing required environment variables: SECRET_KEY, JWT_SECRET_KEY
```

Fix:

```powershell
cd backend
Copy-Item .env.example .env
python -c "import secrets; print(secrets.token_hex(32))"
python -c "import secrets; print(secrets.token_hex(32))"
```

Then add both generated values to `backend/.env`.

### Password authentication failed for user `oneapplyhub`

Error:

```text
psycopg2.OperationalError: FATAL: password authentication failed for user "oneapplyhub"
```

Use the tested local database URL:

```env
DATABASE_URL=postgresql://oneapplyhub:oneapplyhub123@127.0.0.1:15432/oneapplyhub_dev
```

Then reset the local database volume if needed:

```powershell
cd "C:\Users\User\OneDrive\Desktop\oneApplyHub\oneApplyHub-2.0"
docker compose down -v
docker compose up -d postgres pgadmin
```

Test the Windows PostgreSQL port:

```powershell
cd backend
python -c "import psycopg2; conn=psycopg2.connect(host='127.0.0.1', port=15432, dbname='oneapplyhub_dev', user='oneapplyhub', password='oneapplyhub123'); print('connected')"
```

### Port already in use

Windows:

```powershell
netstat -ano | findstr :5432
netstat -ano | findstr :5433
netstat -ano | findstr :15432
```

The project uses host port `15432` for Docker PostgreSQL to avoid common local conflicts.

### Virtual environment not active

Windows PowerShell:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
```

Windows Git Bash:

```bash
cd backend/venv/Scripts
source activate
cd ../..
```

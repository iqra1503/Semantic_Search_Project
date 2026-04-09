# Document Management System

A production-ready full-stack Document Management System with role-based access control.

## Project Structure

- `backend/` FastAPI + SQLAlchemy + JWT auth
- `frontend/` React (Vite) + React Router + Axios

## Backend Setup

1. Create and activate a virtual environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy environment file and edit values:
   ```bash
   cp .env.example .env
   ```
4. Run migrations / create tables (automatic on startup for development).
5. Start server:
   ```bash
   uvicorn app.main:app --reload
   ```

Backend runs on `http://localhost:8000`.

### PostgreSQL Configuration

Set `DATABASE_URL` in `.env`:

```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/document_db
```

For local development with SQLite:

```env
DATABASE_URL=sqlite:///./document_management.db
```

## Backend Environment Variables

The backend reads `.env` from either the repository root or `backend/.env`, so you can update tokens in one place without changing code.

```env
JWT_SECRET_KEY=change-me
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=sqlite:///./app.db

# Use either one of these tokens
EMBEDDINGS_API_KEY=
GITHUB_TOKEN=

EMBEDDINGS_MODEL=text-embedding-3-small
EMBEDDINGS_BASE_URL=https://models.inference.ai.azure.com
SUMMARY_MODEL=gpt-4o-mini
LLM_BASE_URL=https://models.inference.ai.azure.com
```

`EMBEDDINGS_API_KEY` is preferred when set; otherwise `GITHUB_TOKEN` is used.

## Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```

Frontend runs on `http://localhost:5173`.

## Default API Base URL

Set in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Features

- JWT authentication with bcrypt password hashing
- Role-based access (`admin`, `user`)
- Admin panel for user/document management
- User panel for self-managed documents
- Protected frontend routes by role
- Axios interceptor for JWT

## API Routes

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET|POST /api/users` (admin)
- `GET|PUT /api/users/{id}` (admin)
- `GET|POST /api/documents`
- `GET|PUT|DELETE /api/documents/{id}`


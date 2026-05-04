# PROJECT-DOCS — Developer setup & reference

## Prerequisites

- Node.js 18+ and npm.
- Python 3.11+ recommended.
- MySQL 8+ (local or Railway).

## Clone and layout

```bash
git clone <your-repo-url>
cd my-project
```

Root documentation files (`PLANNING.md` … `TEST-REPORT.md`) describe SDLC and testing.

## Backend setup

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
```

Create **`my-project/.env`** (gitignored) — see variables below.

Run API:

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open `http://127.0.0.1:8000/docs`.

## Frontend setup

```bash
cd frontend
npm install
```

Create **`frontend/.env`**:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Run dev server:

```bash
npm run dev
```

## Environment variables

### Root `.env` (backend reads via `settings.py` — paths include repo root)

| Variable | Purpose |
|----------|---------|
| `MYSQL_HOST` | MySQL host |
| `MYSQL_USER` | MySQL user |
| `MYSQL_PASSWORD` | MySQL password |
| `MYSQL_DATABASE` | Database name |
| `MYSQL_PORT` | Port (default 3306) |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI key (optional) |
| `AZURE_OPENAI_ENDPOINT` | Azure resource endpoint URL |
| `AZURE_OPENAI_DEPLOYMENT` | Deployment name |
| `AZURE_OPENAI_API_VERSION` | API version string |
| `FRONTEND_URL` | Production frontend origin for CORS |

### Frontend `.env` / `.env.production`

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Base URL for Axios (no trailing slash) |

Copy from **`.env.example`** at repo root; never commit filled `.env`.

## Folder structure

See `DESIGN.md` §4 for the canonical tree.

## Useful commands

| Task | Command |
|------|---------|
| Frontend production build | `cd frontend && npm run build` |
| Backend quick lint | `python -m compileall backend/app` |

## Troubleshooting

- **CORS errors:** set `FRONTEND_URL` to your Vite dev URL or deployed frontend URL.
- **DB connection refused:** verify host/port and that MySQL allows your IP.
- **AI message generic:** check Azure env vars and Vercel logs; fallback text is intentional when Azure fails.

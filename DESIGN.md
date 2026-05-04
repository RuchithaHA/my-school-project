# DESIGN — Greenwood International School

## 1. Architecture (text diagram)

```
┌─────────────────┐     HTTPS (VITE_API_URL)      ┌──────────────────────┐
│  React (Vite)   │ ─────────────────────────────► │  FastAPI (Vercel)    │
│  Vercel         │                               │  Python ASGI         │
└─────────────────┘                               └──────────┬───────────┘
        │                                                    │
        │                                                    │ mysql+aiomysql
        │                                                    ▼
        │                                         ┌──────────────────────┐
        │                                         │  MySQL (Railway)     │
        │                                         │  admissions, seats,  │
        │                                         │  contacts            │
        │                                         └──────────────────────┘
        │
        │  Open-Meteo (server-side, cached 30m)
        │  Azure OpenAI (optional welcome copy)
```

## 2. Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript, TailwindCSS, React Router, Axios, React Hook Form, Zod |
| Backend | FastAPI (async), SQLAlchemy async, aiomysql, Pydantic v2, pydantic-settings |
| Database | MySQL (Railway) |
| AI | Azure OpenAI (chat completion) for welcome message; fallback text if unavailable |
| Hosting | Frontend → Vercel; Backend → Vercel (`vercel.json`); DB → Railway |

## 3. API routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness |
| POST | `/api/admissions` | Create admission; atomic seat decrement; welcome message |
| GET | `/api/admissions` | List admissions, newest first |
| GET | `/api/admissions/lookup/{application_number}` | Get admission by application number (status page) |
| GET | `/api/admissions/{id}` | Get admission by numeric id |
| PUT | `/api/admissions/{id}/status` | Update status: `pending`, `approved`, `rejected`, `waitlist` |
| DELETE | `/api/admissions/{id}` | Delete admission; restore seat |
| GET | `/api/seats` | List seat rows per class |
| PUT | `/api/seats/{class_name}` | Update `total_seats` for a class |
| POST | `/api/contacts` | Save contact message |
| GET | `/api/contacts` | List contacts |
| GET | `/api/weather` | Bengaluru weather (30 min cache) |

Interactive docs: `/docs` (FastAPI).

## 4. Folder structure (repository)

```
my-project/
├── PLANNING.md … TEST-REPORT.md
├── .env.example
├── .gitignore
├── backend/
│   ├── vercel.json
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── db.py
│       ├── models.py
│       ├── schemas.py
│       ├── services.py
│       └── settings.py
└── frontend/
    ├── vercel.json
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── api/client.ts
        ├── pages/
        │   ├── Home.tsx
        │   ├── Admission.tsx
        │   ├── Status.tsx
        │   ├── Admin.tsx
        │   └── Contact.tsx
        └── components/
            ├── Navbar.tsx
            ├── Footer.tsx
            ├── WeatherWidget.tsx
            └── StatusBadge.tsx
```

## 5. Key design decisions

- **Atomic seat reservation:** Transaction with row-level lock on `seats` row for `class_applying`.
- **Application numbers:** Generated server-side (`GIS-YYYY-####` pattern).
- **Admin auth:** Client-side session flag with fixed password (not suitable for high security; documented as demo-grade).
- **CORS:** Driven by `FRONTEND_URL` plus local dev defaults.

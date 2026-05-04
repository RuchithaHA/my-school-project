# PLANNING — Greenwood International School

## Project overview

Greenwood International School is a **school admission management system** that lets parents submit admission applications online, check application status, and lets administrators review applications, update statuses, manage class seat capacity, and read contact form messages.

## Goals

1. **Digitize admissions** — Capture structured student and parent data with validation.
2. **Seat integrity** — Reserve a seat atomically when an application is submitted.
3. **Transparency** — Parents can look up status by application number.
4. **Operations** — Admin dashboard for counts, filtering, status workflow, seat totals, and contacts.
5. **Engagement** — Optional AI-generated welcome copy after submission; Bengaluru weather on the home page.

## Scope (in scope)

- Public marketing home page with weather and CTAs.
- Full admission form with client-side validation (React Hook Form + Zod).
- Application status lookup by application number.
- Contact form stored in MySQL.
- Admin dashboard (password gate) with admissions table, seat editor, contacts tab.
- REST API on FastAPI with async SQLAlchemy + MySQL (Railway).
- Deployment targets: frontend and backend on Vercel; database on Railway MySQL.

## Out of scope

- Payment / fee collection.
- Document uploads (birth certificate, transcripts).
- Multi-school or multi-tenant SaaS.
- Email/SMS notifications (no transactional messaging in v1).
- Role-based admin users (single shared password only).
- Mobile native apps.

## Feasibility

- **Technical:** Standard CRUD + transactional seat decrement; Open-Meteo has a stable public API; Azure OpenAI is optional with graceful fallback.
- **Operational:** Vercel serverless + Railway MySQL requires reachable MySQL from Vercel (public Railway hostname or TCP proxy); teams must configure env vars in Vercel only (never in repo).

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| MySQL not reachable from Vercel (internal host) | Use Railway **public** `MYSQL_HOST` / connection string for external clients. |
| Cold starts / connection limits | Keep DB pool small; avoid long transactions. |
| Duplicate or race on seat booking | `SELECT ... FOR UPDATE` within a single DB transaction on `create_admission`. |
| Azure OpenAI outage or misconfiguration | Fallback to static welcome template in code. |
| Secrets committed to git | `.gitignore` includes `.env`; use `.env.example` only; no secrets in `vercel.json`. |

## Success criteria

- End-to-end application submission persists to MySQL and returns application number + welcome message.
- Admin can list, filter, change status, delete, and adjust total seats.
- Weather endpoint returns cached Bengaluru data (30 minutes).
- Documentation set (SDLC files) matches implemented behavior.

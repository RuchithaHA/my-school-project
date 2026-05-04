# DEPLOYMENT — Greenwood International School

## 1. Environments

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| Local | `npm run dev` (Vite) | `uvicorn app.main:app --reload` | Local or Railway MySQL |
| Production | Vercel | Vercel (`@vercel/python`) | Railway MySQL |

**Important:** Vercel serverless must use a **public** MySQL hostname reachable from the internet. Railway internal hostnames (e.g. `*.railway.internal`) work only inside Railway’s network.

## 2. CI/CD (recommended)

1. **On push to `main`:** run frontend `npm ci && npm run build` and backend import/smoke tests (optional `pytest`).
2. **Artifact:** production build of frontend (`dist/`).
3. **Deploy:** Vercel Git integration for both projects **or** Vercel CLI in CI with token (`VERCEL_TOKEN`).

This repository documents manual CLI steps below; wire your Git provider to Vercel for full automation.

## 3. Manual Vercel CLI (outline)

> **Never** commit secrets. Add all sensitive values in the Vercel dashboard or via `vercel env add` interactively.

1. Install Vercel CLI: `npm i -g vercel`.
2. Login: `vercel login`.
3. Deploy **backend** first: `cd backend && vercel --prod --yes`.
4. Note production API URL; set `VITE_API_URL` for frontend build.
5. Deploy **frontend**: `cd frontend && vercel --prod --yes`.
6. Set `FRONTEND_URL` on the **backend** Vercel project to the live frontend origin.
7. Redeploy backend so CORS picks up `FRONTEND_URL`.

## 4. Staging URL

- Use Vercel **preview** deployments per branch/PR, or a dedicated staging project with its own MySQL schema.

## 5. Production checklist

- [ ] `MYSQL_*` points to reachable MySQL.
- [ ] `FRONTEND_URL` matches exact frontend origin (scheme + host, no trailing slash unless intentional).
- [ ] `VITE_API_URL` in frontend production env matches backend URL.
- [ ] Azure OpenAI variables set if AI copy is required; otherwise fallback still works.
- [ ] `backend/vercel.json` and `frontend/vercel.json` contain **no** env values.
- [ ] Smoke: health, create admission, admin list.

## 6. Rollback plan

1. In Vercel dashboard, open **Deployments** for the affected project.
2. **Promote** the last known-good deployment to Production.
3. If database migration was destructive (not typical for this app), restore from Railway snapshot/backup if configured.

## 7. Observability

- Use Vercel function logs for backend errors.
- Use Railway metrics/logs for MySQL connectivity and query errors.

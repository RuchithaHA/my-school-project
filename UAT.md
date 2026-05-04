# UAT — Acceptance Criteria & Manual Test Checklist

## Acceptance criteria (summary)

| ID | Criterion | Pass condition |
|----|-----------|----------------|
| A1 | Home page | Hero, features, CTA, navbar, footer render; weather shows data or graceful error. |
| A2 | Admission validation | Each empty required field shows red **This field is required**; email/phone/pincode messages per SRS. |
| A3 | Admission success | Modal shows application number + welcome text; form clears. |
| A4 | Admission API error | Toast/banner error; form data retained. |
| A5 | Status lookup | Valid application number returns record; invalid shows not found. |
| A6 | Admin login | Correct password enters dashboard; wrong password blocked. |
| A7 | Admin table | Lists admissions; badges match status colors. |
| A8 | Status update | Dropdown saves; persists after refresh. |
| A9 | Delete | Confirmation dialog; row removed; seat count restored appropriately. |
| A10 | Seats | Table matches API; editing total seats updates availability. |
| A11 | Contacts | Public form saves; admin tab lists entries. |
| A12 | Security | No secrets in repo / `vercel.json`; `.env` gitignored. |

---

## Manual test checklist

### Environment prep

- [ ] Backend `.env` or Vercel env: MySQL + optional Azure + `FRONTEND_URL`.
- [ ] Frontend `.env` / `.env.production`: `VITE_API_URL` points to backend.

### Home (`/`)

- [ ] Page loads without console errors.
- [ ] Weather widget loads (or shows error state).
- [ ] Links navigate to Admission, Status, Contact, Admin.

### Admission (`/admission`)

- [ ] Submit empty form → all required fields show red errors with correct copy.
- [ ] Invalid email → **Invalid email**.
- [ ] Phone `<` 10 digits → **Invalid phone**.
- [ ] Pincode not 6 digits → **Invalid pincode**.
- [ ] Valid submission → success modal with app number + message → form empty.
- [ ] Simulate API failure → error toast + data still in fields.

### Status (`/status`)

- [ ] Known application number shows details.
- [ ] Unknown number shows friendly not-found.

### Admin (`/admin`)

- [ ] Login with `admin123` works.
- [ ] Summary cards counts match table / filters.
- [ ] Search by partial name works.
- [ ] Search by application number works.
- [ ] Status filter works.
- [ ] Change status per row persists (reload page).
- [ ] Delete with cancel leaves row.
- [ ] Delete with confirm removes row.
- [ ] Seats section: change total seats; reload confirms.

### Contacts

- [ ] `/contact` submit creates row.
- [ ] Admin Contacts tab shows new row.

### API smoke (optional)

- [ ] `GET /api/health` → `healthy`.
- [ ] `GET /api/docs` loads.

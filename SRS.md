# Software Requirements Specification (SRS) — Greenwood International School

## 1. Introduction

### 1.1 Purpose

This SRS defines functional and non-functional requirements for the Greenwood International School admission management web application (frontend, backend, and MySQL database).

### 1.2 Stakeholders

| Stakeholder | Need |
|-------------|------|
| Prospective parents | Submit applications, receive confirmation, check status. |
| School admissions staff | Review applications, change status, manage seats, read inquiries. |
| IT / DevOps | Deploy to Vercel + Railway; configure secrets safely. |

## 2. Functional requirements

### 2.1 Public website

- **FR-1** Home page shall present school branding, hero, features, call-to-action, and a Bengaluru weather widget fed by the backend (`GET /api/weather`).
- **FR-2** Navigation shall link to Admission form, Application status, Contact, and Admin.

### 2.2 Admission application

- **FR-3** User shall submit an application with required and optional fields as specified in UAT / USER-MANUAL.
- **FR-4** Client shall validate required fields; empty required fields shall show **“This field is required”** (red).
- **FR-5** Parent email shall validate format; invalid format shall show **“Invalid email”**.
- **FR-6** Parent phone shall require at least 10 digits; otherwise **“Invalid phone”**.
- **FR-7** Pincode shall be exactly 6 digits; otherwise **“Invalid pincode”**.
- **FR-8** On success, UI shall show application number and AI welcome message in a modal, then clear the form.
- **FR-9** On API error, UI shall show an error notification and **preserve** form data.

### 2.3 Application status

- **FR-10** User shall enter application number and retrieve the corresponding admission record (lookup by application number).

### 2.4 Admin dashboard

- **FR-11** Admin shall authenticate with a fixed password (`admin123` for this release).
- **FR-12** Dashboard shall show summary cards: total, pending, approved, rejected, waitlisted.
- **FR-13** Dashboard shall list all classes with seat availability and allow updating **total seats** per class.
- **FR-14** Dashboard shall list admissions with search (name or application number), status filter, inline status change, delete with confirmation, and color-coded status badges.

### 2.5 Contact

- **FR-15** User shall submit name, email, message; data shall persist via `POST /api/contacts`.
- **FR-16** Admin shall view all contact submissions in a dedicated tab.

### 2.6 Backend API

- **FR-17** System shall expose documented REST endpoints (see DESIGN.md).
- **FR-18** Creating an admission shall reserve one seat for the selected class **atomically** if seats are available; otherwise return a conflict error.
- **FR-19** Deleting an admission shall restore one seat to the class that was applied for (if the row exists).
- **FR-20** On first startup with an empty `seats` table, system shall seed predefined classes and totals.

## 3. Non-functional requirements

### 3.1 Performance

- **NFR-1** Weather data shall be cached server-side for 30 minutes to limit outbound calls.

### 3.2 Security

- **NFR-2** No secrets in source control or `vercel.json`.
- **NFR-3** CORS shall allow the configured `FRONTEND_URL` (and local dev origins).

### 3.3 Reliability

- **NFR-4** If Azure OpenAI is unavailable or misconfigured, welcome message shall still be returned using a static template.

### 3.4 Maintainability

- **NFR-5** Backend shall use Pydantic v2, pydantic-settings, and async SQLAlchemy.
- **NFR-6** Frontend shall use TypeScript, React Router, Axios, Tailwind, React Hook Form, and Zod.

### 3.5 Data

- **NFR-7** Primary datastore shall be **MySQL only** (no MongoDB).

## 4. Assumptions

- Railway MySQL exposes a host reachable from Vercel serverless functions (typically public proxy hostname, not `*.internal` only).
- Azure OpenAI credentials are supplied via environment variables in production.

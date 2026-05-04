# USE CASES & USER STORIES — Greenwood International School

## Actors

- **Guest** — Unauthenticated visitor.
- **Parent** — Guest submitting or tracking an application.
- **Admin** — Staff using the dashboard after password login.

---

## UC-1: Browse school home page

**Actor:** Guest  
**Story:** As a visitor, I want to see the school’s value proposition and current Bengaluru weather so that I can decide to apply.

**Main flow**

1. Guest opens `/`.
2. System shows hero, features, CTA, weather widget.
3. Weather widget calls `GET /api/weather` and displays temperature and description.

**Alternate:** Weather API fails — show friendly error in widget.

---

## UC-2: Submit admission application

**Actor:** Parent  
**Story:** As a parent, I want to submit my child’s admission details with validation so that the school receives a complete application.

**Main flow**

1. Parent opens `/admission`.
2. Parent fills required and optional fields.
3. Parent submits form.
4. System validates; on failure shows red field errors per SRS.
5. System `POST /api/admissions` reserves seat and stores row.
6. System shows modal with application number and welcome message; clears form.

**Alternate:** No seats — API returns conflict; toast error; form unchanged.

**Alternate:** Network/server error — toast error; form unchanged.

---

## UC-3: Check application status

**Actor:** Parent  
**Story:** As a parent, I want to look up my application by number so that I know the current status.

**Main flow**

1. Parent opens `/status`.
2. Parent enters application number and submits.
3. System calls lookup API and displays student name, class, status, dates.

**Alternate:** Not found — show clear message.

---

## UC-4: Admin login

**Actor:** Admin  
**Story:** As staff, I want to log in with a password so that admissions data is not public.

**Main flow**

1. Admin opens `/admin`.
2. Admin enters password `admin123`.
3. System stores session (client) and shows dashboard.

**Alternate:** Wrong password — inline error.

---

## UC-5: Review and manage applications

**Actor:** Admin  
**Story:** As staff, I want to search, filter, change status, and delete applications.

**Main flow**

1. Admin views summary cards and admissions table.
2. Admin searches by name or application number.
3. Admin filters by status.
4. Admin changes status via dropdown; `PUT /api/admissions/{id}/status`.
5. Admin deletes row with confirmation; `DELETE /api/admissions/{id}` restores seat.

---

## UC-6: Manage class seats

**Actor:** Admin  
**Story:** As staff, I want to adjust total seats per class so that capacity matches policy.

**Main flow**

1. Admin views seats table.
2. Admin edits total seats for a class and saves.
3. System `PUT /api/seats/{class_name}` updates totals and recomputes availability.

---

## UC-7: Contact the school

**Actor:** Guest  
**Story:** As a visitor, I want to send a message so that the school can respond.

**Main flow**

1. Guest opens `/contact`, fills form, submits.
2. System `POST /api/contacts`.

---

## UC-8: Admin reads contact messages

**Actor:** Admin  
**Story:** As staff, I want to see all contact submissions in one place.

**Main flow**

1. Admin opens Contacts tab.
2. System `GET /api/contacts` and lists messages.


## Agent Instructions & Lessons Learned

### How to work with me
- I am a beginner — always explain things in simple English
- Always plan before building
- Always review your own code after building
- Update this file after every project with new lessons learned

### Rules
- Always check review-checklist.md before finishing any task
- If something can go wrong, add error handling for it
- Keep code simple — do not over-engineer

### Lessons Learned
- For landing pages, separate structure, styles, and scripts into dedicated files for easier maintenance.
- Add client-side validation and clear status/error messages for every contact form so users always know what happened.
- Build mobile-first navigation behavior (toggle menu + smooth section navigation) to keep single-page sites easy to use on phones.
- For todo apps, keep task state in one array and re-render from that single source of truth after every action.
- Wrap localStorage read/write in try-catch so app behavior remains stable even when storage fails.
- Use event delegation on the task list to handle complete/edit/delete actions reliably for dynamic items.
- For API apps, never hardcode secrets; collect API keys from users and store locally with clear status feedback.
- Always map common API/network failure codes to beginner-friendly error messages so users know exactly what to fix.
- Show and hide a loading state around async fetch calls to prevent duplicate actions and improve user experience.
- For auth UIs, store only non-sensitive data like remembered email and never persist passwords.
- Use centralized validation helpers and field-level errors so each rule failure is explained clearly.
- Add temporary lockout with countdown after repeated failed login attempts to reduce brute-force attempts in demo auth flows.
- For quiz apps, keep timer state and answer history in dedicated variables so per-question countdown, score tracking, and final correct/wrong breakdown stay accurate and easy to maintain.
- For coffee shop landing pages, use a dark warm color system, mobile-first responsive layouts, and strong section spacing to keep the design elegant and readable across all screen sizes.
- For contact forms on static pages, combine input sanitization, field-level validation, and clear success/error status text so users always understand what happened after submit.
- For personal portfolio websites, keep a clean white minimal theme with clear hierarchy, concise project highlights, and a responsive section flow (hero, skills, projects, contact).
- For restaurant websites, use warm accent colors with a dark backdrop, include visible pricing on menu cards, and validate reservation forms with date and guest limits for a smoother booking flow.
- For gym websites, use a high-contrast dark theme with bold red accents, include full section structure (plans, trainers, schedule, gallery, join form), and validate join forms with clear field-level feedback.
- For full-stack school websites, keep admissions and seat APIs resilient with a MongoDB-first approach plus safe fallback handling, and mirror admin actions (approve/reject/delete/export) clearly in a responsive dashboard.
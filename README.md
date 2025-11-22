# TinyLink – URL Shortener (Take-Home Assignment)

**Live Demo:** https://tinylink-frontend.vercel.app  
**GitHub (Frontend):**  https://github.com/shubham-masai/TinyLink
**GitHub (Backend):**  https://github.com/shubham-masai/TinyLinkBackend  

---

### 100% Assignment Compliant Features

| Requirement                                 | Status | Notes |
|---------------------------------------------|--------|-------|
| Dashboard at `/`                            | Done   | Create + List + Delete |
| Stats page at `/code/:code`                 | Done   | Detailed click stats |
| Redirect at `/:code` → 302 + click count    | Done   | Increments totalClicks & lastClickedAt |
| Health check `/healthz`                     | Done   | Returns `{ "ok": true, "version": "1.0" }` |
| API endpoints exactly as specified          | Done   | `POST /api/links`, `GET /api/links`, etc. |
| Custom short code (6–8 alphanumeric)       | Done   | Optional, globally unique, 409 on conflict |
| Form validation & inline errors             | Done   | URL format, code length, duplicate check |
| Copy short link button                      | Done   | Copies full URL (e.g. `https://yoursite.com/abc123`) |
| Loading / Empty / Error states              | Done   | All handled with UI feedback |
| Responsive design                           | Done   | Mobile-first, table scrolls horizontally |
| Professional modern UI (glassmorphism)      | Done   | Clean, gradients, toast notifications |
| Delete with confirmation                    | Done   | Browser confirm + toast |

---

### Tech Stack

- **Frontend:** Next.js + React + Tailwind CSS
- **Backend:** Node.js + Express + Sequelize
- **Database:** PostgreSQL (Neon.tech free tier)
- **Hosting:** Vercel

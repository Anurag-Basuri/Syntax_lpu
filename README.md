# Syntax Club — Full Stack Platform (Complete, Improved README)

This file documents the Syntax_Club repository (client + server). It is written for developers and maintainers: architecture, data flows, code structure, setup, environment, debugging, deployment, and recommended improvements.

> Quick links

- Frontend root: [client/package.json](client/package.json) — frontend scripts & deps
- Backend root: [server/package.json](server/package.json) — server scripts & deps
- Frontend entry: [client/src/main.jsx](client/src/main.jsx)
- Backend entry: [server/src/server.js](server/src/server.js) and [server/src/app.js](server/src/app.js)

Table of contents

- Project summary
- High-level architecture
- Tech stack
- Repository layout (what to open first)
- Key files & symbols (read these)
- Local development (quickstart)
- Environment variables (examples)
- API reference (essential endpoints)
- Data models & media handling
- Frontend UI notes and bug fixes (including lightbox fix)
- Production & deployment checklist
- Testing, linting & CI recommendations
- Contributing & extension guidelines
- Troubleshooting & common gotchas

---

## Project summary

Syntax Club is a production-focused full-stack app to manage club operations and run the annual tech festival "Arvantis". It includes:

- Public landing and festival editions
- Admin dashboard to create/edit festival editions, events, media, partners, FAQs
- Ticketing & payments integrations
- Robust media pipeline (uploads → Cloudinary → normalized DB objects)

---

## High-level architecture

- Frontend: React SPA built with Vite that consumes a REST API.
  - App bootstrap: [client/src/main.jsx](client/src/main.jsx)
  - Global styles and tokens: [client/src/index.css](client/src/index.css) and [client/src/arvantis.css](client/src/arvantis.css)
- Backend: Express + Node.js API persists to MongoDB via Mongoose.
  - Server bootstrap: [server/src/server.js](server/src/server.js)
  - App wiring: [server/src/app.js](server/src/app.js)

Communication: frontend calls endpoints implemented in route files under [server/src/routes](server/src/routes). Core Arvantis endpoints are in [server/src/routes/arvantis.routes.js](server/src/routes/arvantis.routes.js).

---

## Tech stack

Frontend

- React (functional components & hooks)
- Vite for dev/build
- Tailwind CSS + scoped CSS files
- Axios clients: [client/src/services/api.js](client/src/services/api.js)
- Framer Motion for animations
- React.lazy + Suspense for heavy UI (lightbox)
- Optional usage of React Query for caching in some components (see usage in `EventsGrid`)

Backend

- Node.js (>=18), Express
- MongoDB via Mongoose
- Multer for uploads + Cloudinary helper
- Authentication with JWT (middleware)
- Utilities: asyncHandler, ApiError, ApiResponse

Dev / Tooling

- ESLint, Prettier
- Nodemon for server dev
- Suggested: Docker for production packaging

---

## Repository layout (what to open first)

Root

- [README.md](README.md)
- [VPS_DEPLOYMENT_GUIDE.md](VPS_DEPLOYMENT_GUIDE.md)

Client (frontend)

- [client/index.html](client/index.html)
- [client/src/main.jsx](client/src/main.jsx)
- Key pages: [client/src/pages/arvantis/arvantis.jsx](client/src/pages/arvantis/arvantis.jsx)
- Arvantis UI: [client/src/components/Arvantis](client/src/components/Arvantis)
  - Lightbox: [client/src/components/Arvantis/ImageLightbox.jsx](client/src/components/Arvantis/ImageLightbox.jsx)
  - Events grid: [client/src/components/Arvantis/EventsGrid.jsx](client/src/components/Arvantis/EventsGrid.jsx)
  - Poster hero: [client/src/components/Arvantis/PosterHero.jsx](client/src/components/Arvantis/PosterHero.jsx)
  - Gallery: [client/src/components/Arvantis/GalleryGrid.jsx](client/src/components/Arvantis/GalleryGrid.jsx)
- Styling: [client/src/index.css](client/src/index.css) and [client/src/arvantis.css](client/src/arvantis.css)
- Services: [client/src/services/arvantisServices.js](client/src/services/arvantisServices.js), [client/src/services/eventServices.js](client/src/services/eventServices.js)

Server (backend)

- App & server: [server/src/app.js](server/src/app.js), [server/src/server.js](server/src/server.js)
- Routes: [server/src/routes/arvantis.routes.js](server/src/routes/arvantis.routes.js)
- Controller: [server/src/controllers/arvantis.controller.js](server/src/controllers/arvantis.controller.js)
- Models: [server/src/models/arvantis.model.js](server/src/models/arvantis.model.js), [server/src/models/event.model.js](server/src/models/event.model.js)
- Middleware: [server/src/middlewares/multer.middleware.js](server/src/middlewares/multer.middleware.js), [server/src/middlewares/auth.middleware.js](server/src/middlewares/auth.middleware.js)
- Utils: [server/src/utils/cloudinary.js](server/src/utils/cloudinary.js), [server/src/utils/arvantisMedia.js](server/src/utils/arvantisMedia.js), [server/src/utils/ApiError.js](server/src/utils/ApiError.js), [server/src/utils/asyncHandler.js](server/src/utils/asyncHandler.js)

---

## Key files & symbols (read these first)

Frontend

- [`getArvantisLandingData`](client/src/services/arvantisServices.js) — fetch landing data
- [`getFestDetails`](client/src/services/arvantisServices.js) — fetch a fest by slug/year
- [`getEventById`](client/src/services/eventServices.js) — used by event tiles for lazy fetch
- [`ImageLightbox` component](client/src/components/Arvantis/ImageLightbox.jsx) — fullscreen viewer (see Lightbox fix below)
- [`EventsGrid` component](client/src/components/Arvantis/EventsGrid.jsx) — event cards & poster resolution logic

Server

- [`getLatestFest`](server/src/controllers/arvantis.controller.js) — landing endpoint implementation
- [`arvantis.model`](server/src/models/arvantis.model.js) — data schema for festival
- [`event.model`](server/src/models/event.model.js) — event & media sub-schema (includes `mediaSchema` URL validation)
- [`cloudinary` util](server/src/utils/cloudinary.js) and [`arvantisMedia.normalize`](server/src/utils/arvantisMedia.js) — how uploaded files are normalized

(Click the links above to open files in the workspace.)

---

## Local development — quickstart

Prereqs:

- Node.js 18+ (LTS)
- MongoDB (local or Atlas)
- Optional: Cloudinary account for media

Install dependencies:

```bash
# server
cd server
npm install

# client
cd ../client
npm install
```

Run in development (two terminals):

```bash
# Terminal 1: server
cd server
npm run dev   # nodemon or equivalent

# Terminal 2: client
cd client
npm run dev   # vite dev server
```

Build & preview production bundle:

```bash
# frontend
cd client
npm run build
npm run preview

# server
cd ../server
NODE_ENV=production npm start
```

See scripts: [client/package.json](client/package.json) and [server/package.json](server/package.json).

---

## Environment variables (examples)

server/.env (example)

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/syntax_club
JWT_SECRET=change_this_to_a_secure_random_string
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

client/.env (example)

```
VITE_API_BASE=http://localhost:5000/api/v1
VITE_SENTRY_DSN=   # optional
```

Never commit real secrets. Keep `.env` in `.gitignore`.

---

## API reference — essential endpoints

Base URL is the `VITE_API_BASE` used by frontend services.

Public

- GET /arvantis/landing → implemented by [`getLatestFest`](server/src/controllers/arvantis.controller.js)
- GET /arvantis → list editions (pagination support)
- GET /arvantis/:identifier → fest details by slug or year

Admin (requires Authorization header)

- POST /arvantis → create fest
- PATCH /arvantis/:identifier/update → update fest metadata
- PATCH /arvantis/:identifier/posters → upload posters (multipart)
- PATCH /arvantis/:identifier/hero → upload hero image (multipart)
- POST /arvantis/:identifier/gallery → add gallery media
- DELETE /arvantis/:identifier/gallery/:publicId → remove gallery item
- GET /arvantis/export/csv → download CSV export
- GET /arvantis/analytics/overview → analytics endpoint

See route wiring: [server/src/routes/arvantis.routes.js](server/src/routes/arvantis.routes.js) and service wrappers: [`client/src/services/arvantisServices.js`](client/src/services/arvantisServices.js).

---

## Data models & media handling

Main models:

- Fest (`arvantis.model`): `name`, `slug`, `year`, `startDate`, `endDate`, `location`, `media` (hero, posters, gallery), `partners`, `faqs`, `prizes`, `guests`, etc. See: [server/src/models/arvantis.model.js](server/src/models/arvantis.model.js)
- Event (`event.model`): title, description, eventDate, location, media (poster/gallery). See: [server/src/models/event.model.js](server/src/models/event.model.js) — includes `mediaSchema` with URL validation.

Upload flow:

1. Client builds FormData and calls admin endpoint (services in [client/src/services/arvantisServices.js](client/src/services/arvantisServices.js)).
2. Server multer middleware ([server/src/middlewares/multer.middleware.js](server/src/middlewares/multer.middleware.js)) handles files and forwards to Cloudinary util ([server/src/utils/cloudinary.js](server/src/utils/cloudinary.js)).
3. Cloudinary response is normalized via [server/src/utils/arvantisMedia.js](server/src/utils/arvantisMedia.js) and stored in MongoDB.

Recommendations:

- Use Cloudinary transformations for optimal sizes and formats.
- Store both CDN URL and minimal provider metadata to allow safe deletion and reprocessing.

---

## Frontend UI notes and bug fixes

Notable UI components:

- Poster & hero: [client/src/components/Arvantis/PosterHero.jsx](client/src/components/Arvantis/PosterHero.jsx)
- Events grid uses progressive fetch and robust media resolution: [client/src/components/Arvantis/EventsGrid.jsx](client/src/components/Arvantis/EventsGrid.jsx)
- Gallery grid: [client/src/components/Arvantis/GalleryGrid.jsx](client/src/components/Arvantis/GalleryGrid.jsx)
- Lightbox: [client/src/components/Arvantis/ImageLightbox.jsx](client/src/components/Arvantis/ImageLightbox.jsx)

Lightbox scroll bug (fix)

- Symptom: opened lightbox is attached to page flow and scrolls with page.
- Root cause: lightbox mounted inside page DOM tree and/or lacks fixed positioning and body scroll prevention.
- Fix (recommended):
  1. Mount `ImageLightbox` using a React portal to `document.body`. Use `createPortal` from `react-dom`.
  2. Ensure top-level lightbox wrapper uses CSS:
     - `position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 9999;`
     - backdrop with `background: rgba(0,0,0,0.6);`
  3. When opening, prevent body scroll:
     - `document.body.style.overflow = 'hidden'` on mount
     - restore on unmount
  4. Ensure keyboard handlers (Esc, arrows) and `aria-modal="true"` for accessibility.

Files to update for this change:

- [client/src/components/Arvantis/ImageLightbox.jsx](client/src/components/Arvantis/ImageLightbox.jsx) — convert to portal & add scroll lock
- Components that open the lightbox: [client/src/components/Arvantis/GalleryGrid.jsx](client/src/components/Arvantis/GalleryGrid.jsx) and [client/src/components/Arvantis/PosterHero.jsx](client/src/components/Arvantis/PosterHero.jsx)

If you want, I can produce the exact patch to `ImageLightbox.jsx` that:

- wraps content in `createPortal(...)`
- adds scroll-lock on mount/unmount
- adds fixed styling and keyboard navigation

---

## Production & deployment checklist

- Build frontend with `npm run build` (client), serve static assets behind CDN or Nginx.
- Server: run behind process manager (PM2) or container; connect to managed MongoDB (Atlas) for reliability.
- Use environment-specific Cloudinary credentials; keep secrets out of repo.
- Set proper CORS origins and rate limiting.
- Add monitoring & error tracking (Sentry) and health checks.
- Backup strategy for MongoDB and media provider.

Example Docker flow:

- Build `client` assets in CI and copy into an `nginx` container.
- Run API server in Node container with envs and link to MongoDB.

---

## Testing, linting & CI

- Add unit tests for controllers (Jest + Supertest).
- Add unit & integration tests for critical frontend components (React Testing Library).
- CI pipeline should run: lint -> unit tests -> build.
- Add pre-commit hooks (husky) to run lint and simple tests locally.

---

## Contributing & extension guidelines

- Use existing ESLint/Prettier configs. Run lint and format before pushing.
- Keep commits atomic and descriptive. Use PRs with clear descriptions and testing notes.
- Document new API endpoints in this README and add integration tests.
- Review DB migrations when changing Mongoose schemas.

---

## Troubleshooting & common gotchas

- 401/403: validate token issuance and that apiClient attaches Authorization header (client/src/services/api.js).
- Upload fails: check multer limits in server/src/middlewares/multer.middleware.js and Cloudinary credentials.
- Lightbox scrolling: mount ImageLightbox via a React portal; set document.body.style.overflow = 'hidden' while open.
- Mongoose validation errors: controller error handler returns ApiError with details — inspect server logs & response payload.

---

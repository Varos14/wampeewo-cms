# Competency CMS Backend (Express + TypeScript)

## Prerequisites
- Node.js 18+
- MySQL (or run via Docker Compose)

## Environment
Copy/adjust:
- `.env`

Key vars:
- `PORT`
- `JWT_SECRET`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

## Start MySQL
```bash
docker compose up -d
```

## Install & Run
```bash
cd competency-cms-backend
npm install
npm run dev
```

## API (current skeleton)
Base routes will be wired under `/api/*`:
- `/api/auth/*`
- `/api/aoi/*`
- `/api/submissions/*`
- `/api/notes/*`
- `/api/skills/*`
- `/api/attendance/*`

Controllers/methods currently return placeholder JSON responses (suitable for wiring the frontend).

# Academy Angular Frontend

A simple Angular SPA that consumes the existing FastAPI backend and preserves the same features (courses, programs, ...).

## Prerequisites
- Node.js 18+

## Install
```bash
npm install
```

## Run (dev)
```bash
npm start
```
- App runs at: http://localhost:4200
- Backend expected at: http://localhost:8000 (configurable via `src/environments/environment.ts`)

## Build (prod)
```bash
npm run build
```
Artifacts in `dist/academy-angular`.

## Configure API base URL
- Dev: `src/environments/environment.ts`
- Prod: `src/environments/environment.prod.ts`

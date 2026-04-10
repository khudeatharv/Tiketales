# TicketTales (pg + Express + Vite)

This project now uses **node-postgres (`pg`)** only (Prisma removed).

## Environment variables

```bash
VITE_API_URL=https://your-vercel-project.vercel.app
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_EMAILS=atharv1441@admin.com
ADMIN_USERNAME=atharv1441
ADMIN_EMAIL=atharv1441@admin.com
ADMIN_PASSWORD=admin123
CORS_ORIGINS=https://your-vercel-project.vercel.app,http://localhost:3000
PORT=3000
```

## Database setup

Schema file: `db/schema.sql`

Initialize DB + ensure admin user exists:

```bash
npm run db:init
```

## Vercel notes

- API runs via serverless function: `api/[...all].ts`
- `vercel.json` keeps filesystem routes first, then SPA fallback.
- In production, backend uses SSL for PostgreSQL automatically.

## Admin login

- Username: `atharv1441`
- Email: `atharv1441@admin.com`
- Password: `admin123`

## Local run

```bash
npm install
npm run db:init
npm run dev
```

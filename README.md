# TicketTales (BookMyShow-like)

Production-ready setup for:
- **Frontend:** Vite + React
- **Backend:** Express (served locally or via Vercel serverless `/api`)
- **Database:** PostgreSQL + Prisma
- **Auth:** JWT bearer token

## 1) Required environment variables

### Frontend (`.env`)
```bash
VITE_API_URL=https://your-vercel-project.vercel.app/api
VITE_AUTH_ORIGIN=https://your-vercel-project.vercel.app
```

### Backend (`.env`)
```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_EMAILS=atharv1441@admin.com
CORS_ORIGINS=https://your-vercel-project.vercel.app,http://localhost:3000
PORT=3000
```

> `VITE_API_URL` must point to your deployed backend URL. Never use `localhost` in production.

## 2) Vercel setup

1. Open **Vercel Dashboard → Project → Settings → Environment Variables**.
2. Add all variables above for **Production** (and Preview if needed).
3. Redeploy the project.

The repository includes `vercel.json` with:
- build output: `dist`
- API handled by Vercel catch-all function: `api/[...all].ts`
- SPA rewrite: all routes to `/index.html`

## 3) Prisma database setup

Run locally (or in CI once with production DB URL):

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

This creates tables and inserts sample movies.

## 4) Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.


## Admin default credentials

After running `npm run prisma:seed`, use:
- Username: `atharv1441`
- Email: `atharv1441@admin.com`
- Password: `admin123`

## 5) Admin and user flow

- Register admin with email listed in `ADMIN_EMAILS`.
- Admin can open `/admin` and manage users/movies/bookings.
- New normal users are created as `pending` and must be approved by admin.

## 6) Production smoke test checklist

1. Open deployed site URL.
2. Register normal user.
3. Login as admin.
4. Approve normal user from admin panel.
5. Add movie from admin panel.
6. Login as normal user and verify movie list is visible.
7. Book tickets and verify booking appears in user + admin bookings.


## Admin login troubleshooting

If admin login shows generic failure:
1. Verify Vercel envs (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAILS`, `VITE_API_URL`).
2. Run `npm run prisma:push && npm run prisma:seed` against production DB.
3. Check `https://<your-domain>/api/health` returns JSON.
4. Use username `atharv1441` or email `atharv1441@admin.com` with password `admin123`.

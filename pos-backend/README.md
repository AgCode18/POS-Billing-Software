# POS Billing Backend (Express + Prisma + MySQL)

```bash
npm install
cp .env.example .env        # fill DATABASE_URL, JWT_SECRET
npx prisma migrate dev --name init
npm run seed                # creates the Super Admin
npm run dev
```

## Isolation rule
Every admin-side query MUST filter by `adminId: req.tenantId`.
`tenantId` is derived from the JWT user, never from request body/params.

## API
| Method | Route | Role |
|---|---|---|
| POST | /api/auth/login | public |
| GET | /api/auth/me | any |
| POST/GET | /api/super/admins | SUPER_ADMIN |
| PATCH | /api/super/admins/:id | SUPER_ADMIN |
| GET | /api/super/overview, /activity, /admins/:id/invoices | SUPER_ADMIN |
| GET/POST/PATCH | /api/products | ADMIN |
| POST/GET | /api/invoices | ADMIN |
| GET | /api/dashboard/stats | ADMIN |

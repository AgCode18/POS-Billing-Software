# POS Billing System (Super Admin + Admin)

pos-backend  -> Express + Prisma (MySQL)
pos-frontend -> Next.js 14 (App Router, JavaScript) + Tailwind CSS

## Run
Backend:
  cd pos-backend && npm install && cp .env.example .env   (set DATABASE_URL, JWT_SECRET)
  npx prisma migrate dev --name init && npm run seed && npm run dev      # :5000

Frontend:
  cd pos-frontend && npm install && cp .env.local.example .env.local
  npm run dev                                                            # :3000

Super Admin login = SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD from backend .env  -> /super
Create an Admin there, share the credentials -> admin logs in -> /dashboard

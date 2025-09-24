# Multi-Tenant Notes SaaS (Next.js + Prisma + PostgreSQL) — Deployable to Vercel

## Overview
This is a multi-tenant notes application with role-based access and subscription gating. Two tenants are pre-seeded: **Acme** and **Globex**.

Features:
- JWT auth (login endpoint returns JWT)
- Roles: Admin & Member
  - Admin: can invite users and upgrade subscription
  - Member: create, read, update, delete notes within tenant
- Subscription gating:
  - Free plan: tenant limited to **3 notes**
  - Pro plan: unlimited notes
  - Admins can upgrade via `POST /api/tenants/:slug/upgrade`
- Tenant isolation: strict (no cross-tenant access)
- Health endpoint: `GET /api/health` → `{ "status": "ok" }`
- Minimal frontend (login, list/create/delete notes, Upgrade button)
- Hosted on Vercel (both frontend and backend as Next.js app)

## Multi-tenancy approach
**Shared schema with tenantId column.**
Rationale:
- Simpler to implement and deploy on a single Postgres instance.
- Works well for small-to-medium SaaS and is easy to seed/test.
- Tenant isolation enforced at application level: every query filters by `tenantId`, and JWTs contain `tenantId`.

## Pre-seeded test accounts (password = `password`)
- admin@acme.test (Admin, tenant: acme)
- user@acme.test  (Member, tenant: acme)
- admin@globex.test (Admin, tenant: globex)
- user@globex.test  (Member, tenant: globex)

## Endpoints (main)
- `POST /api/auth/login` — body: `{ email, password }` → `{ token }`
- `GET /api/health` → `{ status: "ok" }`
- `POST /api/tenants/:slug/upgrade` — Admin only
- Notes CRUD:
  - `POST /api/notes`
  - `GET /api/notes`
  - `GET /api/notes/:id`
  - `PUT /api/notes/:id`
  - `DELETE /api/notes/:id`

## Deployment
1. Provision a Postgres database (Supabase or any Postgres).
2. Set environment variables (see `.env.example`).
3. `npx prisma migrate deploy` then seed: `node prisma/seed.js`
4. Deploy the Next.js app to Vercel (both frontend & serverless functions are in same app).

See below for detailed setup and the code files.

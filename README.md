# Kootenwaye Tours

Site for Edgar — a monolithic web application for a tour-guide business.
TypeScript + React (Next.js) frontend and API, PostgreSQL for data, Docker
for packaging, targeting a Civo Kubernetes cluster in production.

See [`CONTEXT.md`](CONTEXT.md) and [`planning-design/`](planning-design/)
for the design and architecture behind this project.

## Quickstart (local development)

Requires Node.js 22+ and Docker.

```bash
npm install
cp .env.example .env

npm run db:up        # starts Postgres via docker compose, waits for it to be healthy
npm run db:migrate    # applies Prisma migrations
npm run db:seed       # seeds an admin user, sample tours, blog posts, and gallery photos

npm run dev            # http://localhost:3000
```

Everything after `npm run db:up` only needs to be re-run when the schema or
seed data changes. Day to day, `npm run dev` is all you need once the
database is up.

### Other scripts

| Script | Purpose |
| --- | --- |
| `npm run build` / `npm run start` | Production build and start (mirrors what the Docker image runs) |
| `npm run lint` / `npm run typecheck` | Lint and type-check |
| `npm run db:down` | Stop the local Postgres container |
| `npm run db:reset` | Drop and recreate the local database, then reseed |

### What's seeded

The seed script creates 6 sample tours, 3 journal posts, a 10-photo gallery,
and one admin account (`admin@kootenwayetours.com` / `ChangeMe123!` —
**dev-only**, not wired to a login screen yet). All sample photography is
placeholder illustration, not real photos — see
[`public/sample-images/README.md`](public/sample-images/README.md).

## Status

No admin UI, authentication, or image upload pipeline yet — this is the
public-facing site plus the underlying data layer. See `CONTEXT.md` for
what's next.

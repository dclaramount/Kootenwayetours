# Project context

Kootenwayetours is a monolithic web application for a tour-guide business: a
public marketing site (tours, blog, gallery, contact/enquiry) plus an
authenticated admin area for managing that content. TypeScript throughout,
React frontend, backend API in the same deployable, PostgreSQL for data,
Docker image, target production environment is a Civo Kubernetes cluster.

No application code exists yet — the project is currently in the research
and design phase.

## Planning & design

Design and architecture proposals live in [`planning-design/`](planning-design/),
one file per iteration so the design history stays visible instead of being
overwritten in place.

- **Iteration 1** — [`planning-design/iteration-1-tour-platform-blueprint.html`](planning-design/iteration-1-tour-platform-blueprint.html)
  Initial proposal: review of [cenotescasatortuga.com](https://www.cenotescasatortuga.com/)
  as inspiration (not to be copied), proposed sitemap, visual direction,
  technical architecture (Next.js + TypeScript + Prisma/PostgreSQL), a
  preliminary data model, an image upload/optimization strategy sized to a
  5 GiB storage budget, local-dev setup, Docker/GitHub Actions/Civo K8s plan,
  and a phased implementation plan (P1–P8).
  **Status:** awaiting approval. Open decisions flagged in §13 of the
  document: online booking/payment scope, site language, transactional email
  provider, and domain/cluster sizing.

When a new iteration changes the proposal materially, add a new
`iteration-N-*` file rather than editing a previous one, and update this
section to point at the current iteration.

## Working agreement

- Do not start implementation until a design iteration has been explicitly
  approved.
- Keep this file's "Planning & design" section current as iterations land —
  it's the entry point for anyone (human or agent) picking up the project.

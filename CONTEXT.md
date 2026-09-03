# Project context

Kootenwayetours is a monolithic web application for a tour-guide business: a
public marketing site (tours, blog, gallery, contact/enquiry) plus an
authenticated admin area for managing that content. TypeScript throughout,
React frontend (Next.js App Router), backend API in the same deployable,
PostgreSQL for data, Docker image, target production environment is a Civo
Kubernetes cluster.

## Current state

- **App scaffold**: built and running locally (`npm run dev`) — public
  pages (home, tours, tour detail, journal, gallery, about, contact) backed
  by Prisma/PostgreSQL, seeded with sample content. No admin UI, auth, or
  image upload pipeline yet. See the root [`README.md`](README.md) for the
  local quickstart.
- **Infrastructure**: Kubernetes manifests for the Civo cluster live in
  [`infra/k8s/`](infra/k8s/) (namespace, Postgres StatefulSet, app
  Deployment, PVCs, Ingress). **Not yet applied to the cluster** — see that
  directory's README for prerequisites and the deploy steps.
- **Cluster access**: the Civo cluster kubeconfig has been merged into the
  local multi-cluster kubeconfig (`~/Documents/civo-main-node-kubeconfig`,
  referenced via `$KUBECONFIG`) as context `main-cluster-civo`. That context
  currently points at Civo's `testing-cluster` (single small k3s node) —
  worth confirming whether this project should eventually move to a
  dedicated cluster before real traffic lands on it.
- **CI**: no GitHub Actions pipeline yet (build/validate the Docker image).

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
  and a phased implementation plan (P1–P8). The app scaffold and infra
  manifests above follow this proposal directly.
  **Open questions** (§13 of the document, still unresolved): online
  booking/payment scope, site language, transactional email provider, and
  the real domain name.

When a new iteration changes the proposal materially, add a new
`iteration-N-*` file rather than editing a previous one, and update this
section to point at the current iteration.

## Working agreement

- Keep this file current as the project moves — it's the entry point for
  anyone (human or agent) picking up the project.
- Nothing gets applied to the live cluster or pushed to a registry without
  it being called out explicitly — see `infra/k8s/README.md`.

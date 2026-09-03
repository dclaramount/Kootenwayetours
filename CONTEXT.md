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
- **Live**: `https://kootenwayetours.com` is deployed and serving real
  traffic on the Civo cluster — Postgres, the migrated (but empty, no seed
  data) database, and the app Deployment are all applied and healthy.
  Manifests live in [`infra/k8s/`](infra/k8s/); see that directory's README
  ("Deployed state") for exactly what was involved, including two real
  bugs (a Prisma engine architecture mismatch, probe timeouts too tight
  for this node) that only surfaced by checking actual pod behavior on the
  cluster, not by trusting `kubectl apply` succeeding.
- **Domain**: `kootenwayetours.com`, registered, DNS on Cloudflare
  (proxied, pointing at the node's IP, Full-strict TLS). TLS is a
  Cloudflare Origin CA cert installed as a cluster Secret — chosen over
  cert-manager specifically to avoid running extra pods on this cluster's
  very small node (1 vCPU / ~940Mi).
- **Cluster access**: the Civo cluster kubeconfig has been merged into the
  local multi-cluster kubeconfig (`~/Documents/civo-main-node-kubeconfig`,
  referenced via `$KUBECONFIG`) as context `main-cluster-civo`. That context
  currently points at Civo's `testing-cluster` (single small k3s node) —
  worth confirming whether this project should eventually move to a
  dedicated cluster before real traffic lands on it.
- **CI**: `.github/workflows/ci.yml` typechecks, lints, and builds/pushes
  the Docker image to `ghcr.io/dclaramount/kootenwayetours` on pushes to
  `main`, using GitHub's own token.

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
  booking/payment scope, site language, transactional email provider.
  (Domain name is resolved — see "Current state" above.)

When a new iteration changes the proposal materially, add a new
`iteration-N-*` file rather than editing a previous one, and update this
section to point at the current iteration.

## Working agreement

- Keep this file current as the project moves — it's the entry point for
  anyone (human or agent) picking up the project.
- Nothing gets applied to the live cluster or pushed to a registry without
  it being called out explicitly — see `infra/k8s/README.md`.

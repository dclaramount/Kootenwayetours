# Kubernetes manifests

Manifests for deploying Kootenwaye Tours to the Civo cluster, per
[`planning-design/iteration-1`](../../planning-design/iteration-1-tour-platform-blueprint.html)
§11. Kept as plain Kustomize (a `kustomization.yaml` plus one file per
resource) — no overlays yet, since there's currently one environment.

**Live**: `https://kootenwayetours.com` is up and serving real traffic —
Postgres, the migrated (but empty — no seed data) database, and the app
Deployment are all applied and healthy. See "Deployed state" below for
exactly what that involved and two real bugs found only by actually
checking behavior end-to-end rather than trusting `kubectl apply` succeeding.

## Cluster context

Local kubeconfig context: **`main-cluster-civo`**
(`kubectl config use-context main-cluster-civo`).

Worth knowing before deploying:

- This is currently Civo's **`testing-cluster`** cluster (single k3s node,
  **1 vCPU / ~940Mi memory**, `civo-volume` as the default StorageClass).
  Resource requests/limits below are sized conservatively for that — raise
  them if this moves to a dedicated/larger cluster.
- **Traefik** is already running (k3s default) — `ingress.yaml` targets it
  via `ingressClassName: traefik`.
- **Domain: `kootenwayetours.com`**, registered and on Cloudflare DNS. `A`
  records for `@` and `www` point at the node's IP (`74.220.26.46`,
  proxied through Cloudflare) — see "Cluster networking" below for why the
  node IP directly, and the tradeoff involved.
- **TLS: Cloudflare Origin CA cert**, not cert-manager — decided on cost
  grounds (cert-manager's controller/webhook/cainjector pods aren't free on
  this small a node; Origin CA needs zero cluster resources). **Done**: the
  cert/key were generated in Cloudflare and installed as the
  `kootenwayetours-tls` Secret imperatively (never committed to this
  repo — see step 2 below for the same command if it ever needs
  recreating). Cloudflare's SSL/TLS mode is set to **Full (strict)** and
  verified working: `https://kootenwayetours.com` presents a valid public
  cert to visitors and reaches Traefik correctly.
- **`cluster/traefik-ingressclass.yaml` — applied, and required.** This
  cluster's Traefik was installed without ever registering an
  `IngressClass` object, so any Ingress with `ingressClassName: traefik`
  (ours included) went completely unmatched and silently fell back to
  Traefik's self-signed default cert — no error anywhere, just the wrong
  cert. Found this by actually checking what cert got served
  (`openssl s_client`), not by assuming the apply succeeding meant it
  worked. If this ever needs recreating (e.g. cluster rebuild), reapply it
  before expecting `ingress.yaml`'s TLS to take effect.

## Cluster networking

**Cost-saving decision (2026-09-03):** skip the dedicated Civo Load
Balancer for now and serve traffic directly off the node's own public IP —
**`74.220.26.46`** — since Traefik already runs as a `hostNetwork`
DaemonSet bound to ports 80/443 on it. Point the domain's DNS A record
there. This avoids the Load Balancer's ~$10.86/month while there's no real
production traffic yet.

The tradeoff: the node IP is tied to *this specific node*. It changes if
the node is resized, rebuilt, or replaced after a failure — the Load
Balancer's IP wouldn't. If that happens, DNS needs to be repointed at the
new node IP before the site is reachable again. Two ways to handle that
when it matters more than it does today:

- **Bring the Load Balancer back** — `cluster/traefik-loadbalancer.yaml`
  is written and validated, just not applied:
  ```bash
  kubectl --context main-cluster-civo apply -f infra/k8s/cluster/traefik-loadbalancer.yaml
  ```
  Civo's Cloud Controller Manager (`civo-ccm`, already running on the
  cluster) provisions a dedicated Load Balancer automatically — no manual
  Civo dashboard steps. Point DNS at whichever IP it's assigned
  (`kubectl get svc traefik-lb -n kube-system`), then tear it down the same
  way (`kubectl delete -f ...`) if it's ever not needed again.
- **Detect + auto-update DNS** — an UptimeRobot check (or similar) against
  the site, wired to a webhook that looks up the node's current IP and
  updates the DNS provider's A record when it changes. Cheaper than the LB,
  but not equivalent: there's a real outage window each time the IP
  changes — the monitor's check interval, plus however long the automation
  takes to react, plus DNS TTL propagation (keep the TTL low, e.g. 60s, if
  going this route) — realistically a few minutes, versus none with the
  Load Balancer. Not built yet; ask if you want this wired up.

This is cluster-level platform infra (lives in `kube-system`, shared by
whatever's deployed), separate from the app manifests below and not part
of `kustomization.yaml`.

## What's here

| File | Purpose |
| --- | --- |
| `cluster/traefik-loadbalancer.yaml` | Dedicated public IP, currently **not applied** — see "Cluster networking" |
| `cluster/traefik-ingressclass.yaml` | **Applied.** Missing cluster plumbing Traefik needed to match any Ingress at all — see "Cluster context" |
| `namespace.yaml` | **Applied.** `kootenwayetours` namespace |
| `configmap.yaml` | **Applied.** Non-secret app config (`NODE_ENV`, `UPLOAD_DIR`, ...) |
| `secret.example.yaml` | **Template only** — shows the Secret's shape, not meant to be applied. The real one was created imperatively (see "Deployed state") |
| `postgres-statefulset.yaml` / `postgres-service.yaml` | **Applied.** In-cluster Postgres, its own 2Gi PVC |
| `app-deployment.yaml` / `app-service.yaml` | **Applied.** The Next.js app, 1 replica (see note in the file) |
| `app-pvc-uploads.yaml` | **Applied.** The 5Gi uploads volume (planning-design §9) |
| `ingress.yaml` | **Applied**, with TLS. Routes external traffic to the app Service |

CI (`.github/workflows/ci.yml` at the repo root) builds and pushes the
image to `ghcr.io/dclaramount/kootenwayetours` on every push to `main`; the
package is public, so the cluster needs no registry credentials to pull it.

Not yet included: database/uploads backup CronJobs, and a migration Job
(migrations were applied by hand once — see below — there's no automated
"run on deploy" path yet).

## Deployed state (2026-09-03)

First real deploy, done manually, step by step, verifying actual behavior
at each step rather than trusting that a `kubectl apply` succeeding meant
it worked. Two real bugs turned up this way that a docker build's exit
code alone would never have caught:

1. **Prisma engine architecture mismatch.** The image was built and tested
   locally on Apple Silicon (arm64) and looked fine — but CI builds
   `linux/amd64` (matching the Civo node), and the Prisma query engine path
   had been hardcoded to the arm64 filename. The app crash-looped on the
   real cluster with `PrismaClientInitializationError` even though nothing
   was wrong in the application logs, only visible once actually watching
   pod behavior on the cluster. Fixed in
   [`infra/docker/docker-entrypoint.sh`](../docker/docker-entrypoint.sh) by
   resolving the engine path at container *start* based on the
   architecture actually running it, and re-verified by building and
   running the image under `linux/amd64` emulation before pushing.
2. **Probe timeouts too tight for this node.** `readinessProbe`/
   `livenessProbe` had no `timeoutSeconds` (Kubernetes default: 1s). On
   this 1-vCPU node, shared with Postgres and every system pod, that was
   often not enough time for `/api/ready`'s real DB round-trip — the app
   kept getting killed and restarted with nothing wrong in its logs.
   Bumped to 5s with `failureThreshold: 3` in `app-deployment.yaml`.

Other things worth knowing:

- **The database is intentionally empty** — migrations were applied, no
  seed data. (Decision: don't put fictional placeholder tours/blog posts,
  meant for local dev preview, on the real domain.)
- **`kubectl port-forward` was unreliable** in the environment this was
  deployed from (connections silently never established, no error) even
  though `kubectl exec` worked fine. If a future `prisma migrate deploy`
  needs to run and port-forward misbehaves the same way, the fallback used
  here: apply the migration SQL directly via `kubectl exec` into the
  Postgres pod, piped through `psql`, plus a manual insert into
  `_prisma_migrations` so Prisma's own tooling still recognizes it as
  applied later. See git history on this file for the exact commands.
- **Password generation gotcha**: the first `kootenwayetours-secrets`
  attempt used `openssl rand -base64`, which can contain `/` and `+` —
  both break unescaped inside a `postgresql://` connection string
  (`P1013: invalid port number`, since `/` gets read as a path separator).
  Use `openssl rand -hex 24` (or otherwise URL-safe) for
  `POSTGRES_PASSWORD` instead. Also: Postgres only applies
  `POSTGRES_PASSWORD` on first init of an *empty* data volume — changing
  the Secret later doesn't rotate it; the PVC has to be deleted (fine when
  there's no real data yet, not fine once there is).

## Redeploying / operating

- **New image after a `main` push**: CI publishes it automatically;
  `kubectl --context main-cluster-civo rollout restart deployment/app -n kootenwayetours`
  picks it up (the `:latest` tag alone won't — nothing tells the running
  pod to re-pull otherwise).
- **Manifest changes**: `kubectl --context main-cluster-civo apply -k infra/k8s/`
  (idempotent — safe to rerun even when most of it is unchanged).
- **New migrations**: prefer `kubectl port-forward svc/postgres -n kootenwayetours 5432:5432`
  and `prisma migrate deploy` against `localhost:5432` from a real machine —
  the manual `exec`+`psql` route above was a fallback, not the normal path.
- **Status check**:
  ```bash
  kubectl --context main-cluster-civo -n kootenwayetours get pods
  kubectl --context main-cluster-civo -n kootenwayetours rollout status deployment/app
  curl https://kootenwayetours.com/api/ready
  ```

## Validating manifests without a cluster

```bash
kubectl kustomize infra/k8s/ | kubectl apply --dry-run=client -f -
```

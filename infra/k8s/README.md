# Kubernetes manifests

Manifests for deploying Kootenwaye Tours to the Civo cluster, per
[`planning-design/iteration-1`](../../planning-design/iteration-1-tour-platform-blueprint.html)
§11. Kept as plain Kustomize (a `kustomization.yaml` plus one file per
resource) — no overlays yet, since there's currently one environment.

**The app itself (Postgres, the Next.js Deployment) has not been applied
yet.** Cluster networking/TLS plumbing has: the `kootenwayetours` namespace,
the `kootenwayetours-tls` Secret, `ingress.yaml`, and both files under
`cluster/` are live on the cluster and verified working end-to-end
(DNS → Cloudflare → origin TLS → Traefik → routed by host → 404, since
there's no backend yet). See "Deploying" for the rest.

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
| `configmap.yaml` | Non-secret app config (`NODE_ENV`, `UPLOAD_DIR`, ...) |
| `secret.example.yaml` | **Template only** — shows the Secret's shape, not meant to be applied |
| `postgres-statefulset.yaml` / `postgres-service.yaml` | In-cluster Postgres, its own 2Gi PVC |
| `app-deployment.yaml` / `app-service.yaml` | The Next.js app, 1 replica (see note in the file) |
| `app-pvc-uploads.yaml` | The 5Gi uploads volume (planning-design §9) |
| `ingress.yaml` | **Applied**, with TLS. Routes external traffic to the app Service — currently 404s since that Service doesn't exist yet |

Not yet included, follow-ups once this first deploy is working:
database/uploads backup CronJobs and TLS (Cloudflare Origin CA cert, per
the cost discussion — see "Cluster networking"; no cert-manager install
needed).

CI (`.github/workflows/ci.yml` at the repo root) builds and pushes the
image on every push to `main` — see step 1 below for the one manual step
that still needs doing after its first run.

## Deploying

1. **Get an image into GHCR.** `.github/workflows/ci.yml` builds and pushes
   `ghcr.io/dclaramount/kootenwayetours:latest` automatically on every push
   to `main` — nothing to do by hand once that's landed. One manual,
   one-time step after the *first* successful push: the package defaults to
   **private**, and the cluster has no registry credentials configured, so
   either
   - make the package public (GitHub → your profile → Packages →
     `kootenwayetours` → Package settings → Change visibility), or
   - create a `kubectl create secret docker-registry` imagePullSecret with a
     PAT that has `read:packages`, and reference it in
     `app-deployment.yaml`'s `imagePullSecrets`.

   (No CI run yet, or want to test locally first? `docker build -f
   infra/docker/Dockerfile -t ghcr.io/dclaramount/kootenwayetours:latest .
   && docker push ...` does the same thing by hand.)

2. **Create the real Secret** (never commit actual values — this writes
   directly to the cluster, not to a file in this repo):
   ```bash
   kubectl --context main-cluster-civo create namespace kootenwayetours \
     --dry-run=client -o yaml | kubectl --context main-cluster-civo apply -f -

   kubectl --context main-cluster-civo create secret generic kootenwayetours-secrets \
     --namespace kootenwayetours \
     --from-literal=POSTGRES_USER=kootenwaye \
     --from-literal=POSTGRES_PASSWORD="$(openssl rand -base64 24)" \
     --from-literal=POSTGRES_DB=kootenwaye \
     --from-literal=SESSION_SECRET="$(openssl rand -base64 32)" \
     --from-literal=DATABASE_URL="postgresql://kootenwaye:<same password as above>@postgres.kootenwayetours.svc.cluster.local:5432/kootenwaye?schema=public"
   ```

3. **Apply everything else:**
   ```bash
   kubectl --context main-cluster-civo apply -k infra/k8s/
   ```

4. **Run migrations** against the new database (one-off, from your machine
   or a temporary pod — there's no migration Job wired up yet):
   ```bash
   kubectl --context main-cluster-civo port-forward svc/postgres -n kootenwayetours 5432:5432
   DATABASE_URL="postgresql://kootenwaye:<password>@localhost:5432/kootenwaye?schema=public" npx prisma migrate deploy
   ```

5. Check rollout status and the health endpoint:
   ```bash
   kubectl --context main-cluster-civo -n kootenwayetours rollout status deployment/app
   kubectl --context main-cluster-civo -n kootenwayetours port-forward svc/app 3000:80
   curl localhost:3000/api/ready
   ```

## Validating manifests without a cluster

```bash
kubectl kustomize infra/k8s/ | kubectl apply --dry-run=client -f -
```

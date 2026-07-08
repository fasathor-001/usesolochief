# Deployment

## Hosting — Railway

SoloChief is deployed on Railway using Docker.

**Important:** Railpack is never used. All builds use the Dockerfile explicitly.

### Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile=false
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

`npm install` is used instead of `npm ci` to avoid lock file compatibility failures during
Railway builds. `--frozen-lockfile=false` allows minor lock file drift without erroring.

### railway.toml

```toml
[build]
builder = "dockerfile"
dockerfilePath = "./Dockerfile"

[deploy]
restartPolicyType = "always"
```

`restartPolicyType = "always"` ensures the container restarts automatically on crash.

---

## Git Branch

**Branch: `master`**

All commits go to `master`. There is no `main` branch. Railway is connected to `master`.
Every push to `master` triggers a Railway build and deploy.

---

## DNS — Cloudflare

| Domain | Destination | Type |
|--------|------------|------|
| `solochief.app` | Railway deployment | Cloudflare DNS → CNAME to Railway URL |
| `usesolochief.com` | Cloudflare Pages | Marketing site |

Both domains registered on Cloudflare. Cloudflare proxy is enabled (orange cloud).
This provides DDoS protection, caching, and SSL termination.

To point `solochief.app` to Railway:
1. In Railway: copy the generated Railway domain (e.g. `solochief-ai-production.railway.app`)
2. In Cloudflare DNS: add a CNAME record `solochief.app` → `solochief-ai-production.railway.app`
3. In Railway custom domains: add `solochief.app` and verify

---

## Environment Variables

All environment variables are set in the Railway Variables panel.
They are never baked into the Docker image.
Never commit real values to the repository.

Required variables for production:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
RESEND_API_KEY
NEXT_PUBLIC_APP_URL=https://solochief.app
```

---

## Supabase Region

Choose the region closest to South Africa for lowest latency.
Supabase currently offers `ap-southeast-1` (Singapore) as the closest option to
Southern Africa. A `eu-west-2` (London) region may also be appropriate depending on
primary user geography at launch.

---

## Health Check

Railway performs a health check on port 3000 after each deploy.
Next.js responds to `GET /` on port 3000. No custom health check endpoint is required
for Phase 1.

---

## Rollback

Railway maintains deployment history. To roll back:
1. Open the Railway dashboard
2. Select the project → Deployments
3. Click the previous successful deployment → Redeploy

---

## Marketing Site — usesolochief.com

The marketing site (`usesolochief.com`) is a separate static site deployed on Cloudflare Pages.
It is not part of the Next.js application. It can be built independently (plain HTML, Astro,
or a separate Next.js static export).

The marketing site does not share the Railway deployment.

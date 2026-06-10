# Deployment guide — what to do when you come back

Everything in this repo is ready to ship. You just need to do these things in order:

## 1. Buy a domain (15 min, ~$15/yr)

Go to [Namecheap](https://www.namecheap.com) or [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/). Try:

- `fixcost.ai` (~$80/yr — premium TLD)
- `fixcost.app` (~$15/yr — recommended)
- `getfixcost.com` (~$10/yr — fallback)

Pick the one that's available and not too expensive. Cloudflare Registrar sells at cost — best value.

## 2. Push this to GitHub (10 min)

```bash
cd fixcost-deploy
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

Then:

1. Go to https://github.com/new
2. Name it `fixcost-ai`, set to Public
3. Don't add README/license — they exist already
4. Copy the commands GitHub shows you to add the remote and push

```bash
git remote add origin https://github.com/YOUR_USERNAME/fixcost-ai.git
git push -u origin main
```

## 3. Get an Anthropic API key (5 min)

1. Go to https://console.anthropic.com/settings/keys
2. Sign up if you haven't (no payment needed for free credit)
3. Create a new API key
4. Copy it — starts with `sk-ant-...`
5. Buy at least $5 of credits — enough for ~300 repair guides

## 4. Deploy to Vercel (10 min)

1. Sign up at https://vercel.com/signup using your GitHub account
2. Click **Add New → Project**
3. Find `fixcost-ai` and click **Import**
4. **Important:** before clicking Deploy, expand **Environment Variables**
5. Add `ANTHROPIC_API_KEY` = your key from step 3
6. Click **Deploy**. Wait ~60 seconds.

Your site is live at `fixcost-ai-xyz.vercel.app`.

## 5. Connect your domain (15 min)

1. In the Vercel project → **Settings** → **Domains**
2. Add the domain you bought in step 1
3. Vercel will show you DNS records to set
4. Go to your domain registrar's DNS settings, add the records
5. Wait 5-60 min for DNS to propagate
6. Vercel auto-generates SSL — site is live at `fixcost.app` (or whatever)

## 6. Update README + docs with your actual URLs (5 min)

Search-replace in your local clone:
- `YOUR_USERNAME` → your actual GitHub handle
- `fixcost.ai` → your actual domain
- `YOUR_HANDLE` → your actual LinkedIn handle

Commit and push. Vercel auto-redeploys.

## 7. Record the demo video (30 min)

Open `docs/DEMO_VIDEO_SCRIPT.md` and follow it. Record on iPhone with QuickTime or screen-record on Mac with Cmd+Shift+5. ~90 seconds.

Upload to LinkedIn natively (don't link to YouTube), Twitter, and add a still frame to your README.

## 8. Post the launch (1 hour to write, 1 day to engage)

Open `docs/DISTRIBUTION.md`. The post drafts are written — just fill in your specifics and post. Order:

1. LinkedIn (Tuesday or Wednesday morning)
2. Reddit r/MechanicAdvice (after LinkedIn gets traction)
3. Twitter/X thread
4. dev.to or your blog (use `docs/BUILD_STORY.md`)

## 9. Optional but worth it

**Sentry for error tracking (15 min, free):**
1. Sign up at https://sentry.io
2. Create a React project, copy the DSN
3. Add to Vercel env vars as `VITE_SENTRY_DSN`
4. Add `@sentry/react` to dependencies and initialize in `main.jsx` (Sentry's docs show exact code)

**Vercel Analytics (2 min, free):**
1. In your Vercel project → Analytics tab
2. Click Enable Web Analytics
3. No code change needed — Vercel injects automatically

**Plausible (better analytics, $9/mo):**
- More accurate than Vercel Analytics
- Skip unless you want to publicly share your traffic numbers

## What you'll have when you're done

- A live product at your own domain with SSL
- Real AI in production (not template fallback)
- A GitHub repo that looks like an engineer wrote it
- A demo video for LinkedIn and your resume
- Distribution channels lined up
- Privacy policy + ToS that actually exist
- An architecture diagram in the README
- A build story published

That's the package. Hiring managers will read it as "real engineer with shipped product" not "student with side project."

Total time: ~3 hours of focused work, spread over a weekend.

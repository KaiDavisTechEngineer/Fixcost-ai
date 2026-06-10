# How I built FixCost AI — an honest writeup

_Draft — edit before publishing on dev.to / Medium / your own blog._

---

I'm a CS student going into ML engineering internships. I needed a portfolio project that demonstrates real AI integration without being another to-do app or chatbot wrapper. So I built FixCost AI — a free tool that gives you a vehicle-specific repair guide in about 8 seconds.

[**Live at fixcost.ai**](https://fixcost.ai) · [GitHub](https://github.com/YOUR_USERNAME/fixcost-ai)

Here's everything I learned shipping it.

## The actual problem

My car (2013 Ford C-Max) started making a clunking sound over bumps. Three hours of Google later, I had 14 forum tabs open and was no closer to knowing whether it was sway bar end links, control arm bushings, or strut mounts. Every guide was generic.

The information *exists*. Mechanics know this stuff. AI knows this stuff. It just isn't packaged in a way that says "for your specific car, here's the playbook."

So I built that.

## What it does

Pick year, make, model, optional trim/engine. Describe the problem. Click generate.

You get:
- A vehicle-specific diagnostic overview
- DIY vs shop cost ranges calibrated to your state's labor rate
- Step-by-step procedure with real torque specs
- Per-item shop links (each tool/part deep-links to AutoZone pre-filled with your vehicle)
- YouTube search terms tuned for your exact car
- Make-specific gotchas — Ford modular spark plug breakage, BMW coding requirements, Honda VTEC solenoid screens, etc.

Free, instant, no signup, bilingual EN/ES.

## The tech stack (and why)

- **React 18 + Vite** — fast HMR, tiny bundle. No Next.js because this is a single page.
- **Vercel** — Edge Functions for the AI proxy, free tier covers MVP, auto-deploy from GitHub.
- **Anthropic Claude Sonnet 4** — better structured JSON output than alternatives I tested.
- **localStorage** — no backend persistence in v1. Garage and history live on your device.

Single React file (`App.jsx`, ~150KB). I deliberately didn't split into 40 components. The whole thing is one logical app screen and splitting it would have been ceremony, not architecture.

## The interesting problems

### 1. Server-side AI proxy or direct client calls?

Direct client calls would mean shipping the Anthropic API key in the bundle. Fatal.

I added a Vercel Edge Function at `/api/generate` that holds the key as an environment variable, validates input, applies per-IP rate limiting, and proxies the request. Adds ~30ms of latency but keeps the secret safe and lets me observe what's happening server-side.

```javascript
export const config = { runtime: "edge" };

export default async function handler(req) {
  // Rate limit by IP
  if (!checkRateLimit(getIP(req))) return new Response(...429);
  
  // Build prompt server-side, never trust client formatting
  const prompt = buildPrompt(await req.json());
  
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, ... },
    body: JSON.stringify({ model, max_tokens: 1500, messages: [...] }),
  });
  
  return new Response(JSON.stringify({ result: extractText(await r.json()) }));
}
```

### 2. What happens when AI fails?

A blank error screen kills the demo. So I built a client-side template engine that produces real, useful guides from a static knowledge base — vehicle-specific known issues per manufacturer, real torque specs, real tool sizes. When the AI fails or no key is configured, the user still gets a usable guide.

This was the single best decision I made. The app **never returns a broken state**, which matters more than any individual feature.

### 3. Vehicle dropdowns at the scale of "every car ever"

Original version had autocomplete text inputs. Felt fast on desktop, hated on mobile. I rebuilt the inputs as native `<select>` dropdowns with a cascading data model:

```
Make → Models for that make → Trims for that (make, model)
```

The trim dropdown is data-driven from 70+ model entries — each entry packs trim level + engine displacement + body style (`"SEL 2.0L Hybrid"`, `"Si 1.5L Turbo Sedan"`). Every dropdown has an "Other (type custom)..." escape hatch so rare or older vehicles still work.

This took 4 iterations. The first 3 each had subtle UX bugs around what happens when you change Make after picking Model (it should reset the model). Cascading state is harder than it looks.

### 4. Per-item shop links

Most "AI repair tools" point you to a single "Buy parts" button. Useless — which part, where, in what size for your car?

I made every tool and part in the result a tappable card that opens AutoZone search prefixed with your vehicle:

```
Vehicle: 2013 Ford C-Max 2.0L Hybrid
Part: "Sway bar end links (Moog or OEM, ~$25-50/pair)"
→ autozone.com/search?q=2013+Ford+C-Max+2.0L+Hybrid+Sway+bar+end+links
```

Hit rate on getting the right part on the first AutoZone result page jumped from ~30% to ~85% with the vehicle prefix.

### 5. The bilingual prompt switch

EN/ES toggle was non-negotiable for me (NC has a large Spanish-speaking demographic that DIYs everything). The trick was to keep the JSON schema in English so my client parser works, but switch all values to Spanish:

```
WRITE ALL STRING VALUES IN SPANISH. Keep JSON keys in English.
```

That one sentence in the prompt was the whole feature. AI is wild.

## What I learned about prompt engineering

For structured JSON output, three things matter:

1. **Show the exact schema in the prompt.** Don't say "return JSON with these fields." Show the literal `{"key": "value", ...}` shape. Token cost is trivial.

2. **Tell it what NOT to do.** "Respond with ONLY the JSON object — no markdown, no preamble." Saves you parsing markdown fences.

3. **Validate the output.** Always assume the AI will violate the schema sometimes. My `extractJSON()` strips markdown, finds the first `{` and last `}`, parses what's between, and falls back to template if invalid.

## What I'd do differently

- **Build the backend first.** I built the client first because the artifact runtime worked, then had to retrofit. Backend-first would have saved a week.
- **Pick a domain before building.** I shipped at `fixcost-ai-xyz.vercel.app` for a while. The custom domain was always going to be needed.
- **Add Sentry from day one.** Errors in production are invisible without it. Added in v1.1.

## Numbers

_Update with real numbers after launch._

- Build time: ~6 weeks part-time as a student
- Lines of code: ~3000 (one JSX file + Edge Function + docs)
- Bundle size: 180KB gzipped
- Lighthouse score: 95+ on mobile
- AI cost per guide: ~$0.015 with Claude Sonnet 4
- Time to first paint: <1s on 4G

## What's next

VIN lookup via NHTSA (one-tap vehicle population). Photo upload + Claude Vision for visual symptom diagnosis. Supabase auth for cross-device garage sync. iOS app via Capacitor.

## If you're a hiring manager reading this

I'm looking for ML engineering and applied AI internships for summer 2026. If FixCost is the kind of thing your team builds, I'd love to talk.

- LinkedIn: [linkedin.com/in/YOUR_HANDLE](https://linkedin.com/in/YOUR_HANDLE)
- Email: in my LinkedIn

Thanks for reading. If you found this useful, [the project is on GitHub](https://github.com/YOUR_USERNAME/fixcost-ai) — stars appreciated, contributions even more so.

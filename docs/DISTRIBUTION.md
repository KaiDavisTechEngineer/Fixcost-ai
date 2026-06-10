# Distribution playbook

How to get FixCost AI in front of real users. Real users → real story → real resume material.

## The strategy

You're not selling anything. You built a free tool, you want feedback. That framing is **way** more welcome on Reddit than "check out my startup." Lead with the tool, not your job hunt.

Do the soft launches first (LinkedIn, dev.to). Then Reddit. Then Product Hunt only if you have ~50 users already.

---

## LinkedIn post (your main launch)

```
I built an AI car repair guide as my portfolio project. It actually works.

When something breaks on your car, you're stuck choosing between paying a shop $100 just for a diagnosis, or losing 4 hours to forum threads that never match your specific vehicle.

FixCost AI fixes that. Pick your year, make, model, trim, engine. Describe the problem. In 8 seconds you get a complete repair guide with:

→ Step-by-step procedure with real torque specs
→ DIY vs shop cost ranges calibrated to your state's labor rates
→ Per-item shop links (taps to AutoZone with your exact vehicle)
→ Make-specific gotchas (Ford modular spark plug breakage, BMW coding requirements, Honda VTEC solenoid screens)
→ YouTube tutorials curated for your car
→ Bilingual EN/ES

Built solo in 6 weeks as a CS student. Stack: React + Vite frontend, Vercel Edge Functions for the AI proxy, Anthropic Claude Sonnet 4 for the structured JSON generation.

Try it: fixcost.ai
Code: github.com/YOUR_USERNAME/fixcost-ai
Build writeup: [link to your blog post]

If you're hiring for ML engineering or applied AI internships, I'd love to chat.

#AI #MachineLearning #StudentDeveloper #ReactJS #BuildInPublic #Claude
```

**Why this works:** opens with the problem (relatable), then the tool (specific, demonstrable), then the tech (signals competence), then the soft ask. Hashtags get it onto the right feeds.

**Post timing:** Tuesday-Thursday, 9-11am ET. Engage with replies for the first 2 hours straight.

---

## Reddit posts

### r/MechanicAdvice (~600k subscribers)

Most likely to convert to real users. Be humble.

```
Title: I built a free AI repair guide — would appreciate feedback from real mechanics

Body:
Hey r/MechanicAdvice. I'm a CS student and I built a free tool that generates repair guides for specific vehicles using AI. Idea: instead of generic Google results, you tell it your exact year/make/model/trim and the problem, it gives you a vehicle-specific walkthrough.

Link: fixcost.ai

I'd genuinely appreciate it if anyone here gave it a try on a problem you already know the answer to, and called out anywhere the AI gets it wrong. I've added vehicle-specific known issues for major manufacturers (Ford modular engines, BMW coding, Honda VTEC solenoids, etc.) but I'm sure there are gaps.

Free, no signup, no ads. Just a CS student trying to make something useful.

Edit: not selling anything, source is on GitHub if anyone cares to look.
```

**Subreddit rules:** check for "no self-promotion" rules. Most allow tools with disclosure. Don't post and run — answer comments for 2 days.

### r/cars (~5.5M subscribers)

Probably gets removed unless framed perfectly. Skip unless you have karma in there.

### r/Cartalk (~250k)

Friendly audience, more general. Same framing as r/MechanicAdvice.

### r/learnprogramming (~5M)

Different angle — the build story is what's interesting here.

```
Title: I built and deployed an AI repair tool in 6 weeks — here's what I learned

Body:
I'm a CS student and I just shipped my first real project that lives at a real domain. Tech stack: React + Vite, Vercel Edge Functions, Anthropic Claude API. About 3000 LOC.

Three things I learned that I wish I'd known earlier:

1. Build the backend first. I started client-only, then had to retrofit a server proxy when I realized I couldn't ship the API key in the bundle. Backend-first would have saved me a week.

2. Always have a fallback. When my AI calls fail, the app falls back to a client-side template engine with a static knowledge base. Users never see an error — they always get a useful guide.

3. Native dropdowns beat fancy autocomplete on mobile. My first model picker was an autocomplete-as-you-type input. Felt smart on desktop, hated on iPhone. Rebuilt as native <select> dropdowns — way better UX.

Live demo: fixcost.ai
Source: github.com/YOUR_USERNAME/fixcost-ai
Full writeup with code samples: [your blog post link]

Happy to answer questions about any of this.
```

### r/SideProject (~120k)

Easiest crowd. Just share what you built.

### r/sysadmin, r/devops

Skip — wrong audience.

---

## Hacker News Show HN

Wait until you have 50-100 real users before posting here. The HN audience is brutal to under-baked work but generous to working products.

```
Title: Show HN: FixCost AI – AI-powered car repair guides with state-specific labor cost estimates

Body:
Hi HN — I'm a CS student and this is my first real project at a real domain. FixCost AI generates repair guides for specific vehicles: you pick year/make/model/trim, describe the problem, and get back a complete walkthrough with cost estimates and parts links.

What's interesting technically:
- Vercel Edge Function proxies to Anthropic Claude Sonnet 4 with a strict JSON schema in the prompt
- Client-side template fallback so the app never returns an error state, even with no AI available
- Vehicle-specific known issues database (Ford modular engines, BMW coding, etc.) used to bias the AI prompt toward make-specific gotchas
- Per-item shop links that deep-link to AutoZone with the vehicle prefixed in the search query

Free, no signup, bilingual EN/ES. Source on GitHub: [link]

Would appreciate any feedback, especially on edge cases the AI gets wrong.
```

**Submission timing:** Sunday or Monday morning ET. Avoid late evenings.

---

## Twitter / X thread

```
Thread:

1/ I built a free AI car repair guide as a CS student.

Tell it your exact car. Describe the problem. Get a complete repair guide in 8 seconds with cost estimates, parts links, and tutorials.

→ fixcost.ai

[Attach demo video]

2/ The interesting technical part:

The Anthropic API key can't ship in a client bundle. So I built a Vercel Edge Function at /api/generate that holds the key, applies rate limiting, and proxies the request.

Adds 30ms latency. Keeps the key safe. Adds server-side observability.

3/ The bigger lesson:

When AI fails, never show users an error. I built a client-side template engine with a vehicle-specific knowledge base that produces real guides when the AI is unavailable.

The app never returns a broken state. This is the single best decision I made.

4/ Vehicle-specific quirks are real product value:

Ford modular spark plug breakage. BMW coding requirements. Honda VTEC solenoid screens. R-1234yf vs R-134a refrigerant by year.

I encoded these into the prompt context. Now the AI calls out gotchas instead of giving generic advice.

5/ Free for everyone. Source on GitHub. If you're hiring for ML engineering or applied AI internships I'd love to talk.

→ Try it: fixcost.ai
→ Code: github.com/YOUR_USERNAME/fixcost-ai
→ Build story: [blog link]
```

---

## Product Hunt

Wait until you have ~100 real users. Schedule for a Tuesday or Wednesday launch. Pin the post on your social profiles a day before. Engage with every comment within the first 6 hours — the algorithm is brutal about engagement velocity.

---

## Email a few specific people

If you have any contacts at car forums, automotive YouTube channels, or Anthropic dev relations — a personal email with the demo link will get you 10x the engagement of a generic social post. Keep it short:

```
Subject: Built an AI car repair tool — would love your 90 seconds of feedback

Hi [Name],

I'm a CS student and just shipped a free AI repair guide at fixcost.ai. You came to mind because [specific reason].

If you have 90 seconds, the 2013 Ford C-Max with a clunking suspension is the demo case I use — would love to hear what you think of the output quality.

Not selling anything. Just trying to find out where the AI gets things wrong.

— Kai
```

---

## Tracking what works

Add these UTM-tagged links to each platform so you can see which channel drives traffic:

- LinkedIn: `fixcost.ai?utm_source=linkedin`
- Reddit MechanicAdvice: `fixcost.ai?utm_source=reddit&utm_campaign=mechanicadvice`
- Twitter: `fixcost.ai?utm_source=twitter`
- Email outreach: `fixcost.ai?utm_source=email&utm_campaign=outreach`

After a week, you'll know which platform to double down on.

---

## What success looks like

For your portfolio purposes, you need:

- 50+ unique users (achievable in week 1 with the playbook above)
- 1 thoughtful piece of public feedback (Reddit comment, HN thread, LinkedIn comment)
- 5+ GitHub stars
- One screenshot of an analytics number you can quote on your resume

That combination on a resume turns "side project" into "shipped a product, validated with real users." Big difference in how it reads.

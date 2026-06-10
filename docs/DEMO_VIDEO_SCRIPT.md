# Demo video script — 90 seconds

A turnkey script for your demo video. Read this exactly as written, or adapt for your voice. Total length when read at natural pace: **75–90 seconds**.

## Setup before recording

1. Open the deployed site on iPhone (or Mac with phone-sized window) — full screen, no debug toolbars visible
2. Make sure My Garage is empty and History is empty for a clean walkthrough
3. Use QuickTime Player → File → New Movie Recording → switch source to iPhone (cable-connected) for native iOS recording
4. Or screen-record on Mac with Cmd+Shift+5, set to capture window
5. Practice the flow once silently to time it
6. Have a quiet room and a decent mic (AirPods are fine)

## The script

> **[0:00–0:08] Hook — landing page visible]**
>
> "When something goes wrong with your car, you're stuck between paying a shop a hundred bucks just to *look* at it, or losing four hours to forum threads that don't match your specific car."
>
> **[0:08–0:15] Open the app — tap "Diagnose"]**
>
> "I built FixCost AI to fix that. Free, no signup, mobile-first. Watch this."
>
> **[0:15–0:30] Fill in the form — Year 2013, Make Ford, Model C-Max, Trim SEL 2.0L Hybrid, State NC]**
>
> "Pick your year. Make. Model. The trim and engine dropdown auto-fills based on what you've already picked — so this Ford C-Max gives me the actual SEL 2.0L Hybrid option, not generic guesses."
>
> **[0:30–0:38] Type the problem]**
>
> "Then I type what's wrong. Let's say it's clunking over bumps. State picker adds regional labor rates so the cost estimate is real."
>
> **[0:38–0:46] Tap Generate — short pause showing loading state]**
>
> "Tap Generate. About 8 seconds. Behind the scenes that's a Vercel Edge Function calling Claude Sonnet 4 with a structured JSON prompt."
>
> **[0:46–1:05] Scroll through the result]**
>
> "Now I've got the diagnosis — sway bar end links are the most likely cause. DIY parts will run $40 to $180. Shop labor at North Carolina rates, $200 to $500. So I save about three hundred bucks doing it myself."
>
> "Tools needed are listed. Parts are listed. Each one is a *tappable shop link* — taps to AutoZone with my exact vehicle prefilled. The step-by-step has real torque specs. Common mistakes are Ford-specific — I'm getting things like 'PCM relearn may be needed' and 'Ford end links on this generation rust badly, soak with penetrating oil overnight.' Not generic copy."
>
> **[1:05–1:18] Show the My Garage and History tabs briefly]**
>
> "Vehicles save to My Garage. Every guide saves to History. EN-ES bilingual toggle. Works offline once loaded. Real privacy — none of this leaves the device except the one repair query."
>
> **[1:18–1:30] Closing]**
>
> "Free to try at fixcost.ai. Source is on GitHub — link in the comments. Built solo in six weeks as a CS student. If you're hiring for ML engineering or applied AI internships, my DMs are open."

## Recording tips

- **Pace:** read at conversational speed. The script is tight on purpose — if you slow down, cut a sentence rather than rush.
- **Energy:** smile while talking. It carries through to your voice even on a phone mic.
- **Cuts:** record in one take if possible. If you have to cut, do it at the section markers `[0:30]` etc.
- **Background music:** OPTIONAL. If you add it, use something instrumental at -20dB so it doesn't compete with your voice. Most LinkedIn demos don't bother.
- **Captions:** add SRT subtitles after editing. LinkedIn autoplays muted — 70% of viewers won't hear your voice.

## Where to post

1. **LinkedIn** — main post, embed video natively (not YouTube link). Add a hook line and 3-5 hashtags: `#AI #MachineLearning #StudentDeveloper #BuildInPublic`
2. **Twitter/X** — same video, shorter caption, link to fixcost.ai
3. **Embed in README** — convert to GIF if under 25MB, or link to YouTube
4. **Reddit** — see [DISTRIBUTION.md](./DISTRIBUTION.md) for subreddit-specific advice

## After posting

- Reply to every comment within the first 2 hours (LinkedIn algorithm rewards engagement)
- Pin the post to your LinkedIn profile
- Add the video to your resume PDF as a clickable link
- Use the still frame as your LinkedIn cover image

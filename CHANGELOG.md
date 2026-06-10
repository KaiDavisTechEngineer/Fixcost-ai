# Changelog

All notable changes to FixCost AI are documented in this file. Format follows [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] — 2026-05-23

Initial public release.

### Added
- AI-powered repair guide generation via the Anthropic API (server-side via Vercel Edge Function)
- Client-side template fallback when AI is unavailable, with vehicle-specific known-issues database
- Full bilingual support (English / Spanish)
- Vehicle dropdowns: 35 model years × 23 makes × 200+ models × 70+ trim variants
- Regional labor cost estimates for all 50 US states
- My Garage — save vehicles for one-tap diagnosis
- Repair history with full guide viewer, search, and sort
- Per-item shop links — every tool and part deep-links to AutoZone search prefixed with the vehicle
- YouTube tutorial integration (optional API key)
- Make-specific safety warnings (BMW coding, electronic parking brakes, R-1234yf refrigerant, Ford modular engine spark plug breakage, etc.)
- Print / export to text for any guide
- PWA support — installable to home screen
- Mobile-responsive design optimized for phones
- Persistent storage via Vercel Edge KV / localStorage fallback

### Security
- Server-side API key handling (Edge Function), never exposed to the client
- Per-IP rate limiting (10 requests / minute)
- Input sanitization on both client and server
- Strict Content-Type checks

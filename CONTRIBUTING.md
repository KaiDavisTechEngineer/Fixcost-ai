# Contributing to FixCost AI

Thanks for your interest in contributing! This document outlines how to get set up and what kinds of contributions are welcome.

## Quick start

```bash
git clone https://github.com/YOUR_USERNAME/fixcost-ai.git
cd fixcost-ai
npm install
cp .env.example .env.local   # add your Anthropic API key
npm run dev
```

Open http://localhost:5173 in your browser.

## What I'm looking for

**Easy first contributions:**
- Add trim/engine data for models that fall back to the "Other" text input (see `TRIMS` constant in `src/App.jsx`)
- Add make-specific known issues to the `MAKE_QUIRKS` database
- Improve the template-fallback content for specific repair categories
- Translation improvements for the Spanish locale

**Bigger improvements:**
- VIN lookup integration (NHTSA API is free, no auth)
- Photo upload for visual symptom diagnosis (Claude Vision)
- Maintenance reminder system based on saved vehicles and mileage
- Test coverage (currently zero — see `package.json`)
- Accessibility audit and improvements

## Code style

- React functional components only, no class components
- Inline styles are fine for one-off styling, use the existing CSS class patterns for repeated styling
- Keep the JSX file readable — long single-letter variable names are reserved for the AI prompt construction
- ASCII-only for any text that's part of an AI prompt (the `ascii()` helper strips problematic chars)

## Pull request process

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Verify the build still works (`npm run build`)
5. Open a PR with a clear description of what changed and why

## Reporting bugs

Open an issue with:
- What you did (steps to reproduce)
- What you expected to happen
- What actually happened
- Browser / device info if it's UI-related

## Questions?

Open a discussion or ping me on LinkedIn — links in the README.

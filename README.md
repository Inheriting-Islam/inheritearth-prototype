# InheritEarth — prototype

Live: **https://inheriting-islam.github.io/inheritearth-prototype/**

Clickable validation prototype for the InheritEarth family-relocation platform (experiment E2/E3 from `~/inheriting-earth-validation/90_day_roadmap.md`). Four views in one static page: home → 16-question quiz → computed match results (email gate + report offer) → Kuala Lumpur dossier, plus a methodology page.

## URL parameters

- `?demo=1` — skip the quiz, show a sample family's computed results
- `?theme=light` / `?theme=dark` — force a theme (the ☾/☀ header toggle persists a choice)
- `?debug=overflow` — writes any viewport-overflow offenders into the page title

## Wiring checklist before driving real traffic (E2)

1. **Email capture — ACTIVATE IT.** The results gate and the report-reservation form POST to FormSubmit (`https://formsubmit.co/ajax/inheritingislam@gmail.com`). FormSubmit requires one-time activation: **submit the form once yourself, then click the confirmation link FormSubmit emails to inheritingislam@gmail.com.** Until then, submissions aren't delivered (the UI still unlocks). Swap to Buttondown/ConvertKit later by changing `CONFIG.emailEndpoint` in `src/app.js`.
2. **Analytics.** Funnel events are already instrumented (`track()` in `src/app.js`: `view_*`, `quiz_step`, `quiz_complete`, `email_submitted`, `report_reserved`) and counted locally in `localStorage['ie-metrics']`. To collect them for real: create a Plausible (or PostHog) account and uncomment the snippet in `index.html`'s head — `track()` forwards automatically once the scripts exist.
3. **Report payment.** The $29 founding offer is deliberately a reserve-by-email fake door (that IS experiment E3's mechanics). When ready for real payment, create a Stripe Payment Link and replace the reservation form's submit handler in `renderResults()`.
4. **Founder photo.** The founder section uses an "HA" monogram — swap in a real photo (`.avatar` in `src/styles.css`, `#founder` section in `index.html`).

## Honesty rules baked in (do not regress)

- Community-experience content shows sourced testimony with counts only when real; below n=10 it is never a score.
- All fee/budget figures are labeled prototype/desk-research with dates; the schools table says "always confirm with the school."
- Match display caps at 96; thin-data pillars render hatched with "est" labels; exclusions state their reason.

## Structure

- `index.html` — all views + copy
- `src/styles.css` — design tokens (light + dark), components
- `src/app.js` — city dataset, quiz definition, scoring engine, results rendering, analytics, email
- `assets/` — Wikimedia Commons photography (licenses: `assets/attributions.md` — CC BY/BY-SA images require the visible credits kept in the site footer), Fraunces fonts, `og.jpg` share image

Deployed via GitHub Pages from `main` (root). Push to deploy.

# Fast Track

Fast Track checks a California city's ADU requirements, line by line, against state law and HCD's letters to that
city. It flags each item, cites the source with a date, and drafts a response the applicant sends themselves.
Built for the Claude Impact Lab (UCI x SoCal Affordable Housing), Lane 2 "Clear it", on 2026-11-07. Sponsor:
Habitat for Humanity of Orange County. **Submissions are due at 2:30 PM.**

Read before working: `project-docs/CONTEXT.md` (the build context), `project-docs/plan.html` (the approved plan,
opens in a browser), and your lane's brief: `project-docs/HANDOFF-johnny.md` or `project-docs/DATA-NEEDS.md`.

## Event rules that do not bend (from the event starter's CLAUDE.md)

- **Never invent a statute, number, fee, address or parcel fact.** If a source does not say it, the answer is
  "unknown". A confident wrong answer is the worst outcome.
- **Label assumptions.** Mark every assumed number `ASSUMPTION` in the code, the UI and the README, and say what it is
  based on.
- **Cite sources.** Every claim about a law, program or dataset carries a URL, a section number and the date checked.
- **No personal information.** Nothing real about a tenant, buyer, resident or applicant. HCD letters name city
  staff and applicants and give addresses: strip them before committing any excerpt. If something looks like real
  personal information, stop and tell the user.
- **No scraping at volume.** Public or provided data only. Download once and cache it. Respect each site's terms.
- **No secrets in git.** Keys go in environment variables. `.env` is ignored, and `.env.example` holds names only.
- **Prototype only.** Never file, email, text or submit anything to a city or a person. Draft only.
- **Not legal advice.** Every user-facing screen says it is a prototype and points to a professional.
- When two sources disagree, or one looks out of date, show it. Don't pick silently.

## Who owns what

| Area | Owner | Paths |
|---|---|---|
| Shared contract (types, `runCheck`, `scan`) | Giuseppi's session | `src/contract/**` |
| Engine, CLI, sample runs | Giuseppi's session | `src/engine/**`, `scripts/**`, `data/samples/**` |
| Rules and clocks data | Giuseppi's session | `data/rules/**` |
| Sources, cities, findings | Ivy hands in, Giuseppi's session checks | `data/sources/**`, `data/cities/**`, `project-docs/FINDINGS.md` |
| Homepage (`/`), app (`/app/`), letter drafts, scanner, timeline | Giuseppi's session since 13:20 (Giuseppi's call); ask before editing | `src/home/**`, `src/ui/**`, `src/app/**`, `src/brand/**`, `src/letter/**`, `tests/letter/**`, `index.html`, `app/index.html` |

Don't edit another lane's paths. Ask the owner instead. The contract changes only through Giuseppi's session.

## Code standards

- TypeScript in strict mode. No `any` unless it is unavoidable.
- No file over 300 lines and no function over 50, but don't add abstraction just to hit those numbers.
- Never swallow errors: log them with context. Entry points add a `process.on('unhandledRejection')` handler.
- Use `Promise.all` when awaits are independent.
- Tests assert something meaningful. Type-check, lint and tests are all clean (`npm run verify`).
- Flags and citations come only from the rule set in `data/rules/`. The UI and the letter never hard-code law.

## Git

- `main` is what the judges see. Only Giuseppi's session merges into it, after review, at checkpoints.
- Work on branches: `feat/ui`, `feat/letter`, `data/<name>`. Stage files by explicit path. Commit often, with clear
  messages.
- No AI attribution or co-author lines in commits, PRs or the README. Never use the em dash character in outward
  text: use a plain dash.
- No deploys. The repo goes public at 2:15, with an explicit go.

## Issue Log

| Issue | Found | Resolved | Resolution |
|---|---|---|---|
| Starter `DATA-SOURCES.md` lines 136-137 give out-of-date Irvine fees (now $217.64/hr, $1,500 deposit, effective 2026-08-15) | 2026-11-07 | Open | The starter is read-only. Use the city's fee page, with its date. |

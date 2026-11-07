# Fast Track: status

Updated at each checkpoint by Giuseppi's session. Due at 2:30 PM, 2026-11-07.

| Checkpoint | Target | State |
|---|---|---|
| Docs pushed | 12:15 | Done (`c832aac`): plan, data needs, Johnny handoff, repo rules |
| Contract pushed | 12:15 | Done (`eec9f07`): types, runtime checks, samples, contract tests |
| D1, D2 sources | 12:30 | Done (`81c3031`): HCD Irvine letter and Handbook excerpts |
| Rules v0.2 | 12:40 | Done (`8f167b8`): four sourced rules, confirmed clocks |
| CP1: engine + screen merged | 12:45 | Engine side done (`60c9cf2`): `npm run check irvine` and `anaheim` give the expected flags. Waiting on Johnny's `feat/ui` and `feat/letter` |
| Acceptance test 5 (fresh clone, no key) | 1:15 | Passes: clone, `npm ci`, verify (26 tests) and build all clean at 12:21 |
| Rules v0.3 and SB 9 | 1:15 | Done (`79c4e3f`, `fc803d0`): four more Handbook ADU rules; five SB 9 rules for Dana Point and Orange, each scoped to its city. D4 (Irvine's current page) is in, paraphrased |
| CP2: all Musts | 1:15 | Done (`5c335ec`): the five-step dashboard (what you build, where, what stands in the way, timeline and next steps, who to contact), letter drafts to the city and to HCD, paste check. Screen and letter moved to Giuseppi's session at 1:20 |
| CP3: feature complete | 1:45 | Done (`d5119bf`, `b64a2e7`): fixes from two fresh-eyes reviews (every rule quote backed by its source file, mirror labels and rule limits on screen, headline counts only "state says no", HCD letter covers conflicts only) |
| Freeze | 2:00 | Done at 1:51: a fresh clone runs `npm ci`, verify (170 tests), build and `npm run check` cleanly with no API key. Scan of all 47 commits: no keys or tokens, no `.env`, no personal emails or phones, no em dash, no AI attribution. PR #1 (optional Claude routes, off by default) merged |
| Push gate, public | 2:15 | Needs an explicit yes |

## How to run what exists now

```bash
npm install
npm run dev      # the dashboard at localhost:5173
npm run check irvine   # the engine's flags, with sources, in the terminal
npm run verify   # type-check, lint, tests
```

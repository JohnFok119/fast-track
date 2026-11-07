# Handoff: Johnny's lane (J1 to J4)

From Giuseppi's session, 2026-11-07, 12:10 PM. Paste this file into your Claude session. Submissions are due at
2:30 PM.

## Read first

1. `project-docs/CONTEXT.md` (the build context) and `project-docs/problem-statement.md`.
2. `project-docs/plan.html`, the approved plan. Open it in a browser. The "What the judges will see" section is a
   clickable mock of the main screen. **It is your visual target.**
3. `CLAUDE.md`, the rules for this repo. It lands with the contract push at about 12:15.
4. `project-docs/DATA-NEEDS.md`, if you pick up any data items.

## Your tasks

| ID | Feature | Branch | You own | Done when |
|---|---|---|---|---|
| J1 | Main screen: city tabs (Irvine, Anaheim, Paste text), requirement list with status pills, flag detail with every citation (label, URL, section, checked date), prototype notice on every screen | `feat/ui` | `src/ui/**`, `index.html`, `src/main.tsx` | Both sample runs render, with every citation and date shown. No network calls. |
| J2 | Draft response letter: a pure function from flags to text, a panel and a Copy button | `feat/letter` | `src/letter/**`, `tests/letter/**`, `src/ui/letter/**` | Every citation in the flags appears in the letter. A test scans `src/` and finds no send path: no email, no form submit, no network call (acceptance test 4). |
| J3 | Paste-text scanner screen | `feat/ui` | `src/ui/scan/**` | Pasting text containing "65852.2" shows OUTDATED_CITATION with the Handbook source. Until about 1:00, `scan()` returns sample flags. |
| J4 | Legal clocks panel | `feat/ui` | `src/ui/clocks/**` | Each clock shows its section and checked date. "Deemed approved" shows UNCONFIRMED. |

Build order: J1 and J2 first, in parallel. J3 and J4 follow after the 1:15 merge.

## Folders you don't touch

`src/contract/**`, `src/engine/**`, `data/**` and `scripts/**` belong to Giuseppi's session. If you need a change
to the contract (the shared types), ask Giuseppi and don't edit it yourself. That way both sides keep building
against the same shapes.

## Stack and commands

- **Language:** TypeScript in strict mode, no `any`, on Node 24 (pinned in `.nvmrc`).
- **Frontend:** Vite and React, styled with Tailwind CSS. Match the mock: Apple-like system font, white and #f5f5f7
  surfaces, hairline dividers, and pill status badges in system red, orange, grey and green.
- **Tests:** Vitest.
- **Commands:**
  - `npm install`, then `npm run dev` (the app runs at localhost:5173);
  - `npm run verify` before every push (it runs the type-check, lint and tests).
- **No backend, no database, no API key.** All data is local JSON imported at build time.

## Contract as pushed (12:20): what differs from the sketch below

- `mapping` is `{ old, now, exactSection: string | null }`. `null` means the Handbook gives no single replacement
  section, so show it as "UNKNOWN: no single replacement" (true for both 65852.2 and 65852.22).
- **One requirement can produce more than one flag**, for example a covenant item that also cites 65852.2. The pair
  `(itemId, ruleId)` is unique, so use it as the React key and group flags by `itemId` in the list.
- `getClocks(): Clock[]` comes from `src/contract/api.ts` (data in `data/rules/clocks.json`). Show the `note` and the
  `status`, and render UNCONFIRMED clocks as unconfirmed.
- `CityRun.sample` is true for the sample runs: show a small SAMPLE label when it is.
- Import only from `src/contract/api.ts` and `src/contract/types.ts`. The engine swaps in behind `api.ts` at CP1
  without changing any signature.

## The contract (lands at 12:15; the pushed `src/contract/types.ts` is the source of truth)

The shapes below are a sketch. Use the pushed file.

```ts
export type Status = 'OK' | 'CONFLICTS' | 'OUTDATED_CITATION' | 'UNKNOWN';

export interface Citation {
  sourceId: string;      // id in data/sources/index.json
  label: string;         // "Gov Code 66315", "HCD letter to the City of Irvine, 2025-03-27"
  url: string;
  section?: string;
  page?: string;
  checked: string;       // YYYY-MM-DD
}

export interface Flag {
  itemId: string;
  itemText: string;
  status: Status;
  ruleId: string | null;  // null means no rule matched, so the status is UNKNOWN
  why?: string;
  citations: Citation[];  // empty when UNKNOWN
  mapping?: { old: string; now: string; exact: string };  // OUTDATED_CITATION only
  note?: string;
}

export interface CityRun {
  city: 'irvine' | 'anaheim';
  sourceLabel: string;
  sourceUrl: string;
  saved: string;
  sample: boolean;        // true for the labelled sample runs
  flags: Flag[];
}

export declare function runCheck(city: CityRun['city']): CityRun;
export declare function scan(text: string): Flag[];
```

## Rules (the same on both sides)

- **Never write legal content in the UI or the letter.** The screen and the letter show only what the flags say.
  There are no hard-coded statutes, fees or deadlines, and no "this is unlawful" wording that the flags don't carry.
- **Show the "Prototype, not legal advice" notice on every screen.** Also say that nothing is sent.
- **Copy is the only action on the letter.** No email links (mailto), form posts, fetch calls or third-party
  scripts.
- **No personal information.** Use placeholders like `[Your name]` and `[project address]`.
- **TypeScript strict, and no file over 300 lines.** Log errors with context, never swallow them.
- **Commits:** clear messages, staged by explicit path. No AI attribution or co-author lines, and no em dash
  characters.

## Git and checkpoints

- Work on `feat/ui` (J1, J3, J4) and `feat/letter` (J2), branched from `main` after the 12:15 contract push.
- Run `npm run verify`, then push your branches at **12:40, 1:10 and 1:40**. Giuseppi's session reviews each diff
  and merges into `main` at 12:45 (CP1), 1:15 (CP2) and 1:45 (CP3). Then pull `main` again.
- **Never push to `main`.**
- 2:00 is the feature freeze: after that, fixes only.
- Johnny makes the repo public at 2:15, once Giuseppi gives the go.

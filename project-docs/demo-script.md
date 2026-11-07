# Fast Track: 3-minute live demo (finalists)

Before going on stage: `npm run dev` is running at http://localhost:5173 with the page freshly loaded (Backyard home to rent, Irvine), and a terminal with `npm run check irvine` is ready in another window.

## Click path and what to say

| Time | Click | Say |
|---|---|---|
| 0:00-0:20 | The home screen. Point at the black ribbon: "Prototype. Not legal advice." | "Teachers and nurses cannot afford to live in Orange County. California has fast paths for small homes: if you follow the written rules, the city must say yes. But each city writes its own checklist, and some do not match state law." |
| 0:20-0:35 | Step 1, "What are you building?" Point at "Backyard home to rent" and its sourced fact. | "Our user owns the lot: a homeowner, a small builder, or a nonprofit like Habitat that already has the land. Step one: what are you building. Every fact carries its source." |
| 0:35-0:50 | Step 2, "Where?" Irvine is picked. Point at the headline "2 of 4 lines the state says no to" and the four count cards. | "Step two: where. Irvine. Four lines from the city, checked against state law and HCD's letter to Irvine. Two the state says no to, one old law number, one we could not check." |
| 0:50-1:20 | Click the first red line (irv-01, the deed restriction). Read the detail: "State says no", what the city wrote, Why, the two sources with checked dates. | "Irvine asked for a deed restriction on an ADU. HCD, the state housing agency, told Irvine that is 'an additional standard' Gov Code 66315 bars. Every verdict shows its source, a page or section, and the date we checked it." |
| 1:20-1:35 | Click the grey line (irv-04, "Not checked"). | "This one claims the 60-day clock stops. We do not have a source that settles it, so it says Not checked. We never guess. A confident wrong answer is the worst outcome." |
| 1:35-1:55 | Scroll to step 4, "Your timeline, plans to move-in". Point at the black Law bars, then a striped Assumption bar. | "Step four: your timeline. Black bars are legal deadlines with their source: 15 business days to say complete, 60 days to decide. Striped bars are estimates from the event brief, labelled as assumptions." |
| 1:55-2:20 | Step 5, "Who to contact". Then click "Write the letter". Show "To the city", then the tab "If the city won't fix it: to HCD". Point at "Copy the text". | "Step five: who handles it, by office, and a draft letter with every citation. If the city won't fix it, a draft request to HCD's Housing Accountability Unit. The applicant sends it. Fast Track never sends anything." |
| 2:20-2:45 | Close the letter. Step 1: click "Duplex or lot split (SB 9)". Dana Point opens. Click the 800 square foot line. | "For a builder like Habitat, SB 9 lets one single-family lot hold two homes. In 2023, HCD told Dana Point it must remove its 800 square foot cap and revise its one-bedroom limit. Adding a city is a data file, not new code." |
| 2:45-3:00 | Scroll to "Check any city's text" at the bottom. | "And you can paste any city's wording to check it. Fast Track: the state's letters, next to the city's checklist, for the people who have to fill it out." |

## End-to-end walkthrough: one made-up demo project

**MADE-UP DEMO PROJECT. Not a real person, lot or application.** Only the project is made up. The city requirements, rules, clocks and sources it runs through are the real ones in the app. No address, parcel number or names, even made-up ones. Say this out loud before you start.

- **Who:** a small nonprofit's project manager (made up, based on the event starter's scenarios C01 and C02).
- **The lot now:** a single-family home is already on it (made up). That matters: the 60-day decision clock applies "if there is an existing single-family or multifamily dwelling on the lot" (HCD ADU Handbook p. 11).
- **What they will build:** a backyard home to rent, in Irvine.
- **Submit date:** Monday 2026-11-09. ASSUMPTION: a made-up date for the demo.

| Beat | On screen | Say |
|---|---|---|
| 1. What you are building | Step 1: "Backyard home to rent". | "A home is already on the lot, and they want to add a backyard home to rent." |
| 2. Where | Step 2: Irvine. | "Irvine." |
| 3. What stands in the way | Headline "2 of 4 lines the state says no to", the count cards, the deed-restriction line. | "Two lines the state says no to, one old law number, one we could not check, each with its source." |
| 4. Letters | "Write the letter": "To the city", then "If the city won't fix it: to HCD" (conflict lines only). | "A draft to the city, and if needed a request to HCD. Nothing is sent." |
| 5. Before you submit | Not on screen yet (it is in Next steps). | "Irvine's ADU page lists 11 things to submit, among them a Covenant and a Hold Harmless Affidavit. Whether today's Covenant is the one HCD objected to is UNKNOWN, so we say ask the city, not 'illegal'." (Source: `data/sources/irvine-adu-current.md`, paraphrased, checked 2026-11-07.) |
| 6. Your dates | Step 4 timeline, the two Law bars. Dates below are computed by hand, not on screen. | See the dates below. |
| 7. Who to contact | Step 5: Irvine's Planning Team, then HCD's Housing Accountability Unit. | "Who handles it, by office, with the source." |

**The dates for this made-up project (computed by hand):**

- **City says complete or not: by Monday 2026-11-30.** That is 15 business days after the 2026-11-09 submit date (Gov Code 66317(a)(2)(A), Handbook p. 34). Weekdays only: holidays not counted (ASSUMPTION). Nov 11 and Nov 26-27 fall in this window and are counted as normal weekdays, so the real deadline may be later. Irvine's own page says it checks completeness in about two business days. If the city misses the deadline, the application is "deemed complete" (Handbook p. 35).
- **City approves or denies: by Friday 2027-01-08,** if the application was complete as first submitted. That is 60 days from receipt of a completed application (Gov Code 66317(a)(3), Handbook p. 11), counted as calendar days (ASSUMPTION: the source says "60 days", not business days). If the city says the application is incomplete, the 60 days start when it receives the completed application. Do not add the two clocks together.
- **Plans and build:** the event brief's estimates only (6 to 12 months, about 1 year; ASSUMPTION). We do not predict an approval or move-in date beyond the legal clocks.

## The 3 strongest points, by judging criterion

- **Works (live, on real data, sources on screen).** The Irvine flags come from a real HCD letter, Anaheim's from the city's real November 2025 checklist. Every verdict shows its URL, page or section, and date. Unknown stays unknown. It runs from a clean clone with `npm install` and no API key.
- **Impact and Innovation (the gap nobody fills).** Other tools check a plan against the city's code, or check an address. Fast Track checks the city's own checklist line by line against state law and HCD's letters to that city, lays out the legal clocks, names the office, and drafts the response. A nonprofit or permit tech can try it on a real checklist next month.
- **Scale (one city is one data file).** The same state law applies in every California city. A new city needs its saved requirements and HCD letters, not new code. SB 9 already works for Dana Point and Orange, from HCD's letter to each.

## Likely questions

- **"Does it use AI?"** Claude helped us research, plan and write the code, tests and docs. The app itself is deterministic today, so it cannot invent a law.
- **"How much time does it save?"** We do not claim a number. The timeline shows the legal deadlines with sources, and the plans and build times are the event brief's estimates, labelled ASSUMPTION.
- **"Is Irvine still doing this?"** Our evidence is from early 2025. Irvine's current ADU page still lists a covenant, but we have not seen its text, so we do not claim it is the same requirement.
- **"Is the law text verified?"** Statute text was read on a mirror site. The screen labels it "not yet checked on leginfo".
- **"Why does Anaheim show no 'State says no'?"** Its checklist cites two renumbered sections, which we flag. Whether its JADU owner-occupancy covenant is allowed depends on facts our sources do not settle, so we do not call it.
- **"Where does this go next?"** (Not built yet.) For a Habitat OC project manager who reports to leadership: a portfolio view of which projects are waiting on a city past the legal deadline or blocked by a requirement HCD objected to; a "Before you submit" list per city; and each city's observed timelines from the state's Annual Progress Report data, next to the legal deadlines. We will not predict move-in dates without data behind them.
- **"Where does this sit between finding land and building?"** It starts once you own the lot: what you can build, what stands in the way, and the clocks. Finding land and funding are not included.

## If the UI fails

Switch to the terminal and run:

```bash
npm run check irvine
```

Say: "Same engine, same flags, same sources, in the terminal." Walk through the CONFLICTS item (deed restriction, Gov Code 66315, HCD letter 2025-03-27), the OUTDATED_CITATION item, and the UNKNOWN item. `npm run check dana-point` shows the SB 9 flags. `npm test` shows the passing tests if asked.

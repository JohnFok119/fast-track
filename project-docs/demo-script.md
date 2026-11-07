# Fast Track: 3-minute live demo (finalists)

Before going on stage: `npm run dev` is running at http://localhost:5173, the Irvine tab is open, and a terminal with `npm run check irvine` is ready in another window.

TODO(freeze): confirm the click path below against the final UI, and fix any tab or button names.

## Click path and what to say

| Time | Click | Say |
|---|---|---|
| 0:00-0:20 | Show the home screen. Point at the "Prototype, not legal advice" notice. | "Teachers and nurses cannot afford to live in Orange County. California has fast paths for small homes where a city must say yes if you follow the written rules. But each city writes its own checklist, and some do not match state law." |
| 0:20-0:40 | Stay on the home screen. | "Our user is an applicant blocked by a rule the state says the city cannot impose: a homeowner, a small builder, or a nonprofit like Habitat for Humanity. Second, the city permit tech who wants to answer correctly. Our personas are made up from public research." |
| 0:40-1:10 | Irvine tab. Scroll the requirement list. Point at the pills: CONFLICTS, OUTDATED_CITATION, UNKNOWN. | "This is Irvine's wording, as quoted in a state letter. Fast Track marks each line." |
| 1:10-1:50 | Click the deed-restriction line. Read the detail: the statute, the HCD letter of 2025-03-27, the checked date. | "HCD, the state housing agency, told Irvine this covenant is 'an additional standard' that Gov Code 66315 bars. Every flag shows its source, a section and the date we checked it." |
| 1:50-2:10 | Click the old-citation line, then the "60-day clock stops" line. | "Old section 65852.2 was renumbered. And this claim, that the clock stops, is UNKNOWN. We do not guess. A confident wrong answer is the worst outcome." |
| 2:10-2:30 | Open the draft response letter. Point at the citations and the Copy button. | "It drafts a response with every citation. The applicant sends it. Fast Track never sends anything." |
| 2:30-2:50 | Click the Anaheim tab. Point at the placeholder or SAMPLE label. | "Anaheim shows old citations. Its wording is a labelled placeholder until we save the real checklist. Adding a city is a data file, not new code." |
| 2:50-3:00 | Back to the home screen. | "Fast Track: the state's letters, next to the city's checklist, for the people who have to fill it out." |

## The 3 strongest points, by judging criterion

- **Works (live, on real data, sources on screen).** The Irvine flags come from a real HCD letter. Every flag shows its URL, section and date. Unknown stays unknown. It runs from a clean clone with `npm install` and no API key.
- **Impact and Innovation (the gap nobody fills).** Other tools check a plan against the city's code, or check an address. Fast Track checks the city's own checklist line by line against state law and HCD's letters to that city, then drafts the response. A nonprofit or permit tech can try it on a real checklist next month.
- **Scale (one city is one data file).** The same state law applies in every California city. A new city needs its saved requirements and HCD letters, not new code. SB 9 is next, using HCD's letters to Dana Point and Orange.

## Likely questions

- **"Does it use AI?"** Claude helped us research, plan and write the code, tests and docs. The app itself is deterministic today, so it cannot invent a law.
- **"How much time does it save?"** We do not claim a number. The four-year timeline is the event brief's ASSUMPTION.
- **"Is Irvine still doing this?"** Our evidence is from early 2025. We do not claim it is current.
- **"Is the law text verified?"** Statute text was read on a mirror site. The output labels it "not yet checked on leginfo".

## If the UI fails

Switch to the terminal and run:

```bash
npm run check irvine
```

Say: "Same engine, same flags, same sources, in the terminal." Walk through the CONFLICTS item (deed restriction, Gov Code 66315, HCD letter 2025-03-27), the OUTDATED_CITATION item, and the UNKNOWN item. `npm run check anaheim` shows the Anaheim run. `npm test` shows the 26 passing tests if asked.

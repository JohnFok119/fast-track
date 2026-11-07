# Fast Track

> Fast Track checks a California city's backyard-home (ADU) requirements against state law, line by line, so an applicant blocked by a rule the city cannot impose can see it, with the source, and send a response.

**Team:** Fast Track
**Members:** Giuseppi, Johnny, Ivy
**Lane:** 2 Clear it
**Built at:** Claude Impact Lab: UCI × SoCal Affordable Housing, November 7, 2026

**Prototype only. Not legal advice. Talk to a professional before you act. Fast Track never sends anything to a city or a person.**

## The real user

**Who it is for.** First, an applicant who is blocked by a requirement the state says a city cannot impose. That can be a homeowner, a small builder, or a nonprofit project manager (for example at Habitat for Humanity of Orange County, the event's sponsor). Second, the city permit tech who wants to answer correctly. The people who benefit in the end are local workers (teachers, nurses, firefighters) who can move in sooner.

**The problem.** Workers cannot afford to live in Orange County. The event brief says a new affordable home takes about four years. California has fast paths where a city must say yes if the project meets the written rules, with no hearing. But each Orange County city writes its own checklist, and some checklists do not match state law. The state housing department sends cities letters about this, but those letters sit in a separate state dashboard, away from the forms applicants fill out.

**Before:** the applicant gets a city checklist or email, cannot tell which lines are lawful, and has no easy way to find the state's letter on the same point.
**After:** Fast Track marks each line, shows the state source and date, and drafts a response the applicant can send themselves.

**The people described here are made up.** Our personas (city permit tech, small builder, ADU homeowner, nonprofit project manager) come from public research, not interviews. We have not tested the tool with real users.

### Terms used in this README

| Term | Plain meaning |
|---|---|
| ADU | Accessory dwelling unit: a small extra home on a lot, such as a backyard cottage |
| JADU | Junior ADU: a small unit made from space inside a home |
| HCD | The California Department of Housing and Community Development, the state housing agency |
| Ministerial approval | If the project meets the written rules, the city must approve it. No hearing, no judgment call |
| SB 9 | A state law that allows duplexes and lot splits on many single-family lots |
| Gov Code | California Government Code, the state law book |

## What we built

Fast Track compares a city's actual ADU requirements with state law and with HCD's letters to that city. For each line it shows one of four flags:

| Flag | Meaning |
|---|---|
| OK | State law allows the city to require this. The source is cited |
| CONFLICTS | The state says the city cannot require this. The statute and letter are cited |
| OUTDATED_CITATION | The city cites an old law section. The renumbering is shown |
| UNKNOWN | Our rules do not cover it. We say so and do not guess |

Every flag shows its source, a section number and the date we checked it. Then Fast Track drafts a response letter. The applicant reads it, edits it and sends it themselves.

**Example (real).** Irvine told an applicant it could require a deed-restriction covenant on an ADU. In its letter to Irvine of 2025-03-27, HCD found this is "an additional standard" that state law bars (Gov Code 66315). Fast Track flags that line CONFLICTS and cites the statute and the letter.

```text
$ npm run check irvine
CONFLICTS
  item irv-01: "Pursuant to state ADU laws, the City is within our rights to restrict the separate sale of ADUs ...
  rule: adu-deed-restriction
  - Gov Code 66315 (not yet checked on leginfo) https://leginfo.legislature.ca.gov/... checked 2026-11-07
  - HCD letter to the City of Irvine, 2025-03-27 (p. 1, 3) https://www.hcd.ca.gov/... checked 2026-11-07
OUTDATED_CITATION
  item irv-02: "Pursuant to Section 65852.2(a)(10), ...
UNKNOWN
  item irv-04: "While State law provides for a 60-day shot clock for processing ADUs, that clock stops when ...
```

(Output shortened. Run the command to see all items and every link.)

**Screenshot:** TODO(freeze): add the final screenshot of the app here.

**Demo video:** TODO(freeze): paste the video link, or write "uploaded on the hub".
**Live demo:** TODO(freeze): paste the live demo URL, or delete this line if there is none.

## How Claude is used

**To build it.** Claude helped us research the problem and the competitors, plan the build, write the code and the tests, and draft these docs. People on the team reviewed and merged the work.

**Inside the tool.** Today the app makes no Claude calls. The engine is deterministic: it matches each requirement's wording against a hand-written rule set in `data/rules/`, and every rule points to a source. That is on purpose, so the tool cannot invent a law. No API key is needed to run it.

**What a person checks.** The team read each rule against the HCD letter and Handbook text. The applicant should check the draft letter, and a professional should check anything they act on.

## Try it

You need Node 24 (see `.nvmrc`) and git. No API key and no account are needed.

```bash
git clone https://github.com/JohnFok119/fast-track.git
cd fast-track
npm install              # versions are pinned in package.json
npm run dev              # opens at http://localhost:5173
npm run check irvine     # same check in the terminal, with sources
npm run check anaheim
npm test                 # runs the test suite
```

- `.env.example` lists one optional variable, `ANTHROPIC_API_KEY`. The demo does not use it. Leave it empty.
- Sample data is in the repo: `data/cities/` (saved city requirements), `data/rules/` (the rule set) and `data/samples/` (labelled sample runs).
- `npm run verify` runs the type-check, lint and tests together.

## Sources and assumptions

All dates checked: 2026-11-07. The source list lives in `data/sources/index.json`.

| Item | Source or assumption | Date checked |
|---|---|---|
| HCD letter to the City of Irvine (2025-03-27) | https://www.hcd.ca.gov/sites/default/files/docs/policy-and-research/ordinance-review-letters/irvine-adu-ta-032725.pdf | 2026-11-07 |
| California ADU Handbook, HCD, March 2026 | https://www.hcd.ca.gov/sites/default/files/docs/policy-and-research/adu-handbook-update.pdf | 2026-11-07 |
| Gov Code 66315 (no extra standards on ADUs) | https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66315 (read on a mirror site, leginfo check pending) | 2026-11-07 |
| Gov Code 66317 (review clocks) | https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66317 (read on a mirror site, leginfo check pending) | 2026-11-07 |
| Gov Code 66333 (JADU rules) | https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66333 (read on a mirror site, leginfo check pending) | 2026-11-07 |
| Anaheim ADU checklist, November 2025 | https://www.anaheim.net/DocumentCenter/View/35053/Accessory-Dwelling-Unit-Submittal-Requirements-Checklist (wording is a placeholder, see below) | 2026-11-07 |
| HCD letter to the City of Dana Point (2023-04-17, SB 9) | https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/HAU/Dana-Point-TA-041723.pdf | 2026-11-07 |
| HCD letter to the City of Orange (2026-05-05, SB 9) | https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/HAU/orange-ta-050526.pdf | 2026-11-07 |
| City of Irvine ADU page (submittal list, paraphrased) | https://cityofirvine.gov/node/69676 | 2026-11-07 |
| "A new affordable home takes about four years" | ASSUMPTION: the event brief's baseline. We did not measure it | n/a |
| Review clocks: 15 business days to check completeness, 60 days to decide | HCD ADU Handbook p. 34 and p. 11, citing Gov Code 66317(a) | 2026-11-07 |

Every number we made up is labelled ASSUMPTION here and in the tool. The four-year figure is the only one, and Fast Track does not claim time saved against it. A whole project is not the same as an ADU on land the owner already has.

## What is real and what is mocked

| Part | Status |
|---|---|
| HCD letter to Irvine and the HCD ADU Handbook (excerpts, names and addresses removed) | Real, working |
| Irvine's requirements, as quoted in HCD's letter | Real, working |
| Rule engine, flags, citations, CLI | Working. Deterministic, covered by automated tests that run on every push |
| Anaheim's requirement wording | Placeholder: paraphrased from our notes until the checklist is saved from a browser. The source line on the Anaheim tab says so |
| Gov Code text for 66315, 66317 and 66333 | Read on a mirror site. Not yet checked on leginfo, and labelled so in the output |
| "Deemed approved" if a city misses the 60 days | Unconfirmed: the Handbook disagrees with itself (p. 21 and p. 51). Shown as UNCONFIRMED, never as fact |
| Draft response letter | Draft text only. There is no send path |
| Paste-text scanner and clocks panel | TODO(freeze): set to working, partly working or not built |
| SB 9 checks (Dana Point, Orange) | Working. Each check is a finding from HCD's letter to that city, so it applies only to that city. Requirements are as HCD quoted or described them |

## Where it gets things wrong

- **Wording match.** It matches on wording, so it can miss a requirement phrased in a new way, or match one it should not.
- **Small coverage.** Four cities, from one HCD letter or one checklist each. The SB 9 checks come from HCD's letters to Dana Point and Orange and apply only to those two cities.
- **Irvine's "the 60-day clock stops" claim stays UNKNOWN.** HCD's letter does not analyze it, and the Handbook points both ways (p. 36).
- **Old evidence.** Our Irvine evidence is from early 2025 and our Dana Point evidence from 2023. The cities may have changed their rules since. Irvine's current ADU page still lists a covenant (checked 2026-11-07), but we have not seen its text, so we do not claim it is the requirement HCD objected to.
- **Untested with real users.** The personas are researched, not interviewed.
- **Not legal advice.** Do not rely on a flag or a letter without a professional.
- **Dependency audit.** `npm audit` shows 10 moderate findings. All are in dev-only lint tooling (minimatch, via eslint). The shipped app has 0 (`npm audit --omit=dev`).

## Next steps

**Next month, for a nonprofit or city:**
- Add SB 9 checks that apply in every city, once the SB 9 statutes (Gov Code 65852.21 and 66411.7) are checked on leginfo.
- Check the statute text on leginfo and save the real Anaheim checklist.
- Test with a permit tech and a project manager.

**With one more week:**
- Add more cities. Each one is a data file with its saved requirements and HCD letters, not new code. The same state law applies in every California city.
- Show the legal deadlines next to observed timelines from state permit data.

## Data and privacy

This project uses only public or provided data. It contains no personal information about real tenants, buyers or residents. It does not file applications or contact any city or person. HCD letter excerpts have names and addresses removed, and the raw PDFs are never committed. Test personas are made up.

## License

TODO(freeze): the team picks a license (the event template suggests MIT). No LICENSE file is in the repo yet.

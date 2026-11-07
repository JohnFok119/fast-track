# Fast Track: build context

Handoff from the research session, 2026-11-07. Read this whole file before planning or writing code.
Then read `project-docs/problem-statement.md` (the corrected problem statement).

## 1. The event and the clock

- **Event:** Claude Impact Lab: UCI x SoCal Affordable Housing, Saturday 2026-11-07, UC Irvine.
- **Lane:** 2, "Clear it": how do we turn four years into two?
- **Submissions due 2:30 PM:**
  - this repo, public, everything on `main`;
  - a README that follows the starter's `templates/TEAM-README.md`;
  - a demo video (30 seconds ideal, 2 minutes max);
  - the hub form.
- **Finalists:** announced at 3:00 and must demo live. Slides alone do not place.
- **Judging:** four equal areas, scored 1 to 5. Ties go to Impact.
  - **Impact:** would a nonprofit or city use it next month to help get homes built?
  - **Works:** a live demo on real data, with sources on screen. Working beats polished.
  - **Scale:** a believable path to the next 100 projects.
  - **Innovation:** a new way to see or solve the problem.
- **Keep a runnable version at all times.** Aim for something working by about noon, then iterate. Freeze features
  around 2:00 for the README, the video and the final checks.

## 2. Repo decision

- **This is a new repo, not a branch of the starter.** The event says to copy the starter as a template or ZIP and
  submit your own public repo. Remote: `https://github.com/JohnFok119/fast-track.git`.
- **The starter repo is a read-only reference.** It lives at `claude-impact-lab-uci (starter repo)`. Copy what
  you need (data files, README template) into this repo with attribution. Never edit the starter.
- **Before 2:30:**
  - make the repo public;
  - check that no personal information and no keys exist anywhere in its history;
  - open the repo signed out to confirm it is visible.

## 3. Problem in one paragraph

Workers can't afford to live in Orange County. New homes they could afford take about four years (an event
assumption). California's "ministerial" paths (ADUs, SB 9, SB 684) require cities to approve projects that meet the
written rules, with no hearing. But each of the 34 cities writes its own checklist, and those checklists drift from
state law. HCD (the state housing department) sends cities letters saying so, but those letters sit in a state
dashboard, away from the forms applicants actually fill out.

**Fast Track** checks a city's actual requirements against state law and HCD's letters to that city. It flags each
item, cites the source, and drafts a response the applicant can send. The draft is never sent by the tool. Full
version: `project-docs/problem-statement.md`.

## 4. Who it is for (research, 2026-11-07)

Four made-up personas were researched from public sources. Two pains hit all four: **trusting the rules** (city
rules drift from state law) and **predicting the time**. The full research page is a private artifact the user owns:
https://claude.ai/artifact/BaLMvQ3JMbZC2yQvW717vE

| Persona | What they want | Pain the checker solves | Other big pains (not the checker's job) |
|---|---|---|---|
| City permit tech | Give the right answer the first time | Forms citing old or unlawful rules; too many new laws to track | Legal deadlines with real consequences |
| Small builder (2-10 homes) | Use SB 9 / SB 684 across several cities | City rules stricter than state law; applications refused | 34 different rulebooks; no timeline data |
| ADU homeowner | "Which forms, in what order, how long?" | Requirements they can't check against state law | No posted review times; no fee total |
| Nonprofit project manager | Deliver 4-12 for-sale homes, fewest months of carrying cost | Rules drifting from state law (a medium pain for them) | Timelines (10-42 months approval to permit); funding rounds |

**The end beneficiaries** are local workers who move in sooner. They are the reason in the pitch, not the user of
the tool.

## 5. Scope (recommended; the plan decides and justifies)

- **Must (the core demo):** an ADU requirement checker for 1-2 cities, starting with **Irvine and Anaheim**, where the
  evidence is strongest.
  - **Input:** that city's saved checklist and requirements text, with source URL and date.
  - **Engine:** a curated, sourced rule set built from state law sections, the HCD ADU Handbook (March 2026) and
    HCD's letters to that city.
  - **Output:** every item flagged as one of four statuses:
    - `OK`;
    - `CONFLICTS` (cites the statute and the HCD letter);
    - `OUTDATED_CITATION` (shows the old and new section numbers);
    - `UNKNOWN`.
  - **Draft response:** an applicant response letter. Draft only, never sent.
  - **On screen:** sources and dates on every flag, plus a "prototype, not legal advice" notice.
- **Should:** a stale-citation scanner. Paste any city text and it maps old ADU section numbers to the new ones.
- **Stretch:**
  - SB 9 rules;
  - "which fast path fits this lot", using the Lane 1 parcel and zoning data;
  - the legal deadlines shown next to observed timelines from state permit data.
- **Out of scope:**
  - filing, emailing or submitting anything;
  - scraping city sites or the HCD dashboard;
  - legal advice;
  - claiming "time saved versus the four-year baseline". That compares a whole project to an ADU that starts on
    land the owner already has.

## 6. Acceptance tests (what "works" means)

1. **Irvine deed restriction:** a requirement for a deed restriction or covenant barring separate sale of the ADU is
   flagged `CONFLICTS`, citing Gov Code 66315 and HCD's letter to Irvine dated 2025-03-27.
2. **Anaheim old citations:** the November 2025 checklist's citations of Gov Code 65852.2 and 65852.22 are flagged
   `OUTDATED_CITATION`, pointing to the renumbered ADU law (66310 to 66342, SB 477, 2024). Take each exact new
   section number from the HCD ADU Handbook. If the source doesn't give one, show `UNKNOWN` for that mapping.
3. **No invented law:** every flag carries a source URL and a checked date. Every rule references a source entry in
   the rule set, so a rule with no source can't be used. Text that matches no rule is `UNKNOWN`.
4. **Nothing sends:** the response is only a draft. There is no email, form or network call that submits anything.
5. **Fresh-laptop run:** the app runs from the README "Try it" commands, using sample data in the repo. The demo path
   works with no API key, and any live Claude call is optional and degrades gracefully.
6. **Candidates, verify before encoding:** both come from the same HCD letter to Irvine.
   - Irvine told an applicant the 60-day ADU clock "stops when the City provides plan check comments".
   - Irvine treats a detached townhouse on its own lot as multifamily to refuse a JADU (junior ADU).
   - Read HCD's analysis in the letter, and the statute (Gov 66317, 66333), before turning either into a rule.

## 7. Verified facts you can use (checked 2026-11-07)

- **HCD letter to Irvine (2025-03-27):**
  - The city "misapplied State ADU Law ... by requiring deed restrictions and disallowing JADUs in townhomes".
  - A deed restriction is an "additional standard" barred by Gov 66315, and using it to call an application
    incomplete conflicts with Gov 66317(c).
  - HCD's findings went to the city on 2025-01-07. A 2025-02-18 city email still required the covenant and still
    cited old section 65852.2.
  - In a separate JADU townhouse dispute, the complainant abandoned their application.
  - https://www.hcd.ca.gov/sites/default/files/docs/policy-and-research/ordinance-review-letters/irvine-adu-ta-032725.pdf
- **HCD letter to City of Orange (2026-05-05):** the city declined to accept an SB 9 lot-split application filed
  2025-10-08. https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/HAU/orange-ta-050526.pdf
- **HCD letter to Dana Point (2023-04-17):** the city's SB 9 ordinance capped units at 800 sq ft, one story and one
  bedroom on lot splits. https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/HAU/Dana-Point-TA-041723.pdf
- **Anaheim ADU checklist (November 2025):** still cites 65852.2 and 65852.22 (per the starter's Lane 2
  `DATA-SOURCES.md`). The site returns 403 to scripts, so save a copy by hand.
  https://www.anaheim.net/DocumentCenter/View/35053/Accessory-Dwelling-Unit-Submittal-Requirements-Checklist
- **ADU law renumbering:** SB 477 moved ADU law from 65852.2 to 66310 through 66342. Approvals are 66314 to 66331;
  JADU is 66333. In 2025, 66324, 66327 and 66332 became 66311.5, 66313.5 and 66311.7, and 66333.5 was added
  (Handbook p.13, per the starter's `DATA-SOURCES.md`).
- **Clocks:**
  - ADU completeness review is 15 business days (Gov 66317(a)(2)(A)).
  - The ADU decision is due within 60 days of a complete application (66317(a)(3)).
  - Post-entitlement permits (AB 2234, Gov 65913.3): 15 business days for completeness, then 30 or 60 business days.
  - These were read from a mirror (california.public.law) because leginfo blocks scripts. Confirm in a browser.
  - **Sources disagree on "deemed approved" for ADUs.** The starter's background says it applies. One research pass
    found it stated only for coastal permits (Handbook p.21). Show this as unconfirmed.
- **Competitors** (public pages reviewed 2026-11-07, not a full audit):
  - **Symbium Build:** free for homeowners, statewide, address-based ADU feasibility.
  - **CivCheck (Clariti) and Archistar eCheck:** AI plan review that cities adopt to check drawings against city
    code.
  - **SoCal ADU Tracker:** ADU only, with a per-city "state law check" noting HCD letters, ADU permit timelines from
    state data, and a "what can I build" feature.
  - **Our difference:** we check the city's actual checklist line by line against state law and HCD's letters to
    that city, beyond ADUs, and draft a response.
- **Starter data error:** the starter `DATA-SOURCES.md` lines 136-137 are out of date for Irvine. Planning review is
  now $217.64/hr with a $1,500 deposit (effective 2026-08-15), and the pre-approved plan list says "Coming soon".

## 8. Data and resources (starter repo, absolute paths)

- **Rules and law:**
  - `claude-impact-lab-uci (starter repo)/lanes/2-clear-it/data/DATA-SOURCES.md`: statute links, HCD guidance,
    the renumbering notes, city ADU pages for 9 cities, and the state permit data API ids.
  - `claude-impact-lab-uci (starter repo)/docs/background.md` and `docs/glossary.md`: law summaries and terms.
  - `claude-impact-lab-uci (starter repo)/lanes/1-find-it/data/pathways.json`: five pathways with official
    sources.
- **Cities:** `claude-impact-lab-uci (starter repo)/lanes/2-clear-it/data/oc-cities.json` lists all 34 cities.
  Its `permit_page`, `adu_checklist`, `fee_schedule` and `checked` fields are empty to fill (URL plus date).
- **Time:**
  - `claude-impact-lab-uci (starter repo)/lanes/2-clear-it/data/timeline.json`: the four-year baseline, labelled
    ASSUMPTION.
  - **APR Table A2** (data.ca.gov resource `fe505d9b-8c36-42ba-ba30-08bc4f34e022`): no key needed; has entitlement,
    permit and occupancy dates.
- **Test users:** `claude-impact-lab-uci (starter repo)/lanes/2-clear-it/scenarios.json`: C01 homeowner, C02
  project manager, C03 permit tech (all made up).
- **Rules for submission:**
  - `claude-impact-lab-uci (starter repo)/docs/submission.md`: repo rules, the "Try it" section, pinned
    versions, `.env.example`, a sample data file, mocks labelled.
  - `claude-impact-lab-uci (starter repo)/templates/TEAM-README.md`: the README skeleton.
  - `claude-impact-lab-uci (starter repo)/docs/judging.md`: how judging works.
- **Event rules:** `claude-impact-lab-uci (starter repo)/CLAUDE.md` and `docs/ground-rules.md`. Copy the event's
  non-negotiables into this repo's own `CLAUDE.md`.

## 9. Known blockers

- **HCD letters** have no API or download. Do not scrape the dashboard. Save the few letters you need by hand
  (URLs in section 7), or ask HCD for copies at HAUportal@hcd.ca.gov.
- **City sites** for Anaheim, Costa Mesa, Fullerton and Orange return 403 to scripts. Save their checklists by hand
  into `data/` with the source URL and the date.
- **leginfo** returns 403 to scripts. Use its bulk downloads (https://downloads.leginfo.legislature.ca.gov/), or
  store the exact section text you rely on with its URL and date. The mirror at california.public.law is fine as a
  reference.
- **Personal information:** HCD letters name city staff and applicants' street addresses. Strip both before
  committing any letter text or excerpt. Never commit a real applicant's details.

## 10. Rules for the build (non-negotiable)

**Event rules**
- Never invent a statute, section number, fee, deadline, address or parcel fact. If a source doesn't say it, the
  answer is "unknown". A confident wrong answer is the worst outcome.
- Label every assumed number `ASSUMPTION` in the code, the UI and the README, and say what it is based on.
- Cite every claim about a law, program or dataset with a URL, a section number and the date checked.
- No personal information: test with made-up people. If something looks like real personal information, stop and
  tell the user.
- Public or provided data only. No scraping at volume: download once, cache, and respect each site's terms.
- Prototype only: never file, email or submit to a city or a person. Draft only.
- The UI says it is a prototype, not legal advice, and points users to a professional.
- No secrets in git. Keys go in environment variables. `.env` is gitignored and `.env.example` holds only the
  variable names.

**User's standards**
- TypeScript in strict mode, no `any` unless unavoidable.
- No file over 300 lines and no function over 50, but don't add abstraction just to hit the numbers.
- Tests must assert something meaningful. Lint and type-check clean.
- Never swallow errors. Log them with context. Add a `process.on('unhandledRejection')` handler at entry points.
- When `await`s are independent, use `Promise.all`.
- Required files: `.env.example`, `.gitignore` (`.env`, `.env.*`, `node_modules/`, `dist/`, `CLAUDE.local.md`),
  `.dockerignore`, `CLAUDE.md` and `tsconfig.json`.
- Structure: `src/`, `tests/`, `project-docs/`, `.claude/{commands,skills,agents}`, `scripts/`.
- Keep it simple: no database unless truly needed (versioned JSON rule files are expected). If a database is ever
  added, the user's standard is StrictDB.
- Commits: clear messages, commit often. No AI attribution or co-author lines in commits, PRs or the README.
  Never use the em dash character in any outward text.
- Ask the user before any deploy or push. Never assume approval.

## 11. Technical direction (suggestions; the plan decides and explains why)

- **Determinism first.** Flags and citations come only from a curated, sourced rule set (versioned JSON, with a
  source URL, section and checked date on every rule). Claude may help turn a pasted checklist into items, map items
  to rule IDs, and draft the response letter.
- **Validate every model output against the rule IDs.** An item that maps to no rule is `UNKNOWN`. The model never
  writes a citation.
- **A demo that runs without a key:** ship cached, labelled sample runs for Irvine and Anaheim, and make the live
  Claude call optional.
- **Model choice:** check model ids and pricing with the `claude-api` skill. The latest family is Claude 5:
  `claude-opus-5-5`, `claude-sonnet-5-5` and `claude-haiku-5-5`.
- **Stack:** a small TypeScript web app the judges can run with one command. A deployed live URL is optional and
  needs the user's yes first.
- **Scale story:** the same state law applies in all 34 OC cities and every California city. Adding a city means
  adding its saved checklist and its HCD letters, not new code.

## 12. What to do now

1. Use **seven orchestration** (no project brain) to make a **very high-level plan**:
   - the phases, the parallel tracks, and checkpoints to 2:30 (a runnable version by noon);
   - which model runs which task;
   - the gates (no push, deploy or paid run without the user's approval).
2. Present the plan in **lavish**, with visuals:
   - the features;
   - a map of which pain each feature solves and for which persona;
   - the data flow, from saved checklist to rule match to flags to draft letter;
   - the technical choices and why;
   - what is in and out of scope.
3. **Do not write application code** until the user approves the plan in lavish.

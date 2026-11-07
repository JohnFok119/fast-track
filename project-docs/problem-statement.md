# Fast Track: problem statement

Prototype for the Claude Impact Lab (UCI x SoCal Affordable Housing), Lane 2 "Clear it". Not legal, financial or lending advice. Talk to a professional before making decisions.

## The problem

Teachers, nurses, firefighters and other people who work in Orange County often can't afford to live here. They commute an hour or more each way, or leave. The event brief says a new affordable home takes about four years from finding land to move-in, and that delay adds cost. The brief's example (a made-up example, not real data) has waiting costs of $85k on a $535k home.

## Why the fast path is hard

The event brief describes a route to about two years: land that is already zoned, a ministerial approval (if the project meets the written rules, the city must say yes, with no hearing), and state-approved plans. Three state laws give ministerial paths that are part of that route: backyard units (ADUs), SB 9 duplexes and lot splits, and SB 684 small lot projects (maps of 10 or fewer parcels, Gov Code 66499.41). They do not cut the timeline to two years on their own.

These paths are hard to use because each of OC's 34 cities has its own forms and checklists, and some do not match state law. Example: in a March 27, 2025 letter, the state housing agency (HCD, the California Department of Housing and Community Development) found that Irvine "misapplied State ADU Law in the processing of ADU applications by requiring deed restrictions and disallowing JADUs in townhomes". HCD called the deed restriction "an additional standard" that "cannot be imposed" under Gov Code 66315. HCD sent its findings to the city on Jan 7, 2025, and a Feb 18, 2025 city email to an applicant still required the covenant. In a separate dispute in the same letter, about a JADU (junior ADU, a small unit inside a home) in a detached townhouse on its own lot, HCD says "the complainant chose to abandon their application".

HCD regularly issues letters like this. It publishes them in an online dashboard, which is separate from the city forms and checklists applicants actually fill out.

## Existing tools

Based on a review of their public pages on 2026-11-07, not a full audit:

- **Symbium Build** is a free tool for homeowners, now covering all of California. Enter an address to see whether an ADU fits and how big. It is our closest competitor for a "which path fits my lot" feature.
- **CivCheck** (acquired by Clariti) and **Archistar eCheck** are AI plan review tools that cities adopt to check drawings against city code. Some cities let applicants pre-check with them (Honolulu offers CivCheck; Vancouver runs an eCheck pilot). They check against the city's rules, not state law or HCD findings.
- **SoCal ADU Tracker** covers ADUs only. It has a per-city "state law check" that notes HCD letters, ADU permit timelines from state Annual Progress Report data, and a "what can I build" feature. We found no checklist-level comparison on its city page.

None of these check a city's actual checklist, line by line, against state law and the state's letters to that city, beyond ADUs, and then draft a response for the applicant.

## Who we're building for

First: an applicant blocked by a requirement the state says a city can't impose. That is a homeowner, a small builder, or a nonprofit project manager. Our research from public sources (not interviews) found that nonprofit project managers' biggest pains are timelines and funding rounds, so the checker helps them only where city rules drift from state law. Second: the city permit tech who wants to answer correctly. The people who benefit in the end are the local workers who move in sooner.

## What we're building

A free tool that compares an OC city's actual permit requirements with state law and HCD's letters to that city. Version 1 checks ADU requirements for Irvine and Anaheim, where the evidence is strongest: the HCD Irvine letter, and Anaheim's November 2025 ADU checklist, which still cites Gov Code 65852.2 and 65852.22 (renumbered to 66310 to 66342 by SB 477 in 2024). SB 9 comes next. A "which path fits this lot" view is a later step.

Each item is flagged OK, conflicts with state law (with statute and letter), outdated citation, or unknown. The tool drafts a response the applicant can send. It never sends anything. It also shows the legal deadlines that apply (for example the 60-day ADU decision clock) next to the city's requirements.

## Success looks like

- On Irvine's ADU requirements, the tool flags the deed restriction as conflicting with Gov Code 66315 and cites HCD's March 27, 2025 letter.
- On Anaheim's checklist, it flags the old 65852.2 citations as outdated.
- Every flag shows a source and a date.
- Anything the rule set does not cover says "unknown".

## Sources (checked 2026-11-07)

- [HCD letter to City of Irvine, March 27, 2025](https://www.hcd.ca.gov/sites/default/files/docs/policy-and-research/ordinance-review-letters/irvine-adu-ta-032725.pdf)
- [Anaheim ADU submittal checklist, November 2025](https://www.anaheim.net/DocumentCenter/View/35053/Accessory-Dwelling-Unit-Submittal-Requirements-Checklist)
- [HCD ADU Handbook, March 2026](https://www.hcd.ca.gov/sites/default/files/docs/policy-and-research/adu-handbook-update.pdf)
- Event challenge brief (four years, two-year path, made-up $535k example): `docs/challenge-brief.pdf` in the starter repo
- [Symbium Build](https://symbium.com/build)
- [Honolulu CivCheck](https://www.honolulu.gov/dpp/getting-started-with-civcheck/)
- [Archistar eCheck](https://archistar.ai/?p=30076) ; [Vancouver eCheck pilot](https://vancouver.ca/home-property-development/check-if-your-drawings-follow-regulations-echeck-pilot-program.aspx)
- [SoCal ADU Tracker (Huntington Beach page)](https://socaladutracker.com/adu-permits/huntington-beach)

## Claims to confirm before the pitch

- Whether any OC city has a published SB 684 application process. We could not verify this, so it is not claimed.
- The 60-day ADU decision clock: confirm the exact period and the Gov Code section against the HCD ADU Handbook before showing it.
- The "34 cities" count for Orange County: confirm against a current source.
- Whether the Irvine deed restriction is still being required today. Our evidence is the Feb 18, 2025 city email, so it may have changed.
- Competitor features may have changed since 2026-11-07. Re-check the public pages before the pitch.
- That nonprofit project managers and city permit techs would use the checker. This is untested with real users.

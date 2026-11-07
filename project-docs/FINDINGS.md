# Fast Track: findings log

The shared notebook. Each entry is dated and points to its source, with excerpts in `data/sources/`. Newest first.
Kept by Giuseppi's session.

## 2026-11-07

### Verified (D1: HCD letter to Irvine, 2025-03-27, `data/sources/hcd-irvine-2025-03-27.md`)

- HCD found the City "misapplied State ADU Law ... by requiring deed restrictions and disallowing JADUs in townhomes"
  (p. 1).
- HCD calls a deed restriction "an additional standard" barred by Gov 66315. HCD quotes the statute: "No additional
  standards, other than those provided in Section 66314, shall be used or imposed". Using the restriction to call an
  application incomplete is "inconsistent with section 66317, subdivision (c)" (pp. 1, 3).
- A 2025-02-18 city email still required the covenant and cited the old section 65852.2(a)(10) (p. 2).
- A "detached townhouse on its own lot is a single-family primary dwelling and would therefore be eligible for a
  JADU" (Gov 66333(a), p. 3). HCD adds that an HOA or other elements might make the home part of a planned
  community or "townhouse complex".

### Verified (D2: HCD ADU Handbook, March 2026, `data/sources/adu-handbook-2026-03.md`)

- **The renumbering table is on p. 49, not p. 13.** P. 13 gives only the whole-section range: 65852.2, .22, .23 and
  .26 moved to 66310 through 66342.
- **No old section has a single replacement.**
  - 65852.2 maps subsection by subsection to 66314 through 66331, and (a)(10) also appears under 66342.
  - 65852.22 maps to 66333 through 66339.
  - The tool therefore shows "no single replacement section" (`exactSection: null`) for both.
- The 2025 moves are confirmed on pp. 14 and 47: 66324 to 66311.5, 66327 to 66313.5, and 66332 to 66311.7, with
  66333.5 added.
- Clocks:
  - 15 business days to decide completeness, in writing (p. 34, 66317(a)(2)(A)).
  - The application is deemed complete if there is no timely determination (p. 35, 66317(a)(2)(F)).
  - 60 days to approve or deny after a complete application (p. 11, 66317(a)(3)). It is tolled only for a delay the
    applicant requests (p. 35).
- **The Habitat guard is supported.** An ADU deed restriction cannot be imposed (66315, 66314(b)(1), p. 21). A JADU
  ordinance must require a deed restriction (66333(c), p. 21). So JADU covenants are never flagged by the ADU
  covenant rule.

### Corrections to CONTEXT.md

- CONTEXT said 65852.22 maps to 66333. **The Handbook maps it to 66333 through 66339.** Fixed in the rules and the
  samples (commit 8f167b8).
- CONTEXT said "deemed approved" appears only for coastal permits. **The Handbook disagrees with itself:** p. 21
  says coastal only (66329(b)(5)), while p. 51 (the AB 3182 summary) says an application is deemed approved after
  60 days, citing 66317(a). It is shown as UNCONFIRMED until the statute text is read (D5).
- The Handbook gives two effective dates for SB 477: p. 13 says March 27, 2024 and January 1, 2025, while p. 48
  says March 25, 2024. Recorded as is; neither is used.

### Decisions on acceptance test 6 (both candidates come from the Irvine letter)

- **JADU in a detached townhouse: encoded** as rule `jadu-detached-townhouse` (CONFLICTS). It rests on HCD's
  analysis (p. 3), the statute text of 66333(a) as quoted by HCD, and the Handbook's definition of a single-family
  dwelling (p. 9). It is limited to a detached townhouse on its own lot.
- **"The 60-day clock stops when the City provides plan check comments": not encoded (UNKNOWN).**
  - HCD's letter does not analyze this claim.
  - The Handbook cuts both ways: "the 60-day countdown continues until the complete list is provided", but also "a
    subsequent application resets the 60-day period" (p. 36).
  - It waits on the statute text (D5).

### Open leads

- The starter's notes say **Irvine's current "Constructing an ADU" page lists a "covenant"** in its submittal list.
  Ivy is checking what it requires (D4). If it is the same deed restriction, the demo can point to the city's live
  page.

### Dead ends

- leginfo and anaheim.net return 403 to scripts. Use a browser, once.

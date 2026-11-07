# Fast Track: findings log

The shared notebook. Each entry is dated and points to its source, with excerpts in `data/sources/`. Newest first.
Kept by Giuseppi's session.

## 2026-11-07

### SB 9 rules (D6, D7: `data/rules/sb9.json`)

- **Rules are scoped to the city HCD wrote to.** HCD judged Dana Point's limits against Dana Point's own zoning,
  under the Housing Crisis Act (Gov 66300(b)(1)(A)), so the same words in another city are not checked. Rules cite
  only the HCD letters and name each statute as HCD cites it. Pasted text has no city, so it never gets them.
- **Dana Point (letter of 2023-04-17): 4 rules, CONFLICTS.** Two-unit cap on an unsplit duplex lot (p. 2, "would
  violate State ADU Law"); one-story limit (pp. 3-4, "must remove this reference or amend it", conditional on lost
  floor area); 800 and 1,600 sq ft caps (p. 4, "The City must remove these requirements"); one-bedroom limit (p. 4,
  "must revise"). Each rule's note says the letter is from 2023 and the Ordinance may have changed.
- **Dana Point items left UNKNOWN on purpose:** dp-02, attached units only (HCD says "should revise"); dp-03,
  affordability deed restriction (HCD says it "raises concerns" and "should remove"); dp-09, penalties (no statute).
- **Orange (letter of 2026-05-05): 1 rule, CONFLICTS.** No pathway to convert an ADU into a primary dwelling for an
  urban lot split (p. 2, "the City must provide the applicant with a regulatory pathway").
- **or-01 left UNKNOWN on purpose.** The City refused a split that would leave a parcel with only an ADU. HCD itself
  calls that parcel "not permissible under ADU law" (p. 1, citing Gov 66313(a)). The conflict HCD found is the missing
  pathway, which or-02 carries.
- **Not yet read:** the text of Gov 65852.21 and 66411.7 (D8). No statewide SB 9 rule until it is.

### Verified (D3: Anaheim ADU checklist, form Z412, NOV 2025, `data/sources/anaheim-adu-checklist-2025-11.md`, Ivy)

- One page, quoted word for word, contact details removed. It replaces the placeholder wording in
  `data/cities/anaheim.json` (now ana-01 to ana-06).
- The JADU owner occupancy covenant (ana-04) is "authorized by the California Government Code Sections 65852.2 and
  65852.22". Both were renumbered (Handbook p. 49), so ana-04 gets two OUTDATED_CITATION flags.
- **Open lead: the covenant itself may go too far.** The Handbook allows a JADU deed restriction limited to "only" a
  ban on separate sale and the unit's size and attributes (p. 21, citing 66333(c)(1) and (c)(2)), and requires JADU
  owner occupancy only when sanitation is shared (pp. 32-33). Anaheim's covenant requires owner occupancy "within one
  of the dwelling units" for all JADUs. Not flagged yet: no rule until the 66333 text is read on leginfo (D5). The
  rules exclude JADUs on purpose, so ana-04 shows only its outdated citations today.
- Sewer verification, meter spot report, new address, title report and grant deed (ana-01 to 03, 05, 06) stay
  UNKNOWN: no source we hold speaks to them.

### Partial (D4: Irvine's current ADU page, `data/sources/irvine-adu-current.md`, Ivy)

- The page's submittal list still includes a "Covenant obtained from Planning, notarized and recorded". The capture
  is a paraphrased list, not exact wording, so no rule runs on it.
- UNKNOWN: whether this covenant is the deed restriction HCD objected to in 2025. The covenant form's text is still
  needed. Until then the demo and README say only that the current page lists a covenant.
- The page says the City checks a submission's completeness in "approximately two business days" (paraphrased).

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
  60 days, citing 66317(a). **Update (D5):** the statute text of 66317(a)(3), read on a mirror, says the application
  "shall be deemed approved" after 60 days, so p. 51 is right. Still UNCONFIRMED until read on leginfo.
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

- **Irvine's current ADU page lists a covenant** (confirmed by Ivy, D4 above). What the covenant form requires is
  still open. If it is the same deed restriction, the demo can point to the city's live page.

### Dead ends

- leginfo and anaheim.net return 403 to scripts. Use a browser, once.

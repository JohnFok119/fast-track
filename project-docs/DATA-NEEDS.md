# Fast Track: data we need

Hand-off list for Ivy (data gathering) and Johnny (building, plus some data). Kept by Giuseppi's session.
Updated 2026-11-07, 12:18 PM. Submissions are due at 2:30 PM.

**Data gathering is Ivy's, with help from Johnny,** except D1 and D2: Giuseppi's sources agent is downloading those
two PDFs now. Giuseppi's session checks each hand-in (source, personal info, format) and turns it into rules.

**Ivy's order:** D4 and D3 first (the 12:45 demo), then D5, then the rest. Hand in each item as soon as it's done.
Don't batch them.

## Rules for anyone gathering data (read first)

1. **Never invent anything.** If the source doesn't say it, write `UNKNOWN`. A confident wrong answer is the worst
   outcome.
2. **Copy exact words, not summaries**, with the page number (PDF) or section heading (web page).
3. **Record the source** for every item: URL, publisher, date published, the date you viewed it, and how you got it.
4. **No scraping.** Open each page once in a normal browser and save it. Some sites (leginfo, anaheim.net) block
   scripts. That is expected, so use your browser.
5. **Remove personal information.** HCD letters name city staff and applicants and give street addresses. Never copy
   names (except the city's and HCD's), emails, phone numbers or addresses. Write `[staff]`, `[applicant]` or
   `[address]` instead. If you're unsure, leave it out and ask.
6. **Raw PDFs go in `data/raw/`.** That folder is never committed. Only the excerpts are.
7. **No em dash characters** in anything committed. Use a plain dash.

## How to hand in

- **One file per source:** `data/sources/<id>.md`, using the template below.
- **With git:** work on a branch named `data/<your-name>` and touch only the files for your items. Push it, and
  Giuseppi's session reviews and merges it at the next checkpoint (12:45, 1:15 or 1:45).
- **Without git:** send the `.md` file, or paste the text, to Giuseppi. We'll commit it and credit you.
- When an item is done, change its status in the table below, or tell us.

### Template

```markdown
---
id: hcd-irvine-2025-03-27
title: HCD letter to the City of Irvine (ADU technical assistance)
publisher: California Department of Housing and Community Development (HCD)
url: https://www.hcd.ca.gov/...
published: 2025-03-27
checked: 2026-11-07
captured_by: Ivy
how: opened in Chrome, saved the PDF to data/raw/
pii_removed: yes
---

## Excerpts

> "exact words from the source" (p. 2)

- Used for: the claim or rule this supports
- Notes: anything unclear, written as UNKNOWN or as a question
```

## The list

### Must have (the demo depends on these)

| ID | What | Where | Capture exactly | Owner | Needed by | Status |
|---|---|---|---|---|---|---|
| D1 | HCD letter to Irvine, 2025-03-27 | [PDF](https://www.hcd.ca.gov/sites/default/files/docs/policy-and-research/ordinance-review-letters/irvine-adu-ta-032725.pdf) | The "misapplied State ADU Law" finding. The deed restriction as an "additional standard" that "cannot be imposed" (Gov 66315). Calling an application incomplete without it (Gov 66317(c)). The 2025-01-07 findings date. The 2025-02-18 city email still requiring the covenant and citing 65852.2. HCD's analysis of the JADU townhouse dispute and of the claim that the "60-day clock stops when the City provides plan check comments". | Sources agent (Giuseppi's session) | 12:30 | done: data/sources/ (see FINDINGS.md) |
| D2 | HCD ADU Handbook, March 2026 | [PDF](https://www.hcd.ca.gov/sites/default/files/docs/policy-and-research/adu-handbook-update.pdf) | The p.13 renumbering table: every old to new pair, including 65852.2 and 65852.22, and the 2025 moves (66324 to 66311.5, 66327 to 66313.5, 66332 to 66311.7, and the new 66333.5). The pages on additional standards (66315), the review clocks (66317: 15 business days, 60 days), "deemed approved" (p.21), and the JADU deed restriction (66333). | Sources agent (Giuseppi's session) | 12:30 | done: data/sources/ (see FINDINGS.md) |
| D3 | Anaheim ADU Submittal Requirements Checklist, Nov 2025 | [anaheim.net](https://www.anaheim.net/DocumentCenter/View/35053/Accessory-Dwelling-Unit-Submittal-Requirements-Checklist) | Every line item word for word, with its page. Every Gov Code citation. The date printed on the form. | **Ivy** (open it once in your browser; the site blocks scripts) | **12:45** | done: `data/sources/anaheim-adu-checklist-2025-11.md`, now in `data/cities/anaheim.json` |
| D4 | **Irvine's current ADU page** | [cityofirvine.gov](https://cityofirvine.gov/building-permits-and-inspections/project-constructing-accessory-dwelling-unit-adu) | The submittal list, word for word. The starter's notes say it lists a "covenant". Open the covenant form if there is one and copy what it requires: no separate sale, owner occupancy, or something else? This tells us whether the demo can say Irvine's current page still asks for what HCD objected to. | **Ivy** | **12:45** | partial: paraphrased list in `data/sources/irvine-adu-current.md`. Still needed: the exact wording, and the covenant form's text |
| D5 | Statute text, confirmed in a browser | leginfo: [66315](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66315), [66317](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66317), [66333](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66333), [66314](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=66314) | The exact text of 66315; 66317(a)(2)(A), (a)(3) and (c); and the JADU deed restriction wording in 66333. Note the date you viewed each one. We currently have these from a mirror site only. | **Ivy** | 1:15 | todo |

### Should have (SB 9 and the pitch to Habitat OC)

| ID | What | Where | Capture exactly | Owner | Needed by | Status |
|---|---|---|---|---|---|---|
| D6 | HCD letter to Dana Point, 2023-04-17 (SB 9) | [PDF](https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/HAU/Dana-Point-TA-041723.pdf) | The city limits HCD quotes (800 sq ft, one story, one bedroom on lot splits), HCD's finding, and each statute cited. | Sources agent (Giuseppi's session) | 1:15 | done: data/sources/ (see FINDINGS.md) |
| D7 | HCD letter to the City of Orange, 2026-05-05 (SB 9) | [PDF](https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/HAU/orange-ta-050526.pdf) | What the city refused (an application filed 2025-10-08), HCD's finding, and each statute cited. | Sources agent (Giuseppi's session) | 1:15 | done: data/sources/ (see FINDINGS.md) |
| D8 | SB 9 statutes, confirmed in a browser | leginfo: Gov 65852.21 and 66411.7 | The subsections that HCD's Dana Point and Orange letters rely on. | Ivy | 1:30 | todo |
| D9 | Habitat for Humanity of Orange County | Their public website, and conversations at the event | What they build (for-sale homes? ADUs? where?), and any permitting pain they state publicly. Also anything Habitat staff tell you today about permits or delays. Write down what was said, never who said it. | Ivy | 1:30 | todo |
| D10 | "34 cities in Orange County" | A current official source (County of Orange, or OCCOG, the Orange County Council of Governments) | The count and its URL. | Ivy | 1:45 | todo |

### Nice to have (the scale story and the pitch)

| ID | What | Where | Capture exactly | Owner | Needed by | Status |
|---|---|---|---|---|---|---|
| D11 | Competitor re-check | [Symbium Build](https://symbium.com/build), [SoCal ADU Tracker](https://socaladutracker.com/adu-permits/huntington-beach) | Anything new or different from our notes in `project-docs/problem-statement.md`. | Johnny or Ivy | 2:00 | todo |
| D12 | Other HCD ADU letters to OC cities | HCD's online dashboard, browsed by hand (no scraping) | For each: city, date, URL, and a one-line finding. Just a list, no excerpts needed. | Ivy | 2:00 | todo |

## Known facts and corrections

- The starter repo (`claude-impact-lab-uci`) is a read-only reference. Its `DATA-SOURCES.md` lines 136-137 are out
  of date for Irvine fees: planning review is now $217.64/hr with a $1,500 deposit (effective 2026-08-15).
- "Deemed approved" for ADUs is unconfirmed. Sources disagree, so it is shown as UNCONFIRMED until D2 or D5 settles it.

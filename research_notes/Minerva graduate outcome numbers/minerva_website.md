# Minerva University undergraduate graduate-outcome numbers on Minerva's own websites

Method: every page below was fetched directly with `curl -L` from www.minerva.edu and converted to text on **2026-11-21** (the "read on" date for every row unless a page date is given). All quotations are copied verbatim, including Minerva's own typos. Webflow's site-wide "Last Published" stamp on every page fetched was "Fri Nov 20 2026 20:52:52 GMT+0000", so it dates the site build, not the page content. No page carries a "last updated" date for its statistics. Search-tool (WebSearch) summaries were used only to find URLs; every number below was confirmed by opening the page, except where marked "snippet only".

Redirects and missing pages observed on 2026-11-21:
- https://www.minerva.edu/impact-outcomes/ redirects to https://www.minerva.edu/student-impact/ (same content).
- https://www.minerva.edu/impact-outcomes-old/ is still live (HTTP 200). The "Outcomes" link in the parents-of-admits page menu points to it (`href="/impact-outcomes-old"`).
- https://www.minerva.edu/parents/, https://www.minerva.edu/outcomes/ and https://www.minerva.edu/why-minerva/ return 404.
- https://minerva.edu/undergraduate/majors-concentrations/ redirects to www and serves the same numbers.
- test.minerva.edu and origin-www.minerva.edu turned up in search, but the proxy refused them (403), so they were not read.

---

## 1. Overall outcome rate(s) Minerva publishes now, on which pages, for which cohorts

### Takeaway
Minerva's one current overall placement number is **91%**, stated on at least seven live pages. The definition changes from page to page ("working", "employed full-time", "full-time roles", "meaningful roles", "confirmed a full-time role or been admitted"), and two pages drop the six-month window. **No page gives the 91%'s denominator, cohort years or survey method.** The same pages also publish an internship rate (97%; one older page says 95%), a founder rate (12%), a grad-study rate (15%) and a startup count, and the pages disagree about the startup count (30 / 40+ / 100+).

### Cited Findings

**The 91% headline (every live instance found):**
- "91% of graduates are working or in graduate school within six months". No denominator or cohort given. — [Student Impact (/student-impact/, also served at /impact-outcomes/)](https://www.minerva.edu/student-impact/)
- "91% of graduates are employed full-time or in graduate school within 6 months of graduation" — [Undergraduate Program (/undergraduate/)](https://www.minerva.edu/undergraduate/)
- "91% of graduates are employed full-time or in graduate school within 6 months of graduation" (identical wording) — [Undergraduate Degrees (/undergraduatedegrees/)](https://www.minerva.edu/undergraduatedegrees/)
- "91% of graduates are in full-time roles or graduate school". **No time window.** — [Career Development (/undergraduate/career-development/)](https://www.minerva.edu/undergraduate/career-development/)
- "91% of our alumni are in full-time positions or in graduate programs." **No time window; says "alumni", not "graduates".** — [Counselors (/counselors/)](https://www.minerva.edu/counselors/)
- "91% Of graduates employed or in graduate school within 6 months" (no "full-time") — [About (/about/)](https://www.minerva.edu/about/)
- "91% of alumni have confirmed a full-time role or been admitted to a graduate program six months post-graduation." — [Experience Global Immersion at Minerva University](https://www.minerva.edu/experience-global-immersion-at-minerva-university/) (a landing page; no date shown)
- "91% of graduates are working in meaningful roles or pursuing advanced degrees within six months" — [Impact & Outcomes (old) (/impact-outcomes-old/)](https://www.minerva.edu/impact-outcomes-old/)
- The home page carries no percentage. It says "Alumni go on to selective graduate schools, earn prestigious scholarships such as the Rhodes, Diana, and Schwarzman Scholarships, build funded startups, and lead at organizations like Google, BCG, and the World Bank." and links "Explore Student Outcomes". — [Home](https://www.minerva.edu/)
- The parents-of-admits "Post-graduation outcomes" block does **not** use the 91%. Its numbers are "97% held an internship prior to graduation", "90% of managers rated performance above average", "Top employers include Google, McKinsey, Amazon, and the UN", "40+ student-founded ventures globally". — [Parents of Admits (/parents-of-admits/)](https://www.minerva.edu/parents-of-admits/)

**Companion statistics on the same pages:**
- Student Impact: "97% completed at least one internship before graduation"; "12% have founded or co-founded an organization"; "15% pursue graduate study or academic fellowships"; "Minerva alumni work across organizations including Google, McKinsey, DeepMind, and the World Bank."; network "100+ countries", "Dozens of industries", "Hundreds of organizations and ventures"; awards listed: "Rhodes Scholarship, Schwarzman Scholars, Diana Award, Forbes 30 Under 30, Goldwater Scholarship" — [Student Impact](https://www.minerva.edu/student-impact/)
- Impact-outcomes-old: "97% completed an internship before graduation"; "12% of graduates have founded or co-founded their current organization & secured start-up funding"; "15% continued with graduate school or academic fellowships"; "2 Rhodes Scholars", "2 Diana Awards", "2 Schwarzman Scholars", "3 Forbes 30 Under 30", "1 Goldwater Scholar"; "Minerva Alumni work across sectors at Google, NASA, McKinsey, DeepMind, the United Nations, and the World Bank. More than 100 student-founded ventures and nonprofits are active in the world today."; "Working at the United Nations, Meta, DeepMind, McKinsey, and NASA."; "Pursuing graduate study at Harvard, Oxford, Stanford, and MIT."; "Joining communities like the Fulbright Program, Rhodes Trust, and Global Shapers."; context line: "With just seven graduating classes and just over 1,000 alumni across our undergraduate and graduate programs". Named scholars: Jiayuan Tian (Class of 2025), Diana Award; Brittany Dick (Class of 2024), Rhodes Scholar; Jan Bartkowiak (Class of 2025), Schwarzman Scholar; Sophia Boler (Class of 2026), Goldwater Scholar ("Minerva's first-ever Goldwater Scholar"); Gal Rubin (Class of 2023), Rhodes Scholar. Alumni ventures: Seabound (Class of 2019), Econverse (Class of 2025 & 2027), Transcend Network (Class of 2019, "$160M raised across its network of 188 founders in 40 countries"); Wolu Chukwu (Class of 2022), computational biologist at the Broad Institute; Sattik Bhaumik FRAS (Class of 2024), Fellow of the Royal Astronomical Society. — [Impact & Outcomes (old)](https://www.minerva.edu/impact-outcomes-old/)
- Career Development: "87% of students secure internships after their first year"; "91% of employed alumni say Minerva prepared them for their job" — [Career Development](https://www.minerva.edu/undergraduate/career-development/)
- Undergraduate / Undergraduate Degrees: "Alumni have been admitted to Oxford, Stanford, Harvard, and other top graduate programs"; "Graduates work at organizations including Google, BCG, the World Bank, and leading nonprofits"; "Minerva alumni have earned the Rhodes Scholarship, Schwarzman Scholarship, Knight-Hennessy Scholarship, and the Diana Award"; "30 Founding purpose-driven startups in more than 30 countries" — [Undergraduate](https://www.minerva.edu/undergraduate/); [Undergraduate Degrees](https://www.minerva.edu/undergraduatedegrees/)
- About: "Alumni at Google, BCG, the World Bank, and leading organizations worldwide"; "Rhodes, Schwarzman, and Knight-Hennessy Scholarship recipients"; the same block also says "90% Of graduate students report career advancement after graduation" (graduate programs, out of scope) — [About](https://www.minerva.edu/about/)
- Counselors: "97% of students hold internships, contributing to our successful post-graduation track record."; "Class of 2023 Accomplishment Highlights: Rhodes Scholarship, Diana Award, Schwarzman Scholarship, 12 Millennium Fellows, Minerva team 2023 NASA Space Apps Challenge victory, 2 alums honored as Forbes' 30 Under 30 Europe Entrepreneurs Making a Social Impact". The page says "Minerva University graduates work at esteemed organizations, including:" and "Our alumni have enrolled in prestigious graduate schools, such as:", but both lists are images with no alt text, so the names cannot be read from the page source. — [Counselors](https://www.minerva.edu/counselors/)
- Experience Global Immersion: "95% of students have had a professional internship as they enter their fourth year."; "87% of students secured internships after their first year." — [Experience Global Immersion](https://www.minerva.edu/experience-global-immersion-at-minerva-university/)
- Nikkei announcement (Dec 20, 2024): "Notably, 12 percent of its graduates go on to start their own businesses." — [Nikkei journalists announcement](https://www.minerva.edu/announcements/nikkei-journalists-highlight-minerva-universitys-new-model-for-developing-global-citizens/)
- U.S. News announcement (Sep 22, 2026) has no placement rate, only "Minerva's four-year graduation rate stands at 79%." It cites "a 14:1 student-to-faculty ratio" (the About page says "11:1"). — [U.S. News 2027 rankings announcement](https://www.minerva.edu/announcements/minerva-university-ranks-no-1-in-three-categories-in-2027-u-s-news-best-colleges-rankings/)

**Disagreements between Minerva pages (overall level):**
- **What 91% counts.** Each page defines it differently: "working" (/student-impact/), "employed full-time" (/undergraduate/, /undergraduatedegrees/), "employed" (/about/), "in full-time roles" (/undergraduate/career-development/), "in full-time positions" (/counselors/), "confirmed a full-time role or been admitted to a graduate program" (/experience-global-immersion-.../), "working in meaningful roles or pursuing advanced degrees" (/impact-outcomes-old/). Two pages (career-development, counselors) give no six-month window.
- **Internships.** "97% completed at least one internship before graduation" ([Student Impact](https://www.minerva.edu/student-impact/)), "97% held an internship prior to graduation" ([Parents of Admits](https://www.minerva.edu/parents-of-admits/)) and "97% of students hold internships" ([Counselors](https://www.minerva.edu/counselors/)) versus "95% of students have had a professional internship as they enter their fourth year" ([Experience Global Immersion](https://www.minerva.edu/experience-global-immersion-at-minerva-university/)). The 87%-after-first-year figure is the same on both pages that carry it.
- **Founders.** "12% have founded or co-founded an organization" ([Student Impact](https://www.minerva.edu/student-impact/)) versus "12% of graduates have founded or co-founded their current organization & secured start-up funding" ([Impact-outcomes-old](https://www.minerva.edu/impact-outcomes-old/)) versus "12 percent of its graduates go on to start their own businesses" ([Nikkei announcement](https://www.minerva.edu/announcements/nikkei-journalists-highlight-minerva-universitys-new-model-for-developing-global-citizens/)).
- **Number of ventures.** "30 Founding purpose-driven startups in more than 30 countries" ([Undergraduate](https://www.minerva.edu/undergraduate/), [Undergraduate Degrees](https://www.minerva.edu/undergraduatedegrees/)) versus "40+ student-founded ventures globally" ([Parents of Admits](https://www.minerva.edu/parents-of-admits/)) versus "More than 100 student-founded ventures and nonprofits are active in the world today" ([Impact-outcomes-old](https://www.minerva.edu/impact-outcomes-old/)) versus "Hundreds of organizations and ventures" ([Student Impact](https://www.minerva.edu/student-impact/)).
- **Grad-study share.** "15% pursue graduate study or academic fellowships" ([Student Impact](https://www.minerva.edu/student-impact/)) sits beside the 91% "...or in graduate school". The per-college shares (section 2) run from 1% (B) to 43.5% (NS).
- **Student-to-faculty ratio** (not an outcome): "11:1" ([About](https://www.minerva.edu/about/)) versus "14:1" ([U.S. News announcement](https://www.minerva.edu/announcements/minerva-university-ranks-no-1-in-three-categories-in-2027-u-s-news-best-colleges-rankings/)).

### Inferences
- The live pages agree only on the number 91%, not on what it measures. The strictest wording ("employed full-time or in graduate school within 6 months of graduation") is on /undergraduate/ and /undergraduatedegrees/. The loosest ("working ... within six months") is on the current Student Impact page. Anyone quoting 91% should quote one page's wording and name that page.
- /impact-outcomes-old/ still loads and is linked from the parents-of-admits menu, but /impact-outcomes/ now redirects to /student-impact/. So /student-impact/ is the current outcomes page and /impact-outcomes-old/ is a stale page that is still reachable.
- The "95% ... as they enter their fourth year" figure (Experience Global Immersion) and the 2023 highlights on /counselors/ read as older content than the 97% figure on /student-impact/. Neither page has a date.

### Gaps
- No Minerva web page gives the sample size, cohort years, response rate or survey date behind the overall 91%, 97%, 12% or 15%.
- The employer and graduate-school lists on /counselors/ are logo images with no alt text and could not be read as text.
- The parents-of-admits page links per-college PDFs ("Graduate Outcomes Brochures ... Download the outcomes report for each college."), with file names like "[MARCH 2026] AH Grads after Graduation.pdf" (the same pattern for BZ, CS, NS, SS), hosted on cdn.prod.website-files.com. PDFs are out of scope for this note and were not opened. They are the likely source of the majors-page numbers (unverified).

---

## 2. Per-college numbers on the majors page, and whether concentration or other pages differ

### Takeaway
The majors page (read 2026-11-21) matches the numbers in the ATLAS app exactly for all five colleges. Every value, sample size and cohort range is confirmed. It also carries industry-share charts for **AH, CS and NS only** (none for B or SS) and graduate-school name lists for **B, CS and NS only**. None of the 27 concentration pages carries any outcome percentage. Checking the page's own arithmetic turns up three problems: SS's parts sum to 101% against a 93% headline; NS's "Graduate Education 50%" contradicts its "43.5% are pursuing an advanced degree"; and B's 94.8% headline only works if it includes the 1% in advanced degrees, which its wording leaves out.

### Cited Findings
All from [Majors & Concentrations](https://www.minerva.edu/undergraduate/majors-concentrations/), read 2026-11-21 ("By the Numbers" block of each college tab, then "Industries Where ... Majors Thrive" and "Continuing Studies"/"Career Prospects"):

**Arts & Humanities (AH)**
- "82% of AH graduates* are employed in various industries within six months of graduation"
- "18% of AH graduates* are pursuing advanced degrees within six months of graduation"
- "*Data collected from 104 AH college graduates from 2019 to 2023" (**the only college whose range stops at 2023**)
- Industries (label, then value, in page order): "Business 28%", "Graduate School 18%", "Education 18%", "Government, Law, and Public Policy 12%", "Media and Journalism 12%", "Engineering and Data Science 12%". Intro line: "Arts & Humanities graduates demonstrate versatility across industries."
- No graduate-school name list in the AH tab.

**Business (B; the footnote says "BZ")**
- "94.8% of Business graduates* are employed full-time or completing internships within six months of graduation."
- "*Data collected from 97 BZ college graduates from 2019 to 2025"
- "75.3% employed full-time"; "18.6% completing internships"; "1% enrolled in advanced degree programs"
- "Those students who pursued graduate studies have done so at institutions such as Brown University, King's College London, New York University, Oxford University, the University of Rochester, and more."
- No industry-share chart in the Business tab.

**Computational Sciences (CS)**
- "95.6% of CS graduates* are actively working or enrolled in advanced degree programs within six months of graduation."
- "*Data collected from 256 CS college graduates from 2019 to 2025"
- "74.2% entered full-time employment directly"; "11.1% pursued internships"; "10.3% pursued advanced degrees"
- "Minerva students who pursued graduate studies have done so at institutions such as Brown University, Caltech, Cambridge University, Cornell University, Duke University, Stanford, Princeton, Harvard University, UC Berkeley, Johns Hopkins, and more!"
- Industries: "Big Tech and Software 44.5%", "Academia and Research 17.6%", "Startups and Entrepreneurship 14.5%", "Finance and Consulting 10.9%", "Social Impact and Government 8.2%". Intro: "While Big Tech attracts the largest share, the data shows a broad ecosystem spanning startups, academia, finance, consulting, and social impact."

**Natural Sciences (NS)**
- "85% of Natural Sciences graduates* are pursuing an advanced degree or employed full-time within six months of graduation."
- "*Data collected from 46 NS college graduates from 2019 to 2025"
- "43.5% are pursuing an advanced degree"; "41.3% are employed full-time"
- "Minerva students who pursued graduate studies have done so at institutions such as Harvard University, Caltech, Cambridge University, Karolinska Institute, Oxford University, Johns Hopkins University, Princeton University, and many others."
- Industries: "Graduate Education 50%", "Consulting and Entrepreneurship 17.4%", "Education 15.2%", "Healthcare and Biotech 6.5%". Intro: "The program serves as a launchpad for graduates entering graduate school, healthcare, biotechnology, technology, and consulting."

**Social Sciences (SS)**
- "93% of Social Science graduates* are employed full-time or enrolled in advanced degree programs within six months of graduation."
- "*Amoung the 105 surveryed graduates with Social Sciences as their sole major, from 2019 to 2025" (typos are Minerva's; **the only college that says "surveyed" and restricts to sole majors**)
- "74% entered full-time employment directly"; "20% enrolled in graduate school"; "7% pursued internships"
- No industry-share chart and no graduate-school name list in the SS tab.

**Confirmation against the ATLAS app values (taken 2026-11-21):** AH 82/18 (n=104, 2019–2023): confirmed. B 94.8/75.3/18.6/1 (n=97, 2019–2025): confirmed. CS 95.6/74.2/11.1/10.3 (n=256, 2019–2025): confirmed. NS 85/43.5/41.3 (n=46, 2019–2025) and "Graduate Education 50%": confirmed. SS 93/74/20/7 (105 sole-major SS graduates, 2019–2025): confirmed. The non-www host serves identical numbers ([minerva.edu majors](https://minerva.edu/undergraduate/majors-concentrations/)).

**Concentration pages:** all 27 concentration URLs linked from the majors page were fetched (applied-problem-solving, arts-and-literature, brand-management, cells-and-organisms, chemistry-across-scales, cognition-brain-and-behavior, computer-science-and-artificial-intelligence, contemporary-knowledge-discovery, data-science-and-statistics, design-across-the-humanities, designing-societies, earth-and-environmental-systems, economics-and-society, empirical-approaches-to-the-social-sciences, enterprise-management, global-and-comparative-humanities, historical-forces, interpretation-and-meaning, managing-operational-complexity, mathematics, matter-and-energy, new-business-ventures, philosophy-ethics-and-the-law, politics-government-and-society, scalable-growth, strategic-finance-business, theory-and-analysis-in-the-social-sciences). Each returned a full page (about 9–12 KB of text) containing **zero percentage figures** and no outcome statistics. — e.g. [Mathematics concentration](https://www.minerva.edu/concentrations/mathematics/), [Matter and Energy](https://www.minerva.edu/concentrations/matter-and-energy/)

**Per-college numbers elsewhere:** the parents-of-admits page summarizes NS as "Research-driven curriculum with strong post-grad outcomes." with no number, and links the per-college PDFs (see Gaps). — [Parents of Admits](https://www.minerva.edu/parents-of-admits/)

### Inferences (my arithmetic, not Minerva's statements)
- **SS adds up to more than 100%:** 74 + 20 + 7 = 101%. The headline's own categories (full-time + advanced degree) give 74 + 20 = 94%, not the stated 93%. With n=105, 74% ≈ 78 people, 20% = 21 and 7% ≈ 7, which is 106 people, more than 105. The SS breakdown cannot all be true at once.
- **NS chart contradicts the NS headline block:** "Graduate Education 50%" (23 of 46) versus "43.5% are pursuing an advanced degree" (20 of 46). Every NS figure is an exact multiple of 1/46 (43.5% = 20/46, 41.3% = 19/46, 17.4% = 8/46, 15.2% = 7/46, 6.5% = 3/46), so both blocks use the 46-graduate base, yet they disagree by three people. The NS industry shares sum to 89.1%.
- **The Business headline includes advanced degrees, though its wording doesn't say so:** 75.3% + 18.6% + 1% = 94.9%. With n=97: 73/97 = 75.26%, 18/97 = 18.56%, 1/97 = 1.03%, and (73+18+1)/97 = 94.85%, which matches "94.8%". Full-time plus internships alone is 91/97 = 93.8%. So the 94.8% evidently counts the one advanced-degree graduate, but the page describes it as "employed full-time or completing internships".
- **CS percentages don't all map to whole people out of 256:** 11.1% of 256 = 28.4 (28/256 = 10.94%, 29/256 = 11.33%), and 10.3% = 26.4 (26/256 = 10.16%, 27/256 = 10.55%). The parts sum to the headline (74.2 + 11.1 + 10.3 = 95.6), and the CS industry shares sum to 95.7%. Some CS shares were probably computed on a base other than 256 (e.g. respondents only). This is unverified.
- **AH: 82% + 18% = 100%.** The page shows no unemployed or unknown category, the cohort range is two years shorter (2019–2023) than every other college's, and the AH "Graduate School 18%" industry bar matches the 18% advanced-degree figure.
- **The per-college samples sum to 608** (104 + 97 + 256 + 46 + 105). The SS footnote says "sole major", and the others give no double-major rule, so double majors may be counted in more than one college. Weighting each college's advanced-degree share by its n gives about 14% (≈87/608), close to the site-wide "15% pursue graduate study or academic fellowships". The 91% overall cannot be reconstructed from the college figures, because the colleges count internships differently (B and CS include them; NS's headline doesn't mention them).
- The definitions differ by college: AH counts "employed in various industries" with no full-time qualifier; B counts full-time or internships; CS counts "actively working" (includes internships); NS and SS count full-time or advanced degrees. The five headline rates are not directly comparable.

### Gaps
- No page explains how the per-college numbers were collected (survey versus records), what the response rate was, or how double majors were assigned (beyond SS's "sole major" note).
- No industry breakdown is published on the web pages for Business or Social Sciences, and no graduate-school list for AH or SS.
- The per-college PDF brochures (dated "MARCH 2026" in their file names) were out of scope and not opened, so I could not check whether they show different or more detailed figures than the majors page.

---

## 3. Class-year posts and commencement announcements

### Takeaway
None of the "Beyond Graduation" posts (Classes of 2022–2026) or the 2026 commencement announcement publishes a percentage employed or in graduate school. They are profiles of a few named graduates and their destinations. The 2026 commencement release adds a count of graduates, named destinations and a running tally of scholarships.

### Cited Findings
- **Class of 2022 Beyond Graduation (May 23, 2022):** "Our undergraduate Class of 2022 will embark on a new journey after graduation on May 24, 2022." Profiles: Simon (Sweden; Computational and Natural Sciences), "Ph.D. in Geochemistry" at Caltech; Verina (Egypt; CS), "will join Google as a software engineer"; Natalia (Brazil; SS), University of Oxford "Masters's Degree in Psychological Research"; Anuungo (Mongolia; Business and Natural Sciences), plans "to start a business at the intersection of fashion and sustainability"; Camila (Brazil; SS and AH), "will explore a career in human rights law." No percentages. — [Class of 2022 Beyond Graduation](https://www.minerva.edu/blog/class-of-2022-beyond-graduation/)
- **Class of 2023 Beyond Graduation (August 25, 2023):** graduation "May 23, 2023". Profiles: Mahmoud (NS), "Computational Biologist at Eli Lilly & Company"; Ariane (SS), "Master of Public Administration in Environmental Science and Policy at Columbia University's School of International and Public Affairs"; Sichen (Business), "Business Data Analyst at Intuit"; Parker (CS), "Software Engineer" at "Walmart Global Tech"; Udodirim (Business and CS), "full-time Product Manager at Microsoft". No percentages. — [Class of 2023 Beyond Graduation](https://www.minerva.edu/blog/class-of-2023-beyond-graduation/)
- **Class of 2024 Beyond Graduation (June 19, 2024):** Profiles: Rhali (CS), "Ph.D. in Planetary Science at the University of Colorado Boulder"; Zoe (SS and AH), "Master's in Public Health at the University of Edinburgh"; Rebeca (CS and NS), "Prism, a post-bachelor program at Novartis"; Aroma (CS), "future Software Engineer at Microsoft". No percentages. — [Class of 2024 Beyond Graduation](https://www.minerva.edu/blog/class-of-2024-beyond-graduation/)
- **Class of 2025 Beyond Graduation (May 20, 2025):** Profiles: Nicole (CS and AH, Brazil), "joining Google as a User Experience Interaction Designer"; Dimitar (NS, Bulgaria), "Ph.D. in Human Evolutionary Biology at Harvard University"; Yike (CS and AH, China), "Master's in Health Data Science at Harvard University with a 100% Harvard Chan scholarship" (the only "%" in the post, and it is a scholarship, not an outcome rate); Jiayuan (AH and SS, China), "Master of International Affairs at Columbia University's School of International and Public Affairs (SIPA)"; Koosha (SS, United States), "will lead product development at an AI software company". — [Class of 2025 Beyond Graduation](https://www.minerva.edu/blog/class-of-2025-beyond-graduation/)
- **Beyond Graduation: Where the Class of 2026 Is Headed (August 14, 2026):** "Meet four Class of 2026 graduates beginning careers in finance, technology, research, and entrepreneurship around the world." Profiles: Shazil (CS and Business), "World Bank Treasury as a Quantitative and Financial Technology Analyst"; Katerina ("an Economics and Operations major from Indiana"), "JPMorganChase in Boston as an analyst in the Securities Services Leadership Program"; Vitória (SS and NS, Brazil), "University of Massachusetts Amherst as lab manager of the Cognitive Developmental Cross-Cultural Psychology Lab"; Mariana Vilela Konovaloff Jannotti ("a Computer Science and Business major"), "founding team of an early-stage AI startup backed by a16z speedrun". No percentages. — [Class of 2026 Is Headed](https://www.minerva.edu/blog/beyond-graduation-where-the-class-of-2026-is-headed/)
- **2026 commencement announcement (dateline May 28, 2026):** "honoring nearly 120 undergraduate and graduate students representing more than 40 countries"; "Minerva's eighth graduating class since the university's founding in 2012"; "Graduates from the Class of 2026 have secured opportunities across technology, finance, sustainability and research, including graduate study at the University of Oxford and roles at organizations such as Encord, Vanguard and CDP."; "Minerva students and alumni have also earned recognition including two Rhodes Scholarships, two Schwarzman Scholarships, two Diana Awards, one Goldwater Scholarship and three Forbes 30 Under 30 honors." No placement percentage. — [2026 Commencement announcement](https://www.minerva.edu/announcements/minerva-university-celebrates-2026-graduates-at-commencement-ceremony-in-san-francisco/)
- A guessed URL for a 2025 commencement release (".../minerva-university-celebrates-2025-graduates-at-commencement-ceremony-in-san-francisco/") returns 404.

### Inferences
- The class-year posts are anecdotes; they give no per-class rates. Any per-class placement percentage would have to come from somewhere other than these pages (for example the PDFs, out of scope here).
- The scholarship tally (2 Rhodes, 2 Schwarzman, 2 Diana, 1 Goldwater, 3 Forbes 30 Under 30) is the same in the 2026 commencement release and on /impact-outcomes-old/, so it is consistent across those pages. /counselors/ lists the Class of 2023's "2 alums honored as Forbes' 30 Under 30 Europe", a different and older count.
- Several 2026 profile majors are named "Economics and Operations" and "Computer Science and Business", which are not the five college names. They may reflect new majors or loose wording; I did not check this.

### Gaps
- No Minerva web page publishes an employed or grad-school percentage for any single graduating class (2019–2026).
- I did not locate commencement announcements for earlier years to compare their figures.

---

## 4. Other pages (/student-impact, /impact-outcomes, /undergraduatedegrees, /undergraduate/career-development, /parents, /parents-of-admits, /counselors): which carry numbers, and which are current

### Takeaway
Every page in the brief except /parents (404) carries outcome numbers. They all lean on the same 91% / 97% / 12% / 15% set, with the inconsistencies listed in section 1. /student-impact/ (which /impact-outcomes/ now redirects to) is the current outcomes page. /impact-outcomes-old/ and the Experience Global Immersion landing page are older but still live. The parents-of-admits page is the only web page linking the per-college "[MARCH 2026]" outcome brochures.

### Cited Findings
- /impact-outcomes/ → redirects to /student-impact/: 91% / 97% / 12% / 15% (wording in section 1). — [Student Impact](https://www.minerva.edu/student-impact/)
- /undergraduatedegrees/: 91% "employed full-time or in graduate school within 6 months of graduation", plus the "30" startups line. — [Undergraduate Degrees](https://www.minerva.edu/undergraduatedegrees/)
- /undergraduate/career-development/: 87% (internships after first year), 91% (full-time roles or graduate school, no window), 91% (employed alumni say Minerva prepared them). — [Career Development](https://www.minerva.edu/undergraduate/career-development/)
- /parents/: HTTP 404 on 2026-11-21. — https://www.minerva.edu/parents/
- /parents-of-admits/: 97% internship, 90% managers' ratings, 40+ ventures, "Top employers include Google, McKinsey, Amazon, and the UN", and links to five per-college "Graduate Outcomes Brochures" (file names "[MARCH 2026] AH/BZ/CS/NS/SS Grads after Graduation.pdf"). It also links a "Completion and Retention Rates - November 2025" PDF and an "Evidence of Student Learning at Minerva University 2025" PDF (not opened; out of scope). — [Parents of Admits](https://www.minerva.edu/parents-of-admits/)
- /counselors/: 91% (no window), 97% internships, Class of 2023 highlights; employer and grad-school logos with no readable names. — [Counselors](https://www.minerva.edu/counselors/)
- /about/: 91% "employed or in graduate school within 6 months". — [About](https://www.minerva.edu/about/)
- /resources/student-retention-and-graduation-rates/: no placement percentage in the page text. — [Student Retention and Graduation Rates](https://www.minerva.edu/resources/student-retention-and-graduation-rates/)
- FAQs: no outcome percentage; only "Minerva has dedicated career support services to help you ... launch your career upon graduation." — [FAQs](https://www.minerva.edu/faqs/)
- Search snippet (snippet only; I opened and confirmed the page itself): the search tool described /counselors/ as "about 956 days old". That age comes from the search index, not from the page.

### Inferences
- "Current" in practice: /student-impact/, /undergraduate/, /undergraduatedegrees/, /about/, /undergraduate/career-development/ and the majors page share the current site design and navigation. /impact-outcomes-old/ (its "seven graduating classes" line predates the 2026 release's "eighth graduating class") and the Experience Global Immersion page (95% internship figure) are older content left online. The /counselors/ 2023 highlights also look dated.
- No Minerva web page gives a basis (n, cohorts) for the 91%. The only cohort-qualified outcome figures on the web are the per-college majors-page numbers.

### Gaps
- Page-level publish dates are unavailable for the static pages. Webflow's stamp is site-wide (Nov 20, 2026) and the server sends no Last-Modified header.
- test.minerva.edu and origin-www.minerva.edu, which may hold staging or older copies of the majors page, were blocked by the proxy (403) and not compared.

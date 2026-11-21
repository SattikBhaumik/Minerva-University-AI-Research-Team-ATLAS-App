# ATLAS pathway research

Status: research round 3, 2026-11-21. Nothing here is final product copy.

## Round 3 (2026-11-21): the official course catalog

Source: Minerva University Course Catalog, Revision 2026.v410 (published
2026-11-16; latest at https://minerva.edu/academics/course-catalog-pdf/).
It is newer than the website and wins where they disagree.

- **Pipeline.** `tools/parse_catalog.py` turns the PDF text into
  `data/catalog/catalog-2026.v410.json` (5 majors, 28 concentrations, 17
  minors, 203 courses). `tools/build_pathways.py` builds the site's
  `data/pathways.json` and the full per-college tables in
  `docs/research/atlas-catalog-2026.md` from it, plus
  `data/catalog/outcomes.json` (each college's published outcomes,
  transcribed verbatim) and `data/catalog/editorial.json` (the only
  hand-written words: the preference questions, for the owner to approve).
- **Checked.** Five independent per-college checks against the catalog text
  found every core course, concentration, course list, prerequisite and
  minor correct; three wording fixes were applied (CS111 *and* CS113 for
  NS142, B110/B111 as corequisites, the "3 concentration courses" rule).
  `js/pathways.test.js` now fails if the site shows any course code that is
  not in the catalog.
- **Resolved from round 2.** Natural Sciences majors take *either* NS110U
  or NS110L. NS152 needs NS110L or NS110U, plus NS113. CS144 needs CS111
  (the website said CS114). NS156 is now "Modeling and Measuring
  Environmental Systems"; NS146 and NS156 have their correct descriptions.
- **New rules that shape the design.** Declaring a concentration is
  optional in Business, Computational, Natural and Social Sciences: every
  major takes 3 concentration courses either way. Arts and Humanities takes
  3 of 4 core courses and at least one course from each of three tracks.
  Every major takes at least 20 credits from other colleges. A degree holds
  one or two majors and up to two minors.
- **New codes.** Cornerstones are year-long pairs: FA50/51, EA50/51,
  CX50/51, MC50/51 (formerly CS, NS, SS, AH 50/51). Integrated Learning
  IL91 to IL98 runs across four years. Capstone: CP191, CP192 seminars,
  CP193, CP194 directed study, CP196 Manifest.
- **Counts.** Concentrations per college: Arts and Humanities 6, Business
  6, Computational Sciences 6 (new: Intelligent Software Systems, which has
  no catalog description), Natural Sciences 4, Social Sciences 6.
- **Outcomes (2026-11-21).** `reports/Minerva graduate outcome numbers.md`
  traces every per-college figure to Minerva's "[MARCH 2026] Grads after
  Graduation" brochures (classes 2019 to 2025; AH 2019 to 2023). The site
  cites those brochures, says no outside source has checked the figures,
  flags where Minerva's own numbers do not add up (SS 101%, NS 50% vs
  43.5%), and shows the 83.76% six-year completion rate (Nov 2025).
- **Site design now.** The applicant answers two preference questions
  (three options, then two), which point to a likely college; real courses
  show at every step. Longer lists (other colleges for electives, six
  concentrations) are staged three at a time behind "More", in catalog
  order, except that a college whose courses your major needs comes first.
  The plan at the end lists the course codes picked.

**How the facts were gathered.** Round 1 (2026-11-04) used web-search
summaries because `minerva.edu` was blocked. Round 2 read Minerva's pages
directly:

- Majors page, Natural and Computational Sciences tabs:
  https://www.minerva.edu/undergraduate/majors-concentrations/
- Undergraduate overview: https://www.minerva.edu/undergraduate/
- Four-year curriculum: https://www.minerva.edu/undergraduate/4-year-curriculum/
- Concentration pages: https://www.minerva.edu/concentrations/matter-and-energy/
  and https://www.minerva.edu/concentrations/mathematics/

Everything below marked **(page)** is quoted or closely paraphrased from
those pages as read on 2026-11-18. Minerva's pages contain copy errors
(section 5), so a human should still spot-check before launch.

**Product rules this research has to serve**
- Show a few choices at a time, never the whole path, never so many options
  that an applicant backs away from applying. Hard cap: 3 options.
- Never use applicant data: no accounts, no analytics, no server storage.
- `AGENTS.md`: no AI-written lists or copy in the product. Course names,
  numbers, examples and lists come from Minerva's pages. The short plain
  descriptions in the demo are ATLAS's own and labeled as such.

---

## 1. The spine (page)

| Stage | Where | What happens |
|---|---|---|
| Year 1, Foundation | San Francisco | Four Cornerstones: Formal Analyses (CS51; logic, statistics, algorithmic thinking), Empirical Analyses (NS51; research design, hypotheses), Multimodal Communications (writing, speaking, visual design, debate), Complex Systems (collaboration, negotiation, leadership). Civic projects with city partners. |
| Year 2, Direction | Tokyo | Core courses of your major, plus **electives from core courses offered in other majors**. |
| Year 3, Focus | Buenos Aires and a European experience | Pick a concentration, take its courses, begin capstone courses, plus electives (other concentrations, other colleges). |
| Year 4, Synthesis | same | Finish capstone, senior tutorials in the major, more electives. Capstones are presented at Manifest. |

- "Locations are subject to change." (page)
- Majors: Arts and Humanities, Business, Computational Sciences, Natural
  Sciences, Social Sciences.
- "Students may also design custom concentrations with faculty guidance."
  (four-year page)
- Capstone forms (page): develop a business or social venture, build a
  technological solution, conduct original research, create a piece of
  creative work.
- Formal Analyses is CS51 and Empirical Analyses is NS51: that is what the
  "CS51" and "NS51" prerequisites on course pages mean. CS51B Programming
  is also listed as a CS110 prerequisite.

**Key design finding (unchanged).** Minerva has no physics or math major.
Physics lives in Natural Sciences (Matter and Energy). Math lives in
Computational Sciences (Mathematics). The first screen translates interest
into Minerva's vocabulary.

---

## 2. Natural Sciences (page)

**Core (Year 2), as listed today:** NS110L Physics of Life, NS110U Physics
of the Universe, NS111 Implications of Earth's Cycles, NS112 Evolution
Across Multiple Scales, NS113 Chemical Structure and Reactivity.

- NS110U lists CS111 calculus as a prerequisite; NS110L lists only CS51.
- Round 1 said a student takes one of NS110L or NS110U (2023 catalog). The
  current page lists both as core and does not say "one of". Treat as
  unresolved; the demo no longer offers this as a choice.

**Concentrations (four; the page says courses below):**

| Concentration | Courses |
|---|---|
| Matter and Energy | NS142 Quantum Nature of Matter: Theory and Applications; NS152 Analyzing Matter and Molecules; NS162 Statistical Mechanics: Theory and Applications |
| Chemistry Across Scales | NS152 Analyzing Matter and Molecules; NS154 Life's Chemistry; NS156 Monitoring and Modeling Earth's Systems |
| Cells and Organisms | NS144 Genes to Organisms; NS154 Life's Chemistry; NS164 Solutions From and For Life |
| Earth and Environmental Systems | NS146 Integrating Earth's Systems; NS156 Monitoring and Modeling Earth's Systems; NS166 Keeping Earth Habitable |

Physics-track prerequisites (Matter and Energy page):
- NS142 needs NS110U, CS111 and CS113.
- NS162 needs CS111, NS110L, NS110U and NS113; CS114 recommended.
- NS152 needs NS110L, NS110U and NS113; CS111 recommended.

So the physics track leans on three Computational Sciences courses
(CS111, CS113, CS114). Year 2 electives from the Computational Sciences core
are how a Natural Sciences student gets them.

**Summers and research (page):** in-semester lab work (for example National
Taiwan University, Hanyang University); summer research at the Harvard Stem
Cell Institute, MD Anderson Cancer Center, San Diego Zoo Wildlife Alliance.

**Past capstones (page):** a computational pipeline manual for biologists;
stem cell delivery for neural tissue repair using nanomaterial scaffolds;
sustainable sunscreens; early breast cancer detection.

**After Minerva (page):**
- n = 46 Natural Sciences graduates, 2019 to 2025: 85% pursuing an advanced
  degree or employed full-time within six months; 43.5% advanced degree;
  41.3% full-time work.
- Industry shares: Graduate Education 50%, Consulting and Entrepreneurship
  17.4%, Education 15.2%, Healthcare and Biotech 6.5%. (Graduate Education
  50% and "43.5% pursuing an advanced degree" are different measures; the
  page does not explain the gap.)
- Careers: researcher, lab technician, science consultant, computational
  biologist, bioinformatician, environmental educator, conservation
  specialist, medical technologist.
- Graduate schools named: Harvard, Caltech, Cambridge, Karolinska
  Institute, Oxford, Johns Hopkins, Princeton.

---

## 3. Computational Sciences (page)

**Core (Year 2):**
- CS110 Problem Solving with Data Structures and Algorithms (needs CS51 and
  CS51B Programming)
- CS111 Single and Multivariable Calculus (needs CS51)
- CS113 Theory and Applications of Linear Algebra (needs CS51; CS111
  recommended)
- CS114 Probability and Statistics and the Structure of Randomness (needs
  CS111)

**Concentrations (five):**

| Concentration | Courses |
|---|---|
| Mathematics | CS144 Real Analysis (needs CS114); CS154 Analytical and Numerical Methods in Differential Equations; CS164 Optimization Methods |
| Computer Science and Artificial Intelligence | CS142 Theory of Computation; CS152 Theory and Applications of Artificial Intelligence; CS162 Software Engineering: Building Powerful Applications |
| Data Science and Statistics | CS146 Computational Methods for Bayesian Statistics; CS156 Finding Patterns in Data with Machine Learning; CS166 Modeling and Analysis of Complex Systems |
| Applied Problem Solving | CS162 Software Engineering; CS164 Optimization Methods; CS166 Modeling and Analysis of Complex Systems |
| Contemporary Knowledge Discovery | CS152 Theory and Applications of AI; CS154 Differential Equations; CS156 Machine Learning |

**Summers (page):** competitive internships; Minerva lab programs such as
the AI Lab in Tokyo and an AI and Machine Learning exchange with Landshut
University, Germany.

**Past capstones (page):** optimal strategies for winning Monopoly; a
web platform with interactive simulations that teach personal finance; a 3D
video game with polygon racers; an iOS app with a machine learning model
for plant care.

**After Minerva (page):**
- n = 256 Computational Sciences graduates, 2019 to 2025: 95.6% working or
  in advanced degree programs within six months; 74.2% full-time
  employment; 11.1% internships; 10.3% advanced degrees.
- Industry shares: Big Tech and Software 44.5%, Academia and Research 17.6%,
  Startups and Entrepreneurship 14.5%, Finance and Consulting 10.9%, Social
  Impact and Government 8.2%.
- Careers: entrepreneurship, software engineering, tech consultancy, machine
  learning engineering, technical product management, ethical AI research,
  CTO, data science.
- Graduate schools named: Brown, Caltech, Cambridge, Cornell, Duke,
  Stanford, Princeton, Harvard, UC Berkeley, Johns Hopkins.

---

## 4. Pathway design elements

These are proposals, not facts about Minerva.

### Element schema

```
Stage    id, label, yearBand          // Start, Year1..Year4, After
Step     prompt, items[], note        // a fixed thing, no choice
Choice   prompt, options[2..3]
Option   label, whatYouDo, facts[], keepsOpen, source {label, url}, next
PathState  chosen option ids          // URL fragment only
```

### Rules

1. **Entry translates interest into Minerva terms.**
2. **Reveal rule.** Show the current choice and the next step only.
3. **Option cap: three.** The meta-analytic evidence on choice overload is
   mixed (average effect near zero, larger when choices are complex,
   preferences unsure and goals unclear). Applicants sit in that high-risk
   zone, so three is a judgment call. Enforced by `js/pathways.test.js`.
4. **Overflow goes behind "More".** When Minerva offers more than three
   (Natural Sciences has 4 concentrations, Computational Sciences 5), show
   the two closest to the applicant's stated interest and a third tab that
   opens the rest as a new layer. Nothing is hidden, only staged.
5. **Fixed things are not choices.** Cornerstones and core courses are one
   step each. A choice appears only where the applicant truly has one: the
   major, Year 2 electives from another major's core, the concentration,
   and the after-Minerva direction.
6. **Keep-open line on every option**, grounded in prerequisites where
   possible (for example: CS111 and CS113 from the Computational Sciences
   core keep the Matter and Energy track open).
7. **Free backtracking.**
8. **Honest numbers.** Always show n, cohort and source. Natural Sciences
   n = 46 is small.
9. **Do not hide cost.** Prerequisites stay visible.
10. **No applicant data.** Picks live in the URL fragment only.
11. **Close with the applicant's words**, using real past capstones as
    prompts.
12. **Labels.** "Catalog as of" date and a source link on every card, and
    a notice that this is an example, not admissions advice.

### Learning-orientation check

Deepens understanding (teaches Minerva's real structure and prerequisite
chains), invites participation (the applicant builds the path), supports
agency (no recommendations, links to the live catalog), clarity (static
data, a few screens). Strongest case against: an applicant may read the
example as a promise. Mitigation: date stamps, source links, notice.

---

## 5. Conflicts and page errors (needs a human)

Resolved in round 2:
- CS51 is the Formal Analyses Cornerstone; NS51 is Empirical Analyses.
- CS144 prerequisite is CS114 on the current page.
- Full course lists for all nine NS and CS concentrations (tables above).
- Manifest still exists (four-year page).

Still open (round 3 resolved the NS110L/NS110U and NS152 questions; see top):
- **Graduate Education 50% versus 43.5% advanced degree** for Natural
  Sciences; different measures, unexplained.

Copy errors on Minerva's majors page (do not reuse this text):
- NS142's description on the majors page is a copy of CS144 Real Analysis,
  with prerequisite CS114. The Matter and Energy page has the correct text
  (quantum mechanics; needs NS110U, CS111, CS113).
- NS146 Integrating Earth's Systems shows the description of CS152 (AI).
- NS156 under Earth and Environmental Systems shows the description of
  CS154 (differential equations); under Chemistry Across Scales it is
  correct.
- The Computational Sciences overview cards for Computer Science and AI,
  Contemporary Knowledge Discovery, Data Science and Statistics, and
  Mathematics carry Business concentration descriptions.

Worth reporting to Minerva's admissions or web team.

---

## 6. Sources (read 2026-11-18)

- https://www.minerva.edu/undergraduate/
- https://www.minerva.edu/undergraduate/4-year-curriculum/
- https://www.minerva.edu/undergraduate/majors-concentrations/?tab=natural-sciences
- https://www.minerva.edu/undergraduate/majors-concentrations/?tab=computational-sciences
- https://www.minerva.edu/concentrations/matter-and-energy/
- https://www.minerva.edu/concentrations/mathematics/
- Choice overload: Scheibehenne, Greifeneder and Todd (2010); Chernev,
  Bockenholt and Goodman (2015).

# ATLAS pathway research

Status: research round 1, written 2026-11-04. Nothing here is shipped copy.

**How the facts were gathered.** `minerva.edu` is outside this session's
network allowlist, so pages could not be fetched directly. Facts below come
from web-search results restricted to `minerva.edu`, which return the pages'
own text. Treat every course code, title and prerequisite as **unverified
until a human opens the live page and confirms it**. Minerva publishes
several catalog revisions that disagree with each other; where they do, this
doc says so.

**Product rules this research has to serve**
- Show a few choices at a time, never the whole path, never so many options
  that an applicant backs away from applying.
- Never use applicant data: no accounts, no analytics, no server-side
  storage of picks.
- `AGENTS.md`: no AI-written lists or copy in the product. Pathway content
  comes from Minerva's catalog and a human editor, with a source link and a
  "catalog as of" date on every card.

---

## 1. What Minerva actually looks like (the spine)

| Stage | What happens | Choice? |
|---|---|---|
| Year 1: Cornerstones | Four courses: Multimodal Communications, Formal Analyses, Empirical Analyses, Complex Systems. 32 units total. Build four competencies: think critically, think creatively, communicate effectively, interact effectively. | None. Show as one fixed step. |
| Year 2: Direction | Pick a major (Arts and Humanities, Business, Computational Sciences, Natural Sciences, Social Sciences). Take that major's core courses. | Major choice, then a few choices inside the core. |
| Year 3: Focus | Pick a concentration, start concentration courses, begin capstone courses. | Concentration choice. |
| Year 4: Synthesis | Finish the capstone, a sustained independent project, presented at Manifest, a month-long term in San Francisco after spring. | Capstone topic (open ended, applicant's own). |
| After | Work, graduate school, or both. | Branches below. |

Major structure per the majors page: each major has a core (three courses,
four for Business) and a concentration (three more courses). Course counts
listed for Natural Sciences below do not match "three" exactly; flagged in
section 5.

**Key finding for the design.** Minerva has no physics major and no math
major. Physics lives in Natural Sciences, as the **Matter and Energy**
concentration. Math lives in Computational Sciences, as the **Mathematics**
concentration. An applicant who types "physics" has to be translated into
Minerva's own vocabulary. That translation is the first screen of the tool.

---

## 2. Worked example A: Physics-minded

Entry: "I like physics" maps to Natural Sciences, Matter and Energy.

**Year 1:** four Cornerstones (fixed).

**Year 2, Natural Sciences core** (as listed on the Matter and Energy page):
- NS110U Physics of the Universe **or** NS110L Physics of Life. The catalog
  says a student completes one of the two. This is a real, applicant-sized
  choice: a cosmic-scale lean versus a living-systems lean.
- NS111 Implications of Earth's Cycles
- NS112 Evolution Across Multiple Scales
- NS113 Chemical Structure and Reactivity

**Year 3, Matter and Energy concentration:**
- NS142 Quantum Nature of Matter (prerequisite listed as CS51; verify)
- NS152 Analyzing Matter and Molecules (prereq NS110L or NS110U, plus NS113)
- NS162 Statistical Mechanics (prereq CS111, plus one of NS110L, NS110U, NS113)

Note for applicants: the physics path leans on Computational Sciences
courses (CS111 calculus appears as a prerequisite). That is a fact worth
showing, since "physics needs math" is a real decision input.

**Year 4:** capstone, then Manifest.

**Other Natural Sciences concentrations the page lists:** Chemistry Across
Scales, Earth and Environmental Systems, Problem Solving in Complex Systems,
and a Cells and Organisms major. A physics-curious applicant may land here
instead; the tool should be able to hand off sideways.

**After Minerva, evidence:**
- Natural Sciences graduates 2019 to 2025, n = 46: 85% employed full-time or
  in an advanced degree within six months; 43.5% advanced degree, 41.3%
  full-time work.
- Careers named on the Natural Sciences majors page: researcher, lab
  technician, science consultant, computational biologist, bioinformatician,
  environmental educator, conservation specialist, medical technologist.
- Named alumni example: a Natural Sciences and Computational Sciences
  graduate went on to a Ph.D. in Geochemistry at Caltech.
- **Gap:** no career list specific to Matter and Energy, and no physics PhD
  placement data, was found.

---

## 3. Worked example B: Math-minded

Entry: "I like math" maps to Computational Sciences, Mathematics.

**Year 1:** four Cornerstones (fixed).

**Year 2, Computational Sciences core:**
- CS110 Problem Solving with Data Structures and Algorithms
- CS111 Single and Multivariable Calculus
- CS113 Theory and Applications of Linear Algebra
- CS114 Probability and Statistics and the Structure of Randomness

**Year 3, Mathematics concentration:**
- CS144 Real Analysis (rigorous proof writing; prerequisite listings
  conflict across catalogs, see section 5)
- CS154 Analytical and Numerical Methods in Differential Equations
- CS164 Optimization Methods (linear, quadratic, semidefinite and
  mixed-integer programming)

**Other Computational Sciences concentrations that appear in sources:**
Applied Problem Solving, Data Science and Statistics, Computational Theory
and Analysis, Contemporary Knowledge Discovery. Lists differ by source.

**After Minerva, evidence:**
- Computational Sciences graduates 2019 to 2025, n = 256: 95.6% working or
  in advanced study within six months; 74.2% full-time work; 10.3% advanced
  degree; 44.5% Big Tech and Software; 17.6% Academia and Research.
- Careers on the majors page: entrepreneurship, software engineering,
  tech consultancy, machine learning engineering, technical product
  management, ethical AI research, CTO, data science.
- Careers listed for the Mathematics concentration: engineer, financial
  forecaster, game developer, high-tech entrepreneur, information officer,
  product designer.
- Examples: Computational Sciences and Business double major joining World
  Bank Treasury as a quantitative and financial technology analyst (Class of
  2026); alumni at Microsoft and Walmart Global Tech; a Computational
  Sciences graduate in a Planetary Science Ph.D. at CU Boulder.
- **Gap:** no math-specific outcome breakdown and no quant-finance placement
  data was found.

---

## 4. Proposed pathway design elements

These are proposals from this research, not facts about Minerva.

### Element schema

```
Stage         id, label, yearBand            // Entry, Year1..Year4, After
Step          id, stage, title, whatYouDo    // one fixed thing, no choice
Choice        id, stage, prompt, options[2..3], canSkip
Option        id, title, whatYouDo (one line), keepsOpen (one line),
              costFacts (workload, prerequisites), next[] (ids),
              source { url, label, asOf }
Bridge        from, to, reason               // sideways hand-off between majors
Outcome       id, kind (work|gradSchool|both), evidence { n, cohort, stat },
              examples[], source { url, label, asOf }
PathState     list of chosen option ids      // lives in the URL fragment only
```

### Rules

1. **Entry translates interest into Minerva terms.** Interest tiles (for
   example Physics, Math, Computer Science) map to a major and concentration,
   and say so plainly: "Minerva has no physics major. Physics happens inside
   Natural Sciences."
2. **Reveal rule.** Show the current choice and, at most, the next fixed
   step. Never show a whole-path tree by default.
3. **Option cap: three.** Choice overload research is contested. A
   meta-analysis of 63 conditions found an average effect near zero with
   large variation; a later reanalysis found it matters mainly when choice
   sets are complex, tasks are hard, preferences are unsure and there is no
   clear goal. Applicants are in exactly that high-risk state, so a hard
   cap of three is a judgment call, not a proven number.
4. **Fixed things are not choices.** The Cornerstones and required core
   courses are shown as one step, not a menu. Only show a choice where the
   applicant truly has one (for example NS110U versus NS110L).
5. **Keep-open line on every option.** Say what doors each pick leaves open
   so a choice never feels like a trap.
6. **Free backtracking.** A visible trail of picks, each one tappable to go
   back and change.
7. **Honest numbers.** Outcome cards always show n, cohort and the source.
   Natural Sciences n = 46 is small; say so. Never show a percentage
   without its denominator.
8. **Do not hide cost.** Prerequisites and workload facts stay one tap away,
   never removed. Hiding facts people need to decide is concealment, not
   progressive disclosure.
9. **No applicant data.** Picks live in the URL fragment so a path can be
   bookmarked or shared. No accounts, analytics, cookies or server storage.
10. **Close with the applicant's words.** The last step asks them a question
    to answer in their own head or on paper, for example "What would you
    want your capstone to find out?" The tool does not recommend; it opens
    doors.
11. **Labels.** Every screen carries "catalog as of <date>", a link to the
    source page, and a plain statement that this is an exploration sketch,
    not admissions advice or a promise of any course.

### Learning-orientation check (four questions)

1. Deepens understanding: yes, it teaches Minerva's real structure (majors,
   concentrations, Cornerstones, capstone) instead of hiding it.
2. Invites participation: yes, the applicant builds the path; the tool
   never picks for them.
3. Supports agency: yes, no recommendations, free backtracking, links out
   to the real catalog.
4. Clarity over cleverness: yes, a static data file and a few screens; no
   inference engine.

Strongest case against: a simplified path could make the applicant think a
course list is final, when catalogs change. Mitigation: dated stamps and
source links on every card, and a short "check the live catalog" line.

---

## 5. Open questions and conflicts (needs a human with the live catalog)

- Natural Sciences core: the majors page says core is three courses, but
  the Matter and Energy page lists NS110U or NS110L plus NS111, NS112,
  NS113. Confirm the real count.
- NS142 prerequisite CS51: confirm the course exists and what it is.
- CS144 prerequisites differ across catalog revisions (CS110 plus CS111B or
  CS113; CS111 alone; CS114).
- Which Computational Sciences concentrations are current. Sources list
  different sets; one earlier source implied six per major.
- Career lists on course explorer pages differ between the live and test
  sites. Pick the live catalog as the single source.
- Physics and math placement data (PhD programs, quant roles) was not found.
  Ask Minerva career services or use named alumni stories with permission.
- Whether any physics-flavored minor exists. Minors listed so far include
  Matter and Energy (Natural Sciences) and Mathematics (Computational
  Sciences), which could widen the path for double-interest applicants.

---

## 6. Sources

- Majors and concentrations: https://www.minerva.edu/undergraduate/majors-concentrations/
- Four-year curriculum: https://www.minerva.edu/undergraduate/4-year-curriculum/
- Matter and Energy: https://www.minerva.edu/concentrations/matter-and-energy/
- Matter and Energy minor: https://www.minerva.edu/concentrations/matter-and-energy-minor/
- Mathematics (Computational Sciences): https://www.minerva.edu/concentrations/mathematics/
- Natural Sciences course explorer: https://my.minerva.edu/academics/course_catalog/natural_sciences/
- Computational Sciences course explorer: https://my.minerva.edu/academics/course_catalog/computational_sciences/
- Course catalog revisions: https://course-resources.minerva.edu/uploaded_files/mu/00313229-3771/course-catalog-rev-223.pdf and https://course-resources.minerva.edu/uploaded_files/mu/00374296-4134/course-catalog-rev-309.pdf
- Outcomes: https://www.minerva.edu/undergraduatedegrees/ and the Class of 2023 to 2026 "Beyond Graduation" posts under https://www.minerva.edu/blog/
- Choice overload: Scheibehenne, Greifeneder and Todd (2010) meta-analysis; Chernev, Bockenholt and Goodman (2015) reanalysis.

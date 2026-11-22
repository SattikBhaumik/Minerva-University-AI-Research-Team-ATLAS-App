# Minervan needs and pain points a web tool could address

Method note: Minerva pages and the 2025-26 Undergraduate Student Handbook were fetched with curl (WebFetch could not resolve minerva.edu, github.io or substack hosts in this session). Handbook: [Undergraduate Student Handbook 2025-2026 v.3](https://cdn.prod.website-files.com/69f4c03133fa120f04215dc8/69f4c03133fa120f0421673d_Undergraduate%20Student%20Handbook%202025-2026%20v.3%20-%20Google%20Docs.pdf) (linked from [minerva.edu/resources](https://www.minerva.edu/resources) and [4continents4years](https://www.minerva.edu/4continents4years)). Section numbers below are the handbook's. Reddit, Discord and most student-written sources were NOT retrievable; search engines returned only McGill's unrelated "Minerva" registration system and spam. Student-voice evidence is therefore thin and mostly 2017 official blog posts. "Pain points" below are marked either "documented rule that creates a planning burden" (inference from the handbook) or "student-stated" (quoted).

## How do major declaration, concentrations, the lottery, prerequisites, tutorials, capstone, EL199/internships, and the 20-credit breadth rule actually work, and what is confusing?

### Takeaway
The rules form a four-year dependency chain with hard, unforgiving deadlines (declarations by Jan 31 of Years 1-3, tutorial registration locked in spring of Year 3, 120 attempted-credit tuition cap, 20-credit breadth), and the handbook scatters them across many sections. A browser-only planner that makes the chain visible and checks the arithmetic is well supported by the documents. Caveat: the handbook uses "EL199", not "IL199", and I found no CP191-CP196 codes in it.

### Cited Findings
- Year structure: Year 1 Cornerstones, Year 2 "Direction" (core courses of the intended major), Year 3 "Focus" (concentrations plus two Capstone seminars), Year 4 "Synthesis" (tutorials, extra concentration courses or business practicum, Capstone, Manifest in May). — Handbook 6.1.2-6.1.4
- Declaration deadlines: submit intended primary major(s) Jan 31 Year 1; submit revised majors, intended concentrations, or minors Jan 31 Year 2; add revised/new majors/minors/concentrations Jan 31 Year 3; revise/drop second major, concentration(s) or minor(s) Sept 30 Year 4. Changing major in Year 3 "may result in the inability to complete all requirements within four years", and may raise cost and affect financial aid. — Handbook 6.5.5. (A third-party guide, [Libertify](https://www.libertify.com/?p=31287), gave a Nov 30 Year 4 date; the handbook says Sept 30, so treat the third-party date as wrong or outdated.)
- Concentrations: as of Fall 2025, students who do not declare a concentration have only the major on the transcript, and complete the major with concentration classes of their choice subject to prerequisites, distribution requirements, and total credits at concentration level. — Handbook 6.5.3
- Credit cap: tuition covers a maximum of 120 attempted semester credits; extra attempted credits incur a per-credit fee; EL199/EL190 do not count as attempted and do not satisfy breadth. Students are told to watch breadth when choosing how many concentration courses to take. — Handbook 6.5.3, 6.6
- Breadth ("20 credits outside your college"): at least 20 elective credits must be core or concentration courses outside the primary major (example: Computational Science majors need 20 credits outside CS). Double majors automatically meet it. IL120 (2-credit special topics, "offered irregularly") count only if anchored outside the major college and not used for the major; cross-listed IL181 tutorials count only if not used for a major requirement; transfer, internship and prior-learning credits do NOT count toward breadth but do count toward 120. — Handbook 6.6
- Course lottery: initial course preference "typically begins in November (for spring) and March (for fall)", allocated by lottery. Add/drop (except Tutorials and Capstone seminars) happens in Forum during the Course Adjustment Period; "Not all Cores and Concentrations will necessarily be offered each semester, so students should carefully plan out their year". First years are auto-enrolled; others are auto-enrolled in GL91-98, Capstone Seminar, Capstone Directed Study, Manifest and selected tutorials. Drop deadline is week 4; later drops are a "W" counting as attempted credits. Section switching after adjustment needs Registrar approval. — Handbook 6.18.1-6.18.4
- Prerequisites: Cornerstone final score of 2.0+ (C or higher) in all four Cornerstones is a prerequisite for Core courses; below 2.0 in one means retaking in Year 2 alongside Cores, in two means no Core courses until retaken. All four must be passed to remain a student. — Handbook 6.15
- Tutorials (IL181): about eight students, circulated in late fall of Year 3, offered for confirmation in spring Year 3, registered late March/early April of Year 3; "not able to switch tutorials" and cannot add in Year 4; two per major (double majors can sometimes use cross-listed ones to do fewer). Substitutes: EL199 4-credit experience (College Head approval), an extra concentration course, a pre-approved elective (CS130, NS125) or two 2-credit major-approved IL120s. — Handbook 6.7
- Capstone: seminar courses in Year 3, project finished in Year 4 via two directed-study courses, Manifest in May in San Francisco (teach a class, graduation activities); 14 units combined; details live in a separate Capstone Handbook on myMinerva (not public). 2026 Manifest dates: move-in Apr 29-May 3, May 4-25, move-out May 28. — Handbook 6.10, calendar
- EL199 (internship/research/civic work credit): 240 hours = 4 credits, 120 hours = 2 credits; in-semester work capped at 120 hours (about 10 h/week over 12 weeks); eligible from Year 2 onward (summers after Years 1-3); seniors cannot apply in their last semester; requires a qualified supervisor, signed evaluation, reflection assignments, pass/no pass with one resubmission; cannot be used for class-assigned civic projects; max 8 EL199/EL190 credits and 16 combined with transfer/prior learning. Approval via Registrar form before starting. — Handbook EL199 section (about lines 5060-5140 of extracted text)
- Credit arithmetic: typical load gives only 116-118 of 120 credits (depending on Tokyo IL123/IL124), remainder via EL190, EL199, transfer or special topics. Standard 4-credit course = two 90-minute seminars/week + one Location-Based Assignment + minimum 8-10 hours out-of-class work. Full-time = 12 units minimum (loss of status for F-1 holders if below). Overload petitions due 30 days before the semester. Typical loads: 14.5 units/semester Year 3, 12.5 Year 4, 2 for Manifest. — Handbook 6.13, 6.14, 6.16, credit table
- Planning support exists but is internal: "Degree Planning tools are available at the Academic Advising page on myMinerva" plus degree-planning workshops. — Handbook 6.5.1

### Inferences
- Confusions likely (from rules, not student quotes): (1) which courses count toward breadth versus major (IL120/IL181 cross-list exceptions); (2) running attempted-credit total against 120; (3) irreversible tutorial lock-in in spring Year 3; (4) whether a Cornerstone grade blocks Core prerequisites; (5) EL199 hour thresholds, summer vs in-semester caps and approval before starting; (6) when a concentration is optional after Fall 2025.
- A date-driven timeline plus a credit/breadth calculator could be built from public rules entirely with static data and localStorage.

### Gaps
- No public source for CP191-CP196 numbering; Capstone Handbook is myMinerva-only. "IL199" in the brief appears to be EL199 (B199 for business practicum).
- No student quotes on lottery fairness or prerequisite confusion could be retrieved (Reddit not reachable; searches returned unrelated results). The lottery mechanics beyond "lottery process" and months are not published in the handbook.
- Current course catalog per-major requirement lists were not extracted; the majors-concentrations page was not parsed.

## Rotation: planning, logistics, choosing experiences in each city

### Takeaway
The rotation is mandatory and housing is committed by March 31 a year ahead, so logistics (housing, visas, city changes) carry real money and deadline risk; the model has changed (SF Year 1, Tokyo Year 2 recommended, upper-division cities vary), so any city tool must be data-driven and dated.

### Cited Findings
- Residential component is mandatory: first years must live in the San Francisco residence; living in Tokyo in Year 2 is "strongly recommended", and independent housing in Year 2 needs a petition; students outside the full rotation get a "remote learning" transcript annotation. — Handbook 2.2
- Housing commitment: students must commit to Minerva and housing by March 31 for the next year; committed housing must be paid whether or not used; moving to a different city after signing can mean paying both; late opt-in may find no space. — Handbook 2.2.1 and 5.14.1.17-18
- 2025-26 upper-division move-in is listed for Taipei and Buenos Aires; Foundation Week in San Francisco Aug 27-Sept 6, 2025; all-city "Elevation" mandatory. — Handbook calendar
- Minerva's rotation page lists recent and current cities: San Francisco, Berlin, Buenos Aires, Hyderabad, London, Seoul, Taipei, with generic descriptions of civic projects and local experiences per city. — [Four Continents, Four Years](https://www.minerva.edu/4continents4years). A search snippet (snippet only, not fetched) states Tokyo is a donor-funded city anchoring Years 1-2 with SF, and that years 3-4 choose among Berlin, Buenos Aires, Hyderabad, Seoul, Taipei — from [Minerva Voices](https://origin-www.minerva.edu/blog/four-years-four-continents-a-global-education-reimagined).
- Global Learning (GL) course every semester in a rotation city; in Tokyo replaced by 2-credit Japanese Society & Culture (fall) and 1-credit Japanese Civic Project (spring). Courses include a Location-Based Assignment. — Handbook 6.2, 6.13
- Civic projects: work with local professionals (non-profit, for-profit, government), required in Year 1 Cornerstone and Year 2 Tokyo course; can feed graded work or EL199 credit only when not class-assigned; "professional-level commitment" expected. — Handbook section on civic projects (about line 2640 of extracted text); EL199 exclusion at 5090
- Student-stated (2017, old, official blog): "I was thrown by the nebulous concept of 'city as a campus.'" and "a couple of guidelines would have made life easier" — Dana Bakke, Class of 2020, [7 Tips for Adjusting to a New City](https://www.minerva.edu/blog/7-tips-for-adjusting-to-a-new-city); she also reported feeling "trapped inside the 'Minerva bubble'".

### Inferences
- A personal city "bucket list / log" (places, local orgs, location-based assignment ideas) stored in localStorage addresses the "city as a campus" vagueness without data collection or generated text. Content per city must be human-written and dated because the city set has changed.
- Housing/visa deadline checklists are a documented high-stakes area.

### Gaps
- No 2023-2026 first-person student accounts on city logistics or choosing experiences were retrievable. A Substack post ([genwise](https://genwise.substack.com/p/a-students-experience-at-the-innovative)) and a Medium piece ([Seven Countries in Four Years](https://medium.com/minerva-schools/seven-countries-in-four-years-a-brazilian-students-journey-to-minerva-ea26e0376abb), 2018) surfaced in search but could not be fetched: snippet only.
- Current Years 3-4 city options and per-city rules not confirmed.

## Workload, Habits of Mind / Foundational Concepts, feedback/grading, seminar format

### Takeaway
The official workload is heavy and explicitly quantified, grading is a 0-5 rubric aggregated from learning-outcome scores, and attendance and preparation are mandatory; student-voice evidence is limited to a 2017 burnout post, but it points at self-scheduling and reflection as the felt need.

### Cited Findings
- Workload: 8-10+ hours of out-of-class work per course per week, plus two 90-minute seminars and a Location-Based Assignment per 4-credit course. — Handbook 6.13
- Attendance and preparation required: "class attendance is required"; students must complete all pre-class work; classes are small seminars with formative feedback. — Handbook 6.20
- Grading: faculty assess via rubrics on a 0-5 scale tied to course learning outcomes; course grades aggregate learning-outcome scores from class sessions and assignments; Cornerstones are year-long with a provisional Pass / In Progress / No Pass after semester one for students admitted Fall 2023 onward, replaced by a final letter grade averaging both semesters. — Handbook 6.21, 6.21.1
- HCs are the Habits of Mind and Foundational Concepts introduced in Cornerstones and re-applied and assessed in later years, Capstone and Manifest; EL199 requires "HC applications" write-ups. — Handbook 6.1 (about line 331 and 4272 of extracted text) and EL199 section
- Student-stated (2017): "many find themselves drowning in work, behind on assignments, anxious about missing important social events"; advice: choose a weekday with no schoolwork, make a study schedule, take day trips. His advisor suggested the day off when he said readings "were never-ending". — Alexandru Huțu, Class of 2020, [How to Have a Meaningful University Experience Without Burning Out](https://www.minerva.edu/blog/how-to-have-a-meaningful-university-experience-without-burning-out), Sept 13, 2017 (old, official promotional blog)

### Inferences
- A weekly planner that counts the 8-10 h/course rule against a person's schedule, and a private HC/outcome reflection log (user's own words, local only), match the documented load and the EL199 reflection requirement. No evidence found that students currently want these specifically; this is a hypothesis to test.

### Gaps
- No 2023-2026 student reports on workload, HC confusion, or feedback quality found. The HC list itself and how students track scores were not retrieved (scores live in myMinerva/Forum).

## Existing student-made tools, wikis, guides, and gaps

### Takeaway
I found almost nothing retrievable; Minerva's own materials (myMinerva degree-planning tools, Capstone Handbook, workshops) are behind login, which is itself the main gap signal.

### Cited Findings
- A personal student site at elijahumana.github.io/minerva-app (resources page) appeared in search results describing Active Learning Forum 90-minute sessions; unfetchable here (snippet only) — [resources page](https://elijahumana.github.io/minerva-app/resources.html).
- Official degree planning tools sit on myMinerva Academic Advising; the Capstone Handbook and registrar forms are also on myMinerva. — Handbook 6.5.1, 6.10
- Official public information is split across the handbook PDF (hundreds of pages, 5,800 extracted lines), course catalog pages and academic calendar PDFs at minerva.edu/resources.

### Inferences
- Gap: no public, login-free planner or deadline calendar combining declaration dates, lottery windows, tutorial lock-in, EL199 hours and breadth math; applicants, prospective students and parents cannot see these either.

### Gaps
- Reddit r/MinervaUniversity, Discord, Notion wikis: not reachable or not surfaced by search. Verify with a human who is a Minervan before claiming no tools exist.

## Needs servable WITHOUT user data collection (localStorage only) and WITHOUT AI-generated text

### Takeaway
Most documented rule-driven needs fit a static, human-authored, local-only tool.

### Cited Findings
Each candidate is backed by the rule it encodes:
- Four-year timeline and deadline calendar (Jan 31 Years 1-3, Sept 30 Year 4, lottery Nov/March, tutorial registration late Mar/early Apr Year 3, housing Mar 31, week-4 drop) — Handbook 6.5.5, 6.18, 6.7, 2.2.1.
- Credit and breadth calculator (120 attempted cap, 20 outside-major credits, EL199/transfer limits 8/16, IL120/IL181 exceptions) — Handbook 6.5.3, 6.6, EL199 section.
- Tutorial substitution chooser (EL199 4 credits, extra concentration course, CS130/NS125, two IL120s) — Handbook 6.7.
- EL199 hour tracker (120 vs 240 hours, 10 h/week in-semester cap, deliverables checklist) — Handbook EL199 section.
- Course-load and weekly-hours planner (8-10 h/course/week, 12-unit minimum, overload petition lead time) — Handbook 6.13, 6.14, 6.16.
- Private city log and location-based-assignment notes; private HC reflection journal in the user's own words — Handbook 6.2; Bakke 2017 post.

### Inferences
- Avoid anything needing login or server storage; export/import of a JSON file would give portability. Rule text must be dated to a handbook year (2025-26) and linked to the source, since policies change (e.g., the Fall 2025 concentration change).

### Gaps
- The course lottery cannot be modeled (algorithm unpublished). Per-major catalog data would need human curation. Student validation of any of these needs is still outstanding.

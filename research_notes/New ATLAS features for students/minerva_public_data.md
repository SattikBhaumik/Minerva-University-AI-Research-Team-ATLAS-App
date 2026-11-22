# Minerva public data sources for new ATLAS features (beyond catalog PDF, majors pages, outcomes brochures, research page, majors blog stories)

Fetched 2026-11-22 with curl from www.minerva.edu and cdn.prod.website-files.com. Minerva pages are Webflow-hosted; most have no visible "last updated" date, so currency is inferred from the sitemap lastmod, in-page academic-year labels, and PDF titles.

## 1. Which machine-readable or structured sources exist on minerva.edu?

### Takeaway
There is one reliable index, https://www.minerva.edu/sitemap.xml: 966 URLs, each with a `lastmod`. No public JSON or CSV API was found. The structured data worth extracting sits in two PDFs (the Undergraduate Student Handbook 2026-27 and "Financing Your Education") and in a few HTML pages with regular layouts (academic calendar, scholarships, financial aid). Sitemap `lastmod` values are mostly 2026-11-11, which looks like a bulk republish, so they are not a reliable change signal. The home page was 2026-11-20.

### Cited Findings
- sitemap.xml returned HTTP 200, about 162 KB, 966 `<loc>` entries with `lastmod`. Counts by path: blog 375, people 143, students 111, press 77, announcements 63, concentrations 46, resources 18, undergraduate 11, undergraduate/academics-course-catalog 9 (one page per college, plus the MS in Decision Making), videos 5. — [sitemap](https://www.minerva.edu/sitemap.xml)
- robots.txt returned HTTP 200 with empty content when fetched, so no stated crawl restrictions were seen. — [robots.txt](https://www.minerva.edu/robots.txt)
- A /sitemap-index.xml request returned 404. No JSON, CSV or XLSX links were found on the pages fetched. The only data-file links were PDFs on cdn.prod.website-files.com.
- course-resources.minerva.edu returned HTTP 403 (could not open, including /sitemap.xml). my.minerva.edu returned a login redirect, so student-only content is not public. — [course-resources](https://course-resources.minerva.edu), [my.minerva.edu](https://my.minerva.edu)
- /hcs and /habits-of-mind returned 404 (no dedicated HC page).
- `/undergraduate/academics-course-catalog/<college>` pages exist for arts-humanities, business, computational-sciences, interdisciplinary-digital-practices, natural-sciences, neuroscience (as listed in the sitemap), social-sciences and sustainability. ATLAS already uses the catalog PDF, but these HTML pages might give per-college text and may be easier to refresh. I did not open them.
- The /resources hub lists policy pages: undergraduate-student-handbook, graduate-student-handbook, transfer-credit-policy, credit-hour-policy, student-retention-and-graduation-rates, student-achievement, disability, annual-security-report, alumni-professional-ventures and others. — [resources](https://www.minerva.edu/resources)

### Inferences
- Use the sitemap for discovery and diffing, but monitor content hashes of the key pages and PDFs instead of `lastmod`.
- The handbook and fin-aid PDFs have stable text layouts (via `pdftotext -layout`), so they suit a scripted, versioned ingest. Their CDN URLs contain a content hash, so the link changes on each republish. Always resolve the PDF link from the /resources page.

### Gaps
- /faculty, /research (the lab list is visible) and some listing pages render as dynamic Webflow collections; /faculty returned no text to a plain fetch. The per-person /people/<slug> pages do contain content (see section 6).

## 2. Global rotation: cities, years, partners, immersion content

### Takeaway
The public pages give the rotation pattern by year (SF, Tokyo, Buenos Aires, then a European city) with named civic partners per stop. They do not give a per-cohort city calendar or per-city fact sheets. The handbook and press releases fill in some city details, and they are partly inconsistent with the rotation page.

### Cited Findings
- Global Immersion page, undergraduate itinerary: Stop 1 San Francisco (four Cornerstone courses; projects with Google, Adobe, Gensler and the SF City Government; volunteering with GLIDE, City Hope, 826 Valencia; Alcatraz habitat restoration, Muir Woods). Stop 2 Tokyo (major coursework; location-based assignments; civic projects; Exploration Day). Stop 3 Buenos Aires (concentration courses, a Minor, start of Capstone; policy design with local government; volunteering with TECHO). Stop 4 "A European City", with Berlin and London named as past cities (advanced coursework, Capstone, fellowships). — [Global Immersion](https://www.minerva.edu/global-immersion)
- Graduate and executive immersion is short (typically one week), not a full rotation. — [Global Immersion](https://www.minerva.edu/global-immersion)
- The 2026-27 handbook says first years must live in the San Francisco residence, and living in the Tokyo residence in year two is "strongly recommended". Independent Housing in year two must be petitioned for. The handbook calendar lists a "Fall Upper-division Move-In (Taipei / Buenos Aires)" for Sept 1-3, 2026, so upper-division cohorts were in Taipei and Buenos Aires that fall. — [Undergraduate Student Handbook 2026-27](https://cdn.prod.website-files.com/69f4c03133fa120f04215dc8/6aa2bf4b099aced44e3caac4_Undergraduate%20Student%20Handbook%202026-2027.pdf) (sections 2.2 and the calendar)
- Press release 2024-04-23: with Tokyo added, students study in San Francisco, Berlin, Buenos Aires, Hyderabad, Seoul, Taipei and Tokyo. The Nippon Foundation is giving $50M over a decade. — [Tokyo announcement](https://www.minerva.edu/announcements/minerva-university-announces-plans-to-include-tokyo-into-its-global-rotation-program)
- Press release 2026-02-04: Hyderabad was relaunched as an undergraduate rotation city (first offered in 2018), with T-Hub, India's startup incubator, as the central partner for applied projects. — [Hyderabad announcement](https://www.minerva.edu/announcements/minerva-university-relaunches-hyderabad-as-global-rotation-city-for-undergraduates)
- 5 `/videos/global-immersion-*` pages exist (for example san-francisco and taipei-qiusu-wang), and /experience-global-immersion-at-minerva-university and /student-impact are in the sitemap. I did not open them. — [sitemap](https://www.minerva.edu/sitemap.xml)
- Research page lists cornerstone civic project examples (Chinese-American Heritage Museum rebrand, an SF coyote education app, a free SF transit database, an SF housing data-journalism piece). — [Research](https://www.minerva.edu/research)

### Inferences
- A "rotation timeline" or "what to expect in each city" feature can be built from the four-stop page plus partner names. A per-city fact sheet (Tokyo, Buenos Aires, Seoul, Taipei, Hyderabad, Berlin) would need hand-curation from press, blog and video pages.
- Conflict to flag: the 2024 release lists Seoul and Berlin, but the current Global Immersion page names only SF, Tokyo, Buenos Aires and "a European city". Treat the rotation list as time-sensitive and note the date on any ATLAS display.

### Gaps
- No page found that maps cohort/class year to city by semester. (The handbook has a calendar for 2026-27 but only hints at cities.) Seoul's current status is not stated on pages I opened.

## 3. Habits of Mind and Foundational Concepts (HCs)

### Takeaway
No public list of the individual HCs (names, descriptions, which Cornerstone teaches each) was found. The public material describes them only in general terms.

### Cited Findings
- Four Year Curriculum page: four Cornerstone courses (Formal Analyses, Multimodal Communications, Empirical Analyses, Complex Systems), each tied to a core competency (think critically, think creatively, communicate effectively, interact effectively). It describes HCs only generically; no named list. — [Four Year Curriculum](https://www.minerva.edu/four-year-curriculum)
- The handbook defines five Institutional Learning Outcomes (Self-Management and Wellness, Interpersonal Engagement, Intercultural Competency, Professional Development, and a fifth I did not capture) and says they are "reflected in Habits of Mind and Foundational Concepts" that are introduced in year one. — [Handbook](https://cdn.prod.website-files.com/69f4c03133fa120f04215dc8/6aa2bf4b099aced44e3caac4_Undergraduate%20Student%20Handbook%202026-2027.pdf)
- Likely locations, not accessible: course-resources.minerva.edu returned 403; the student platform (my.minerva.edu) requires login.

### Inferences
- The catalog PDF ATLAS already uses may name HCs in course descriptions. That should be checked before concluding HCs are unavailable. An "HC explorer" would otherwise need the student-only sources, so it is not buildable from public data right now.

### Gaps
- HC names, definitions and Cornerstone mapping: not found publicly.

## 4. Academic calendar, term structure, lottery, declarations, credits, tutorials, Manifest

### Takeaway
This is the richest source. The HTML calendar and the 122-page Undergraduate Student Handbook 2026-27 together support a dated term calendar and policy features (credit rules, registration lottery, tutorials, Manifest).

### Cited Findings
- Academic calendar page, 2026-2027, tabs for Undergraduate / Graduate / Executive Education. Undergraduate dates include: SF move-in Aug 23-25, 2026; SF Foundation Week Aug 26-Sept 5; first day of fall Sept 7, 2026; fall drop deadline Oct 2; withdrawal deadline Nov 27; Continuum (mandatory) Dec 4; last fall class Dec 10 (Dec 11 for Asia-based students); winter break Dec 19-Jan 7; first day of spring Jan 11, 2027; spring drop deadline Feb 5; withdrawal deadline Apr 2; Continuum Apr 9; last spring class Apr 15; Manifest May 3-24, 2027; graduation May 25; summer semester May 3-Aug 20, 2027. Feasts (Friendsgiving, Quinquatria) have city-dependent dates "to be determined". The graduate tab lists module dates by course (for example SS352, CS351, an April 2026 London immersion week). — [Academic Calendar](https://www.minerva.edu/academic-calendar)
- The calendar page's HTML repeats each date in duplicate (tabbed and responsive views), so a parser has to de-duplicate. The page also shows 2025-26 and 2026-27 side by side in the spring table.
- Handbook calendar matches the page but differs in places: handbook gives Quinquatria Break Mar 22-26, 2027 and Manifest Move-Out May 28, 2027, while the web calendar gives Manifest Move-Out May 27, 2027 and Quinquatria break "TBD". Flag as a conflict. — [Handbook](https://cdn.prod.website-files.com/69f4c03133fa120f04215dc8/6aa2bf4b099aced44e3caac4_Undergraduate%20Student%20Handbook%202026-2027.pdf)
- Handbook policy sections (by table of contents): 2.1.5 Exceeding 120 Credit Hours (per-credit fee beyond 120 attempted credits; EL199 research/internship, transfer credit excluded); 6.5.5 Intended and Declared Majors/Minors; 6.7 Senior Tutorials (IL181; student-generated ideas circulated in late fall of third year); 6.10 Capstone and Manifest (Manifest is a May term in San Francisco and required for graduation); 6.18.1 Course Registration Process (preferences begin in November for spring and March for fall; allocated by lottery; add/drop in Forum during the Course Adjustment Period; Tutorials and Capstone seminars cannot be added/dropped that way; first-year students are auto-enrolled). Minimum load is three four-credit courses. A concentration is optional; students without one show only their major on the transcript. — [Handbook](https://cdn.prod.website-files.com/69f4c03133fa120f04215dc8/6aa2bf4b099aced44e3caac4_Undergraduate%20Student%20Handbook%202026-2027.pdf)
- Transfer credit and credit-hour policies are separate public pages: [transfer-credit-policy](https://www.minerva.edu/resources/transfer-credit-policy), [credit-hour-policy](https://www.minerva.edu/resources/credit-hour-policy) (not opened).

### Inferences
- Features: an "important dates" calendar export (ICS) by cohort/city, a deadline reminder, a degree-plan checker that applies the 120-credit and minimum-load rules, a lottery-timeline explainer, a Tutorial/Capstone/Manifest timeline.
- The handbook states its academic year in the title, so ATLAS can show "Handbook AY2026-27" as provenance. The graduate handbook (AY2026-27) is also published.

### Gaps
- Course-lottery ranking rules beyond the process description and exact declaration deadlines were not extracted; I only located the sections (lines ~4289 and ~4718 of the text). A follow-up read of sections 6.5 and 6.18 would be needed.

## 5. Cost of attendance, financial aid, scholarships, work-study

### Takeaway
Numbers are published and current, but only as institution-wide totals by cohort year, not per city. Financial aid rules, an external-scholarship list with deadlines, and work-study terms are all public.

### Cited Findings
- Financial aid page shows estimated cost of attendance for 2027/2028: tuition and program fee $31,300, residential services fee $19,900, student services fee $2,800, estimated living costs $5,600 (not paid to Minerva), total $59,600. Year-one extras (visa about $740, laptop $800-2,000, insurance $700-800 per semester, deposits) and years 2-4 extras (3+ flights a year, visas about twice a year). — [Tuition & Financial Aid](https://www.minerva.edu/undergraduate/financial-aid)
- Handbook gives cohort-specific tables: Class of 2027 tuition and program fee $23,900, residential services $17,400; total estimated cost $56,200 for first years, $52,400 second, $49,200 third, $46,300 fourth (including Manifest) for the 2026-27 year. Class of 2030 table also present. Excludes visas and travel. — [Handbook](https://cdn.prod.website-files.com/69f4c03133fa120f04215dc8/6aa2bf4b099aced44e3caac4_Undergraduate%20Student%20Handbook%202026-2027.pdf)
- Conflict to flag: an older page, /undergraduate/tuition-fees-old ("Class of 2030 costs"), shows tuition $29,800, housing $18,400, services $2,400, total $56,200, and says tuition, housing and fees rise about 5-6% a year. The current financial-aid page has higher 2027/28 figures. Use the newer page and the handbook. — [tuition-fees-old](https://www.minerva.edu/undergraduate/tuition-fees-old)
- Aid rules: need-based, need-aware; no full-ride packages; packages combine need-based scholarships, low-interest loans, and work-study (up to roughly $5,000 a year); institutional merit awards considered automatically; must apply before the admissions decision; CSS Profile with school code 6033, no fee waivers; Minerva does not participate in US Title IV (no federal loans or Pell). — [Financial Aid](https://www.minerva.edu/undergraduate/financial-aid)
- Handbook: work-study positions are tied to presence in the rotation city; students forfeit hours for weeks away; remote students are not eligible. — [Handbook](https://cdn.prod.website-files.com/69f4c03133fa120f04215dc8/6aa2bf4b099aced44e3caac4_Undergraduate%20Student%20Handbook%202026-2027.pdf)
- "Financing Your Education" PDF (448 lines of text; file name suffix _080526, probably dated 2026-08-05, an inference from the name): EFC explanation and three principles. — [Financing Your Education](https://cdn.prod.website-files.com/69f4c03133fa120f04215dc8/6a72d9e1c7cefd0c6d821178_FinancingYourEducation_080526.pdf)
- Scholarships page: external-scholarship directory of about 29 programs (for example Masason Foundation, Goldwater, QuestBridge, Gates, Coca-Cola Scholars, Hispanic Scholarship Fund), each with eligibility note and deadline month/day. These are third-party programs, not Minerva awards. — [Scholarships](https://www.minerva.edu/scholarships)
- Also in the sitemap: /student-emergency-assistance-fund, /deca-scholarship, /undergraduate/required-financial-information (not opened).

### Inferences
- Features: a cost estimator by cohort and year, a "hidden costs" checklist for applicants, a scholarship deadline tracker. Because the scholarship deadlines are month/day without a year, they must be treated as annual and re-verified.

### Gaps
- No per-city cost-of-living data and no work-study pay rates by city. No published aid statistics (average award, percentage receiving aid) were found in the pages I read.

## 6. Internships, labs, summer programs, career services, faculty

### Takeaway
Labs and career services are described in prose only: no partner or employer list, no opportunity listing. Faculty individual pages are public with titles, bios and email, but the index page is not fetchable as text.

### Cited Findings
- Research page names three lab groups: IMPACT Lab (Laboratory for Innovation through Mathematics in Pure, Applied and Computational Treks), Psychology Labs (includes music, health and wellness; partnered with Dolby Laboratories), Sustainability Labs (climate resilience, food systems, policy). It also names a Sustainability Policy Research Initiative and a collaboration with Bank of America on modeling shipping disruption. — [Research](https://www.minerva.edu/research)
- Career development page: Coaching & Talent Development (CTD), three pillars (Clarity, Communication, Connections); labs listed as Sustainability Lab, AI Lab, Music, Health & Wellness Lab; statistics 87% of students secure internships after first year, 91% of graduates are in full-time roles or graduate school, 91% of employed alumni say Minerva prepared them. No partner or employer list on the page. — [Career Development](https://www.minerva.edu/undergraduate/career-development)
- Related pages in the sitemap: /resources/alumni-professional-ventures, /alumni, a press story on the AI research lab turning concepts into startups, and the announcement of the Laboratory for the Science of Music, Health and Wellness. — [sitemap](https://www.minerva.edu/sitemap.xml)
- Faculty: 143 `/people/<slug>` pages. A sample page (Aaron Lawry) shows a title, a professional bio, a quote, and a work email. The /faculty index returned no text to curl, so the college/department grouping was not visible. — [sample](https://www.minerva.edu/people/aaron-lawry-ph-d)
- Summer: handbook lists a Summer Session May 3-Aug 20, 2027, and a business practicum in the summer between years; separate Visiting Scholars Year page exists (not opened). — [Handbook](https://cdn.prod.website-files.com/69f4c03133fa120f04215dc8/6aa2bf4b099aced44e3caac4_Undergraduate%20Student%20Handbook%202026-2027.pdf)

### Inferences
- A "who teaches and researches what" feature is possible from the people pages (names, titles, bios) but the 143 pages mix faculty and staff, and research areas appear only in free-text bios. It would need an editor, not AI-written summaries, under the project's rule against AI-written copy. Faculty emails should not be copied into ATLAS.
- Stat figures (87%, 91%) overlap with the outcomes brochures ATLAS already uses; check for conflicts before showing both.

### Gaps
- No public list of internship employers, lab project openings, or summer programs by name beyond the examples above. The /faculty index was not parsed. Per-college faculty grouping not found.

## Summary table of sources

| Source | URL | Format | Currency | Stability | Feature it could enable |
|---|---|---|---|---|---|
| Sitemap | /sitemap.xml | XML, 966 URLs | lastmod 2026-11-20 (home) | High | Change monitoring and discovery |
| Academic calendar | /academic-calendar | HTML, duplicated blocks | 2026-27 | Re-written each year; URL stable | Dated calendar, deadlines, ICS |
| Undergraduate Handbook | /resources/undergraduate-student-handbook (PDF on CDN) | 122-page PDF | AY2026-27 | Hashed CDN URL changes yearly | Credit rules, lottery, tutorials, Manifest, costs by cohort |
| Financial aid / costs | /undergraduate/financial-aid | HTML | 2027/28 estimates | Medium; numbers change yearly | Cost estimator, aid explainer |
| Financing Your Education | CDN PDF (_080526) | PDF | about Aug 2026 | Hashed URL | Aid process guide |
| Scholarships | /scholarships | HTML list | Undated, deadlines yearly | Medium | Deadline tracker |
| Global Immersion | /global-immersion | HTML | Undated | Medium | Rotation timeline, city partners |
| Rotation press | /announcements/... (Tokyo 2024, Hyderabad 2026-02-04) | HTML | dated | High (dated articles) | City context |
| Four Year Curriculum | /four-year-curriculum | HTML | Undated | Medium | Year-by-year path |
| Research | /research | HTML | Undated | Medium | Lab explorer |
| Career development | /undergraduate/career-development | HTML | Undated | Medium | Career and CTD explainer |
| People | /people/<slug> (143) | HTML | Undated | Medium | Faculty finder (professional info only) |
| Graduate Handbook AY2026-27 | CDN PDF | PDF | AY2026-27 | Hashed URL | Out of ATLAS undergraduate scope |
| course-resources.minerva.edu, my.minerva.edu | - | 403 / login | - | - | Not usable |

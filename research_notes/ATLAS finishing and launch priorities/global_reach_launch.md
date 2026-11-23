# Global reach (internationalization) and launch/dissemination for ATLAS

Research date: 2026-11-23. Tool limits: most hosts (minerva.edu, w3.org, collegedata.com) could not be fetched directly; findings rest on search-result snippets of those pages, so evidence is moderate at best. Several questions have no verified answer (see Gaps).

## (A1) International share and countries/languages

### Takeaway
Minerva claims 100+ countries represented. Third-party data suggests roughly 23% international on one 2024-25 listing, but another CollegeData listing shows 87.4%, so the true share is unresolved. No language breakdown was found.

### Cited Findings
- Minerva's About page reports 100+ countries represented in the student community — [Minerva About](https://www.minerva.edu/about)
- Appily lists a lower figure of 60 countries — [Appily](https://appily.com/colleges/minerva-university-0/campus-life)
- Idaho's college directory shows International Students 23.4% with 560 enrolled; one CollegeData page shows 23.4% for 2024-25 while another listing shows 87.4% — [Idaho directory](https://nextsteps.idaho.gov/college-and-universities-directory/minerva-university); [CollegeData](https://waf.collegedata.com/college-search/minerva-university/students). These conflict; the 87.4% is likely a different definition (e.g., non-US-citizen vs. visa-holding) or error, unverified.
- Inaugural class (2015): 111 students from 30 countries/territories — [PR Newswire](https://prnewswire.com/news-releases/minerva-schools-at-kgi-welcome-its-inaugural-class-300144551.html)

### Inferences
- Whatever the exact share, the pool is highly international and most readers have English as a second or third language. Treat this as a design premise, but do not quote a percentage in the product until confirmed from the Common Data Set or IPEDS.

### Gaps
- Top countries/languages: not found. Check Minerva's Common Data Set (section B), IPEDS, and class-profile pages directly (network blocked here).
- Which international-share figure is right: unresolved.

## (A2) Minerva's English requirement

### Takeaway
Per Minerva's own pages, applicants must demonstrate English proficiency, classes are in English, and standardized English tests are not required; Challenges must be done in English with no translation.

### Cited Findings
- Admissions page: must demonstrate English proficiency; standardized tests not required — [Minerva admissions](https://www.minerva.edu/undergraduate/admissions/)
- FAQ: all classes in English; fluency is measured within the application — [Minerva FAQ](https://www.minerva.edu/faqs/)
- A test-domain FAQ says TOEFL/IELTS not required (may not be the live page) — [test.minerva.edu FAQ](https://test.minerva.edu/frequently-asked-questions/)
- Challenges must be completed in English, no translation — [Minerva Challenges advice](https://www.minerva.edu/blog/application-challenges-advice)
- Clastify claims TOEFL minimums of 70 or 80 (its own pages disagree) — [Clastify](https://www.clastify.com/blog/score-requirements/minerva-university/toefl). Contradicts Minerva's own statement; treat as unreliable.

### Inferences
- Applicants can already read English at a working level, so plain English is the right baseline; a full translation of ATLAS is not required by the audience. Still, comprehension of nuanced policy text varies.

### Gaps
- Exact current official wording was only seen in snippets; verify on the live page.

## (A3) Best practice for a small static site

### Takeaway
Write plain English, set lang, mark non-translatable tokens with translate="no", use Intl for dates/numbers, and keep layout RTL-ready (logical CSS). Browser translation works acceptably if the page is semantic text.

### Cited Findings
- Plain language: first rule is write for your audience, pick words readers already know; plain language is not dumbing down — [plainlanguage.gov](https://plainlanguage.gov/guidelines/audience); related guide [Digital.gov](https://digital.gov/guides/plain-language)
- translate attribute: default is everything translatable; translate="no" tells translation services to skip; W3C tests found all online services tested honored it; attribute values (alt/title/placeholder) are handled inconsistently — [W3C translate Q&A](https://w3.org/International/questions/qa-translate-flag); [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_Attributes/translate)

### Inferences (from general web-platform knowledge, not sourced here)
- Use translate="no" on course codes, program names, and the ATLAS name; keep key text in text nodes, not attributes or images.
- Use Intl.DateTimeFormat / Intl.NumberFormat with the user's locale; show time zones explicitly for deadlines.
- Use CSS logical properties (margin-inline, text-align: start) so RTL would work; no need to ship RTL now.
- CEFR B1/B2 targeting and a readability check are common practice; I found no authoritative source specifying a CEFR target for web copy, so treat as a team choice.
- Machine translation vs "no AI-written content": a reader-initiated browser translation is the reader's tool, not ATLAS content, so it likely does not conflict with the rule. Shipping pre-generated machine translations would be AI-written content; if translations are wanted, use human volunteers (e.g., student speakers) and label them. Needs owner decision; no source found.

### Gaps
- No fetched evidence on Chrome/Safari translation quality for static sites; no human-translation cost data.
- Whether translation is "needed": no applicant-language data, so recommend a feedback link and deciding from requests.

## (A4) Low bandwidth

### Takeaway
No region-specific source found. Evidence-free beyond general practice.

### Inferences
- Keep pages small (no web fonts or heavy images, system fonts), static HTML, cache with a service worker, and test on throttled 3G. A static GitHub Pages site fits this well.

### Gaps
- No sourced bandwidth data by region.

## (B1) Where applicants look for information

### Takeaway
Minerva's own site and blog are the main official channels; peer channels could not be verified with this toolset.

### Cited Findings
- Minerva's blog gives application advice and points questions to admissions@minerva.edu — [Minerva blog](https://www.minerva.edu/blog/application-advice-presenting-your-accomplishments)
- Minerva has a counselors page — [Minerva counselors](https://www.minerva.edu/counselors)
- CollegeVine hosts Q&A about Minerva — [CollegeVine](https://collegevine.com/faq/146972/admissions-insights-for-minerva-university)

### Gaps
- Reddit r/MinervaUniversity, YouTube vloggers, College Confidential, Discord/WhatsApp: no results returned (Reddit not surfaced by search). Owner/team should observe these directly.

## (B2) How comparable student tools spread

### Takeaway
Weakly evidenced: Berkeleytime and Hydrant are student-run and open source, with organizational backing from a student group; no adoption-mechanism data found.

### Cited Findings
- Berkeleytime describes itself as built, maintained, and run by students; GitHub org is asuc-octo (ASUC, Berkeley's student government, Office of the CTO) — [berkeleytime.com](https://berkeleytime.com); [GitHub](https://github.com/asuc-octo/berkeleytime). 26k+ users claim comes from an undated portfolio page — [portfolio](https://janetxrm.github.io/bt.html)
- Hydrant is maintained by SIPB, MIT's volunteer student computing group; GPLv3; MIT department pages link to it — [GitHub](https://github.com/sipb/hydrant); [MIT PE&W](https://physicaleducationandwellness.mit.edu/my-gir)
- A 2014 Daily Pennsylvanian piece covers student programmers building around university course systems — [DP](https://www.thedp.com/article/2014/08/student-programmers-hack-university-course-systems)

### Inferences
- Pattern visible: backing by a durable student org (student government, computing club) plus institutional pages linking to the tool. Continuity of maintainers matters. The team should name a maintainer handoff.

### Gaps
- Carta and CourseTable: not researched successfully. Word-of-mouth vs endorsement attribution: not found.

## (B3) Approaching the university

### Takeaway
No source found on Minerva's endorsement process. Recommend asking, not assuming.

### Inferences
- Email admissions@minerva.edu (published contact) or student affairs with a short, factual note: what ATLAS is, sources used, no data collected, and a request for review of accuracy only. Ask for a link or a correction, not endorsement.
- Mitigate seeming official: persistent "Unofficial, student-built" label on every page, no Minerva logo/branding, a link to official pages for every fact, and a visible last-checked date.
- Risk: a wrong statement about admissions may be taken as Minerva's. Reduce by sourcing every claim.

### Gaps
- No evidence of Minerva policy on third-party tools or use of its name/marks.

## (B4) Discoverability and outreach

### Takeaway
Basic SEO is cheap and documented; outreach should be disclosed, sparse, and invited.

### Cited Findings
- Google uses title elements and other signals (headings, og:title) to form title links; guide recommends unique titles and meta descriptions — [Title links](https://developers.google.com/search/docs/appearance/title-link); [Get started](https://developers.google.com/search/docs/guides/get-started)
- Google documents building and submitting sitemaps — [Search Central](https://developers.google.com/search/docs/basics/basic-search-visibility-checklist.pdf)

### Inferences
- Per page: unique title, meta description, canonical, og:title/description/image, sitemap.xml, robots.txt, lang attribute; submit in Search Console.
- Outreach: post once where self-promotion is allowed (check each community's rules), disclose "we are students who built this," invite corrections, no DMs to applicants, no tracking links. Prioritize current students and counselors as relays over cold applicant outreach, in line with "never overwhelm applicants."

### Gaps
- Channel rules and norms of Reddit/Discord not verified.

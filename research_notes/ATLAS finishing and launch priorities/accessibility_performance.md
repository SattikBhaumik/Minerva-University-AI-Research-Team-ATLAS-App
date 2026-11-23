# Accessibility (WCAG 2.2) and performance finishing priorities for ATLAS

Research note: the session's network blocked direct fetches of w3.org, webaim.org, deque.com, web.dev and docs.github.com (DNS failure; those hosts would need to be allowed). All findings below come from WebSearch result summaries, which are secondary. Primary-source URLs are given as the page the search surfaced; confirm exact wording against them before quoting. Searched 2026-11-23.

## Which WCAG 2.2 criteria commonly fail in view-swapping SPAs, and how to manage focus/announcements on view change

### Takeaway
WCAG 2.2 (W3C Recommendation, 5 Oct 2023) added 9 criteria; for ATLAS the ones most likely to bite are 2.4.11 (sticky sidebar/header covering focused elements), 2.5.8 (24x24 px targets in dense tables and sidebar links), 2.5.7 (range sliders need a non-drag alternative) and 3.3.7 (don't make users retype saved textarea content). Because `hidden`-toggled views give no page load, the app must itself move focus to the new view heading and update `document.title`; a polite live region is a supplement, not a substitute.

### Cited Findings
- WCAG 2.2 became a W3C Recommendation on 5 October 2023 and adds nine success criteria to 2.1 — [W3C What's New in WCAG 2.2](https://w3.org/WAI/standards-guidelines/wcag/new-in-22/) (via search summary)
- 2.4.11 Focus Not Obscured (Minimum), Level AA: a focused component must not be entirely hidden by author-created content; 2.4.12 (AAA) requires none hidden. Note several blogs mislabel 2.4.11 as "Focus Appearance" (that is 2.4.13, AAA) — [W3C What's New in WCAG 2.2](https://w3.org/WAI/standards-guidelines/wcag/new-in-22/); [Deque University WCAG 2.2](https://dequeuniversity.com/resources/wcag-2.2)
- 2.5.8 Target Size (Minimum), Level AA: pointer targets at least 24x24 CSS px, or sufficient spacing; some sources wrongly call it "Pointer Target Spacing" — [W3C What's New in WCAG 2.2](https://w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- 3.2.6 Consistent Help, Level A: help mechanisms (contact details, self-help) in the same relative place across pages where provided — [W3C What's New in WCAG 2.2](https://w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- 3.3.7 Redundant Entry, Level A: don't require re-entry of information already provided in the same process unless essential/security/no longer valid; 3.3.7 is not Accessible Authentication (that is 3.3.8) — [W3C What's New in WCAG 2.2](https://w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- 2.5.7 Dragging Movements, Level AA: any dragging function needs a single-pointer alternative. W3C's own example is a range slider: clicking/tapping the track to move the thumb, or providing a text input, is an acceptable alternative. Keyboard operability is evaluated separately — [W3C Understanding 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)
- 1.4.10 Reflow (AA): 320 CSS px width equals a 1280 px viewport at 400% zoom; 256 px height for horizontally scrolling content; exception for content needing two-dimensional layout (data tables, maps, diagrams generally qualify). W3C says that if 200% zoom yields a viewport narrower than 320 px, 2-D scrolling there is not a Reflow failure — [W3C Understanding Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)
- SPA route-change pattern, consistent across guidance: screen readers do not announce SPA route changes and focus stays on the triggering element; move focus to the new view's `h1` (made focusable with `tabindex="-1"`), or to a `tabindex="-1"` main container; update `<title>` on every route change; use a polite live region sparingly. Marcy Sutton's user testing found focusing the h1 most well received. For partial-page changes (carousels), many prefer keeping focus on the control and announcing the change — [BBC GEL routing](https://bbc.github.io/gel/foundations/routing); [Arizona focus management](https://accessibility.arizona.edu/web-apps/focus-management); [WebAIM list thread](https://webaim.org/discussion/mail_message?id=46913); [Helsinki Accessibility Model SPA notes](https://saavutettavuusmalli.hel.fi/toteutus-ja-ohjelmistotestaus/single-page-applications-spas-notes-on-accessibility/)
- Playwright accessibility testing docs describe the AxeBuilder fixture pattern — [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)

### Inferences
- (Background knowledge, not verified in this session) Vanilla pattern: in the `showView(id)` function, unhide the target, set `document.title = heading + ' - ATLAS'`, `heading.tabIndex = -1; heading.focus({preventScroll:false})`, and write the view name into a visually hidden `<div role="status" aria-live="polite">` only if focus move alone proves insufficient in screen reader testing (double announcement risk). Skip focusing on initial load. Handle back/forward (`popstate`/hash) through the same function.
- 2.4.11 risk for ATLAS: sticky header or sidebar overlays plus `scroll-padding-top`/`scroll-margin` missing; fix with `scroll-padding` equal to sticky header height and test Tab through a long page at 400% zoom. Cheap manual test: Tab through every view and confirm the focus ring is never fully covered.
- 2.5.8 risk: sidebar links, table-row buttons, `<summary>` toggles, small icon buttons; give `min-height/min-width: 24px` (aim for 44px on mobile) via CSS. Inline text links in a sentence are exempt per the criterion's exceptions (background knowledge).
- 3.3.7 is largely satisfied by localStorage-saved textareas; make sure data persists across view swaps and is not cleared on re-render. 3.2.6 applies only if a help/contact link exists; keep it in the same place in every view.
- 2.5.7: native `<input type=range>` is keyboard operable, but verify that track click sets the value in target browsers (not confirmed in sources); add a number input or +/- buttons as fallback for "guess then reveal".
- Other criteria likely to fail in this kind of app (background knowledge; recommended to verify against W3C): 1.3.1 (tables need `th scope`/caption), 2.4.1 (skip link), 2.4.3, 2.4.7 focus visible, 4.1.2 (name/role/value for custom sidebar nav; use `aria-current="page"`, not `role=tab` unless implementing full tab pattern), 1.4.3/1.4.11 contrast in both themes, 1.4.12 text spacing, 1.3.4 orientation, 2.3.3-related motion handling.

### Gaps
- Could not retrieve W3C's pages directly (host blocked) so exact normative wording and exceptions for 2.4.11/2.5.8 are unverified.
- No source retrieved for 2.3.3 / `prefers-reduced-motion` or dark-mode contrast thresholds in this session (the one search for them returned only Reflow). Background knowledge: 1.4.3 needs 4.5:1 body text and 3:1 large text, 1.4.11 needs 3:1 for UI components and graphics; `@media (prefers-reduced-motion: reduce)` should disable smooth scroll/transitions. Unverified here.
- No data on `<details>`/`<summary>` screen reader support or print stylesheet a11y.

## Making an SVG node-link diagram (prerequisite map) accessible

### Takeaway
Give the root `<svg>` `role="img"` with `<title>` and `<desc>` referenced via `aria-labelledby`, but treat that as a short summary only; provide a real text equivalent of the graph (a nested list or table of "course X requires A, B") adjacent to or toggled by the diagram, since complex diagrams cannot be conveyed in an alt string.

### Cited Findings
- Core pattern: `role="img"` on root `<svg>`, `<title>` and `<desc>` with unique IDs, both referenced from `aria-labelledby` — [EU data visualisation guide](https://data.europa.eu/apps/data-visualisation-guide/accessible-svg-and-aria); [TPGi](https://tpgi.com/using-aria-enhance-svg-accessibility)
- Smashing Magazine's screen reader pattern comparison found title + desc + `aria-labelledby` among the most robust, with none failing — [Smashing Magazine, 2021](https://smashingmagazine.com/2021/05/accessible-svg-patterns-comparison/)
- Support for `<title>`/`<desc>` alone is inconsistent; W3C ACT rule: `role="img"` SVG without a non-empty accessible name fails — [W3C ACT rule 7d6734](https://www.w3.org/WAI/standards-guidelines/act/rules/7d6734/2022-06-23/)
- For long descriptions, point `aria-describedby` at an external paragraph by ID, or use a visually hidden `<p>` — [Disability World](https://www.disabilityworld.org/articles/accessible-stem-diagrams/); [A11y Collective](https://www.a11y-collective.com/blog/svg-accessibility/)
- Very complex graphics often need more than a text alternative (interactivity/structured data) — [Quorum](https://quorumlanguage.com/tutorials/accessibility/accessibleGraphicsSVG.html)
- Caution: a CSS-Tricks snippet uses `role="group"` and a typo `aria-labeledby`; do not copy — [CSS-Tricks](https://css-tricks.com/?p=243138)

### Inferences
- Note `role="img"` makes children presentational, so inner links/focusable nodes inside the SVG become inaccessible. If nodes are clickable, either drop `role="img"` and make each node a focusable `<a>`/`<g role="link" tabindex="0">` with a text label, or (simpler, recommended) keep the SVG as `role="img"` and offer the equivalent list where each course is a real link.
- Recommended structure: heading "Prerequisites" with a `<ul>` of courses and nested "Requires:" lists (the same data used to draw the SVG, generated from JSON by the same JS, so they cannot drift). Also meets 1.1.1, 1.3.1 and makes the information searchable and print-friendly.
- Do not encode edge meaning (required vs recommended) with color alone (1.4.1); use dash style plus label. Node text needs 4.5:1 contrast and edges/shapes 3:1 (1.4.11, background knowledge).
- Test: axe `svg-img-alt` rule, then NVDA+Firefox / VoiceOver+Safari reading the title and navigating the list.

### Gaps
- No source on screen reader behavior for interactive SVG nodes specifically.

## What axe-core catches vs misses; running axe in Playwright

### Takeaway
Deque's own study claims axe finds ~57% of issues by volume (57.38%), but this is a vendor figure using an issue-volume metric; by WCAG criteria, far fewer are fully automatable. axe cannot judge focus order, alt quality, reading experience, or most WCAG 2.2 criteria, so plan manual keyboard and screen reader passes. Running axe via `@axe-core/playwright` per view is cheap.

### Cited Findings
- Deque (March 2021): automated testing built on axe-core identified 57% of issues in its audit data (57.38% of total issues); metric is issue volume, not criteria count; Deque disputes the older "20-30%" estimate; axe deliberately avoids false positives; adding Deque's semi-automated Intelligent Guided Testing raises the claim to 80.39% — [Deque blog](https://www.deque.com/blog/automated-testing-study-identifies-57-percent-of-digital-accessibility-issues); [Deque coverage report](https://www.deque.com/automated-accessibility-coverage-report/)
- Deque's counting of criteria: automated rules map to only 16 of 50 WCAG 2.1 A/AA criteria in a strict criteria-count framing, which Deque calls too narrow (per the same search summary) — [Deque coverage report](https://www.deque.com/automated-accessibility-coverage-report/)
- axe-core 4.5 added the `target-size` rule (2.5.8); Deque said it would likely be the only WCAG 2.2 rule added to axe-core because few new criteria can be automated without false positives, and said Focus Appearance / Focus Not Obscured tests would come in a paid axe DevTools Pro product — [Deque axe-core 4.5](https://www.deque.com/blog/axe-core-4-5-first-wcag-2-2-support-and-more/); [Deque University target-size](https://dequeuniversity.com/rules/axe/4.8/target-size)
- Conflicting, unverified: one explainer says axe-core 4.9+ partially covers 2.4.11 — [DEV Community](https://dev.to/lawebe/wcag-22-every-new-success-criterion-explained-36f4) (not Deque documentation)
- Playwright usage: `new AxeBuilder({ page }).withTags([...]).analyze()` then assert `results.violations` is empty; Playwright docs also show a shared fixture with `withTags()` and `exclude()` — [Playwright docs](https://playwright.dev/docs/accessibility-testing); [@axe-core/playwright README](https://raw.githubusercontent.com/dequelabs/axe-core-npm/HEAD/packages/playwright/README.md). Tag example for 2.2 AA from a third-party guide: `['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']` — [Tessl guide](https://tessl.io/registry/testland/axe-a11y/1.3.12) (tag name not verified against axe's docs)
- WebAIM Million 2026 (Feb 2026 scan of 1M home pages): detectable WCAG 2 failures on 95.9% of pages (up from 94.8% in 2025, first regression in the study per secondary sources); 56.1 errors/page average (51 in 2025); top failures: low-contrast text 83.9%, missing alt text 53.1%, missing form labels 51%; same six error types led for seven years — [Priority Pixels summary](https://prioritypixels.co.uk/insights/web-accessibility-is-getting-worse-according-to-the-2026-webaim-million-report/); [Matthias Ott](https://matthiasott.com/notes/this-still-not-for-everyone); primary: [WebAIM Million](https://webaim.org/projects/million/) (not read directly)

### Inferences
- Because WebAIM's top failures are contrast, alt, labels, ATLAS's highest-yield automated checks are `color-contrast` in light AND dark themes, `image-alt`/`svg-img-alt`, `label` on textareas and range inputs, `button-name`, `link-name`.
- Practical Playwright plan: one test iterating every view (click sidebar item, wait for view un-hidden, run axe scoped with `.include('#view-x')`), run in both `colorScheme: 'light'|'dark'` via `page.emulateMedia`, plus once at 320x256 viewport; open every `<details>` first, since axe skips hidden content (background knowledge). Fail CI on violations, store the JSON as artifact. Add pa11y/Lighthouse a11y only as secondary; they are also axe-based (background knowledge).
- Manual minimum: keyboard-only pass (Tab/Shift+Tab/Enter/Space/Esc) of each view; NVDA+Firefox (or Chrome) on Windows and VoiceOver on iOS Safari (matches mobile-heavy audience) for view change, diagram, range reveal, tables.

### Gaps
- Primary Deque pages and WebAIM were not directly read (blocked); vendor-bias caveat applies to 57%.
- Current axe-core version/rule list for focus-not-obscured not confirmed.
- No independent (non-vendor) coverage estimate retrieved; the often-cited UK GDS 2017 audit (approx. 30-40% of issues found) was not retrieved so not asserted.

## Performance for global mobile users, Core Web Vitals, large JSON, compression and GitHub Pages caching

### Takeaway
Targets (75th percentile): LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1. GitHub Pages sends a fixed `Cache-Control: max-age=600` and offers no custom headers, so use content-hashed or versioned filenames cannot extend caching; instead minimize bytes, lazy-load the large JSON only when its view is opened, and cache it with a service worker or in IndexedDB if repeat visits matter.

### Cited Findings
- Thresholds, assessed at 75th percentile of page loads: LCP good <= 2.5 s, poor > 4 s; INP good <= 200 ms, poor > 500 ms; CLS good <= 0.1, poor > 0.25 — [web.dev: how CWV thresholds were defined](https://web.dev/articles/defining-core-web-vitals-thresholds)
- INP replaced FID as a Core Web Vital on 12 March 2024 — [Google Search Central update](https://developers.google.com/search/blog/2023/05/introducing-inp); [web.dev INP launch](https://web.dev/blog/inp-cwv-launch)
- GitHub Support has stated GitHub Pages sets `Cache-Control: max-age=600` on all content; custom headers are not possible; only ETag and Last-Modified are automatic; workarounds are a CDN in front (Cloudflare) or a different host — [GitHub community discussion 54257](https://Www.GitHub.com/orgs/community/discussions/54257); [community discussion 4444](https://github.com/orgs/community/discussions/4444)
- Compression: a third-party post says GitHub Pages gzips by default and has no Brotli; conflicting/unconfirmed evidence about Fastly's Brotli support. Vendor-reported Brotli gains over gzip (Akamai via Netlify): JS 14%, HTML 21%, CSS 17% smaller; JSON not measured — [GitLab Pages Brotli post](https://1010.gitlab.io/posts/brotli-gzip-gitlab-pages); [Netlify blog](https://www.netlify.com/blog/2020/05/20/gain-instant-performance-boosts-as-brotli-comes-to-netlify-edge/)
- Web Almanac 2025: median mobile home page about 2,362 KB (July 2025 crawl, +8.4% YoY per secondary coverage); mobile median JS reported as 697 KB in one source and 632 KB average in another (conflict) — [Web Almanac 2025 Page Weight](https://almanac.httparchive.org/en/2025/page-weight); [CaptainDNS](https://www.captaindns.com/en/blog/median-web-page-weight-2025)
- Web Almanac 2025: 48% of mobile sites pass all three CWV (44% in 2024, 36% in 2023); 51% of top-1,000 mobile sites pass. Per-metric mobile figures (about 62% good LCP, 77% INP, 81% CLS) come only from secondary sites — [Web Almanac 2025 Performance](https://almanac.httparchive.org/en/2025/performance); [DigitalApplied](https://www.digitalapplied.com/blog/core-web-vitals-benchmarks-2026-pass-rate-reference)
- CrUX origin-level (all devices, Jan 2026): 55.7% of origins have good CWV — [CrUX release notes](https://developer.chrome.com/docs/crux/release-notes)
- Treo CrUX analysis: median mobile round-trip time 147 ms vs 92 ms desktop (top 50,000 origins; undated) — [Treo RTT](https://treo.sh/rtt?sortBy=max)

### Inferences
- (Background knowledge, not verified here) Fetching a large JSON: `fetch` only on first view that needs it, show a loading state with `aria-busy`/status text, parse off the critical path, split catalog into per-view or per-entity shards, drop unused fields, minify (no whitespace), consider a compact columnar format. Keep main-thread tasks under 50 ms (chunk rendering with `requestIdleCallback`/`setTimeout`, or `content-visibility: auto` for long tables) to protect INP. Reserve space for async content (`min-height`, explicit SVG `width/height`/viewBox) to protect CLS; `font-display: swap` or system fonts to avoid LCP/CLS hits.
- With a flat 10-minute cache, repeat visits revalidate (ETag, 304) after 10 minutes; a service worker with a versioned cache (stale-while-revalidate) is the vanilla fix and also helps offline for slow networks. Use `<link rel=preload>`/`modulepreload` only for critical assets.
- If gzip is on and Brotli is unavailable, ship a smaller payload rather than relying on compression; verify real transfer size with `curl -sI -H 'Accept-Encoding: gzip, br' <url>` or Playwright `response.headers()['content-encoding']`.
- Cheap CI: Lighthouse CI (mobile preset, simulated slow 4G, 4x CPU throttling) with budgets on LCP/CLS/TBT (TBT as a lab proxy for INP), plus a bytes budget check on the JSON file size. Field data is unavailable for a low-traffic static site (no analytics), so lab tests are the only signal; throttle to represent emerging-market devices.

### Gaps
- Did not read GitHub's official Pages limits/caching docs (blocked); max-age=600 sourced from community/support statements; compression status of GitHub Pages is unconfirmed.
- Per-metric mobile CWV figures and mobile JS median not confirmed from the Almanac text.
- GitHub Pages soft limits (1 GB site, 100 GB/month bandwidth, per GitHub docs) are background knowledge only and were not retrieved.

## Evidence on applicants' devices and networks globally

### Takeaway
Mobile is roughly half to two-thirds of web traffic and higher in large applicant markets such as India; global network latency is materially higher on mobile, so design to mobile-first, mid-range-device, high-latency assumptions. No Minerva-specific or per-country applicant device data was found.

### Cited Findings
- StatCounter worldwide platform share: mobile about 50-52% in June-August 2026, with one page showing 60.11% for September 2026 (an outlier needing verification) — [StatCounter](https://gs.statcounter.com/platform-market-share/desktop-mobile/worldwide)
- StatCounter India: mobile 66.42% (July 2026), 67.43% (June 2026) — [StatCounter India](https://gs.statcounter.com/platform-market-share/desktop-mobile/india)
- Mobile coverage: World Bank says mobile network coverage reaches more than 98% of the global population; GSMA estimates about 300 million people (4%) lack mobile broadband coverage — [World Bank](https://openknowledge.worldbank.org/server/api/core/bitstreams/706410ab-0833-41f0-96e8-51bb34383d8e/content); [GSMA State of Mobile Internet Connectivity 2025](https://www.gsma.com/somic/wp-content/uploads/2025/09/The-State-of-Mobile-Internet-Connectivity-2025-Network-Coverage-and-Infrastructure.pdf)
- Single-country example (secondary): Nigeria 4G share rose from 25.1% to 54.3% over the period covered — [Intelpoint](https://intelpoint.co/?p=4410)
- Median mobile RTT 147 ms (see above) — [Treo](https://treo.sh/rtt?sortBy=max)

### Inferences
- A 50-67% mobile share (and likely higher for applicants in the Global South, where StatCounter Africa data was not retrieved) justifies mobile-first priorities: 24px+ targets, 320px reflow, small JS/JSON, and performance budgets measured on throttled mid-range Android. Treat desktop as important but secondary.
- Because the StatCounter worldwide series swings (50-60%) between months, cite a range, not a point value.

### Gaps
- No median device spec (RAM/CPU) or per-country applicant data retrieved; Chrome UX Report BigQuery by country/form factor/connection type would answer this but was not queried. Opensignal and DataReportal results were dated or not mobile-global-median.
- StatCounter Africa figures not returned.

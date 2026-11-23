# Offline/PWA, data durability, and privacy-respecting feedback for ATLAS

Research date: 2026-11-23. Limitation: WebFetch was blocked (webkit.org, developer.mozilla.org, web.dev not in the session's allowed network domains), so every finding below comes from WebSearch result summaries, not from reading the primary pages. Primary-source URLs are given so a reviewer can verify. Where a claim rests on a secondary source, it is marked.

## A1. Service worker strategy, GitHub Pages subpaths, installability

### Takeaway
A service worker is optional for installability now, but it is what makes ATLAS usable on unreliable networks. On a project subpath, put `sw.js` at the repo root of the site and register it with a matching scope, because GitHub Pages cannot set the `Service-Worker-Allowed` header (community-sourced). I found no primary source in this session on cache-first versus stale-while-revalidate tradeoffs, so the strategy advice below is inference.

### Cited Findings
- MDN says a service worker is not required for a PWA to be installable, though many use one for offline support — [MDN Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_Installable) (via search summary).
- Per search summaries, MDN says Chrome (desktop and Android), desktop Safari and desktop Edge let users install any site as an app, with or without a manifest. web.dev says users can install an app that fails the PWA criteria — [web.dev install criteria](https://web.dev/articles/install-criteria).
- A DZone article says Lighthouse 12 (April 2024) removed its PWA category after Chrome relaxed installability. It also claims iOS 26 now opens any site added to the Home Screen as a web app by default. This is a single secondary source, unverified — [DZone](https://dzone.com/articles/ios-pwa-offline-caching).
- Some guides still say Chrome needs a service worker with a fetch handler for the install prompt. This conflicts with MDN and looks outdated — [Front-end checklist](https://frontendchecklist.io/rules/html/pwa-installability).
- The `Service-Worker-Allowed` header broadens a worker's default scope. A worker at `/product/sw.js` cannot register for scope `/` without it — [MDN Service-Worker-Allowed](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Service-Worker-Allowed).
- A community gist states GitHub Pages cannot set custom headers, so the worker must live at the project subpath root with a scope matching the deployment path. I found no official GitHub doc confirming this — [gist](https://gist.github.com/BLamy/0025ded94834009729c57775707cd822).

### Inferences
- With versioned assets (`?v=`) and JSON data, a reasonable shape is: precache the app shell and versioned assets under a cache name that includes the app version; serve the HTML shell network-first with a cache fallback; serve JSON data stale-while-revalidate. Delete old caches on `activate`. This is my reasoning, not a sourced recommendation.
- `?v=` query strings must be handled deliberately: either match with `ignoreSearch: false` so each version is its own cache entry, or key the cache name to the version. The pitfall to avoid is a cache-first shell pointing at old asset versions forever. Not verified against a source.
- Update prompts: skip `skipWaiting()` auto-activation, and show a small "new version, reload" notice, so a person mid-journal is not reloaded under them. Inference.
- Service workers do not touch localStorage, so adding one does not put user writing at risk. The worker also never sees or sends user data unless coded to, which fits the no-collection rule.
- A service worker also registers as a Safari "script-writable" item (see A2), so it is subject to the same eviction.

### Gaps
- No primary read of web.dev's offline cookbook or the Chrome install criteria page, so no verified list of 2026 manifest fields (name, icons 192/512, start_url, display) or the iOS 26 behavior. Confirm on web.dev and Apple docs.
- No official GitHub Pages doc found on scope or headers.

## A2. localStorage durability, eviction, quotas, IndexedDB

### Takeaway
Safari deletes script-writable storage (localStorage, IndexedDB, service worker registrations) after 7 days of Safari use without interaction with the site. Home screen web apps keep their own counter, so installing ATLAS to the Home Screen largely avoids eviction. Because many applicants will use ATLAS in a browser tab, the manual JSON backup remains necessary, and the app should tell Safari users once that adding to the Home Screen protects their notes.

### Cited Findings
- The 7-day cap covers IndexedDB, LocalStorage, Media keys, SessionStorage and service worker registrations, counted in days of Safari use without interaction — [WebKit: Full Third-Party Cookie Blocking and More](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/) (via search summary; I could not open the post).
- Home screen web apps have their own usage counter, separate from Safari's. One source says the policy does not apply to installed PWAs; another says a home screen app's counter would effectively never reach seven days. The second is a third-party reading, not WebKit's wording — same WebKit post and [Ionic](https://ionic.io/blog/is-apple-trying-to-kill-pwas).
- WebKit bug 237350 (2022) argues the cap on a home screen app's main domain should apply only to JavaScript-set cookies; a WebKit engineer said the cap is an expiry policy on script-written cookies. Status was open at the snapshot — [WebKit bug 237350](https://bugs.webkit.org/show_bug.cgi?id=237350). Bug 211775 has a tester seeing localStorage persist in a home screen app while cookies were deleted, so reports are mixed — [WebKit bug 211775](https://bugs.webkit.org/show_bug.cgi?id=211775).
- Safari 17 quota: up to 60% of total disk per origin in a browser app, 15% for other apps. A standalone web app gets the same origin and overall quota as in the browser. Persistence requests are granted using heuristics such as whether the site is a Home Screen Web App — [WebKit: Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/) (via search summary). A SilverBullet forum post says roughly 20%; this conflicts with WebKit and is unreliable — [forum](https://community.silverbullet.md/t/available-storage-on-mobile-device/2132/12).
- A WebKit bug report says `navigator.storage.persist()` always returned false despite documented Safari 17 support; resolution not verified — [WebKit bug 256267](https://bugs.webkit.org/show_bug.cgi?id=256267).
- Chromium grants persistent storage silently on engagement signals (installed or bookmarked, notification permission). Denied requests can be retried. Firefox prompts the user. `persist()` is listed from Safari 15.2 — [web.dev Persistent storage](https://web.dev/articles/persistent-storage); [caniuse persist](https://caniuse.com/mdn-api_storagemanager_persist).
- A tester was told by Apple's forum threads to expect data loss on iOS PWAs in some cases; see [Apple Developer Forums 710157](https://developer.apple.com/forums/thread/710157) (title only; contents not read).

### Inferences
- Call `navigator.storage.persist()` after the first save, and treat a `false` result as normal, not an error. It costs one line and never harms.
- localStorage is synchronous, string-only, and typically capped near 5 MB per origin (my background knowledge; not verified here). Journals as text will fit. IndexedDB buys more space and structured data but not better eviction: Safari's 7-day rule covers both, and Chromium's best-effort eviction applies to both. So switching storage engines is not a durability fix. Only install, `persist()`, and exports are.
- Wrap every localStorage read and write in try/catch, since private modes and blocked storage throw.

### Gaps
- No verified current status (late 2026) of the home screen exemption in WebKit's own words, nor of `persist()` on iOS. Needs a device test on a real iPhone, in line with the project's rule that the agent is never the tester.
- Chrome and Firefox quota numbers were not retrieved (MDN fetch blocked).

## A3. Is file backup best practice? Alternatives

### Takeaway
A downloaded JSON file is still the only cross-browser, server-free backup. The File System Access API's save picker is Chromium-only, so it can only be a progressive enhancement over `<a download>`.

### Cited Findings
- `showSaveFilePicker()` is unsupported in Firefox (all versions listed, to 154) and Safari (desktop to 27, iOS to 26.5). Chrome and Edge support it from 86, Opera from 72 — [caniuse](https://caniuse.com/mdn-api_window_showsavefilepicker).
- web.dev recommends feature detection (`'showSaveFilePicker' in window`) with an `<a download>` fallback — [web.dev How to save a file](https://web.dev/articles/files/save-a-file).

### Inferences
- Keep `<a download>` export plus `<input type=file>` import as the baseline. On iOS the file lands in Files or the share sheet; the `navigator.share({files})` route may give a better "save to iCloud/Drive" path (not researched here).
- Nudge, do not nag: show "last backed up" date and prompt after meaningful new writing. Also include a schema version in the JSON and validate on import.
- Cross-device (city rotation, new phone) is the same file moved by the person: email-to-self or cloud drive. That keeps the no-accounts rule.

### Gaps
- No source on iOS share-sheet file saving or Web Share API Level 2 support; not searched.

## B1. Feedback without analytics; privacy-preserving analytics; legal context

### Takeaway
Plausible and GoatCounter are privacy-light, but they still process visitor requests (IP-derived hashes) on a vendor server, so they are not consistent with "never collect applicant data" read strictly. Qualitative, person-initiated channels are consistent with it. GitHub Pages itself logs visitor IPs, which the project cannot turn off, so the privacy page must say so.

### Cited Findings
- Nielsen: five users find about 85% of usability problems in a qualitative test; run several small rounds (three tests of five beat one of fifteen). Caveats: 3 to 4 users per distinct group; qualitative only (about 20 for quantitative); more users needed for a more usable interface — [NN/g Why You Only Need to Test with 5 Users](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/).
- GoatCounter's own GDPR page says a consent notice is "probably" not needed (no personally identifiable information; legitimate interest), and admits there is little case law and enforcement varies; it suggests a notice if you want to be sure. Its privacy page says nothing is stored in the browser (cookies, localStorage). Page dated 2021 — [GoatCounter GDPR](https://www.goatcounter.com/gdpr); [GoatCounter privacy](https://goatcounter.com/privacy).
- Plausible derives a daily visitor identifier from request data and a salt rotated every 24 hours, and says raw IPs and user agents are not stored. A third-party guide notes that identifiers derived from IP are still arguably personal data needing a lawful basis — [Plausible data policy](https://plausible.io/data-policy).
- GitHub says it may collect technical information from Pages visitors, including logs of visitor IP addresses, for security — [GitHub General Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) (via search summary; the exact quote was from a secondary quotation).
- CNIL: audience-measurement trackers are exempt from consent only under conditions (user information, objection mechanism, limited to audience measurement; providers reusing data for themselves fall outside). It publishes a self-evaluation tool, updated 4 July 2025 per a secondary report — [CNIL Sheet 16](https://www.cnil.fr/en/sheet-ndeg16-use-analytics-your-websites-and-applications). This covers France; other member states differ.
- Age of digital consent: UK sets 13 under Article 8 of UK GDPR (ICO). The EU default is 16 and states may go as low as 13, with examples Austria 14 and Germany 16 — [ICO](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr/what-are-the-rules-about-an-iss-and-consent); [CIPL white paper (2018)](https://www.informationpolicycentre.com/wp-content/uploads/2018/03/cipl_white_paper_-_gdpr_implementation_in_respect_of_childrens_data_and_consent.pdf). One 2026 law-firm item says a UK Act (Royal Assent 29 April 2026) lets the Secretary of State change the consent age within 13 to 16, and also states the current age as 16, conflicting with the ICO — [Stevens & Bolton](https://www.stevens-bolton.com/?p=15732). Verify on legislation.gov.uk.
- The ICO Children's Code has 15 standards; the ICO treats profiling and marketing uses of children's data as high-risk — [ICO Annex B](https://ico.org.uk/for-organisations/guide-to-data-protection/ico-codes-of-practice/age-appropriate-design-a-code-of-practice-for-online-services/annex-b-age-and-developmental-stages). Applicants aged 16 to 17 are within the code's definition of a child (under 18), per my background knowledge, not verified here.

### Inferences
- Strict reading of the hard rule: any analytics, even cookieless, collects visit records tied to people's requests. They are likely not consistent. If the owner wants numbers, the honest options are (a) no counts, or (b) a rule change decided by the owner with a documented decision. Do not slip it in.
- Consistent channels: a "send feedback" link that opens a prefilled mailto or a GitHub issue template (note: GitHub issues are public and tied to a GitHub account, so offer mailto as the private route and warn not to include personal details); an opt-in one-question form on a separate host, clearly outside the app, with no identifiers; five-user moderated usability sessions per audience (applicants, current students: 3 to 4 each); a short diary study with volunteers; and asking admissions or student ambassadors what questions they keep getting.
- Self-report and artifact-based signals that need no tracking: the backup file is only seen if a person chooses to send it, so ask for none by default.
- Hosting: the GitHub Pages IP log is outside the project's control; state it in a plain-language privacy note. Self-hosting is out of scope. Avoid loading third-party fonts or scripts, which would add transfers to other parties (a German court ruling on Google Fonts is from my memory, unverified).
- Minors: consent-based collection from 16 to 17 year olds is the riskiest area, so the no-collection rule also removes parental-consent and DPIA questions. That is an argument for keeping the rule.

### Gaps
- GitHub's exact wording and retention for Pages logs not read directly.
- No legal advice; EU member-state specifics and ePrivacy Article 5(3) applicability to localStorage use (EDPB Guidelines 2/2023) not read. Strictly-necessary storage for functionality the user requested is generally treated as exempt, which would cover saved plans, per my background knowledge; verify.

## B2. What privacy-first educational tools do to evaluate impact

### Takeaway
I found no credible primary source on how specific privacy-first education tools evaluate impact. The search returned general EdTech privacy research and vendor marketing.

### Cited Findings
- A Common Sense privacy evaluation kit exists for schools assessing tools — [Common Sense Privacy](https://privacy.commonsense.org/evaluation/evaluationkit) (title only, not read).
- A study of 18 school district staff found administrators often lack resources to assess EdTech privacy risks — [NSF PAR 10407360](https://par.nsf.gov/servlets/purl/10407360).
- A vendor guide says privacy-first feedback must be opt-in and clearly beneficial to the person; it is marketing and weak evidence — [Zigpoll](https://www.zigpoll.com/content/top-6-privacyfirst-marketing-tips-midlevel-projectmanagement).

### Inferences
- The defensible pattern is qualitative and small-n: interviews, usability rounds, opt-in surveys, and partner-reported outcomes (for example ambassadors saying whether applicants arrived better prepared), accepting that it will not give usage counts.

### Gaps
- No evidence on Khan Academy, Anki, Duolingo or similar evaluation practices; not found. A follow-up should read published efficacy reports and the learning-analytics literature on privacy-preserving evaluation.

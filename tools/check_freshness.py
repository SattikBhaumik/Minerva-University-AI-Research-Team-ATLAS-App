#!/usr/bin/env python3
"""ATLAS freshness checker: has Minerva changed anything ATLAS was built from?

Usage:
  python3 tools/check_freshness.py [--json] [--links PATH] [--outcomes PATH]
Exit codes:
  0  everything unchanged
  1  changes found (the markdown report lists them)
  2  the checker could not run (every URL unreachable: network/infra, not a finding)
Checks: every URL in data/catalog/links.json answers 200; catalogLatest still
redirects to the rev-410 PDF (a new revision means ATLAS must be re-parsed);
each college's headline percent, headline text and sample line in outcomes.json
are still on the majors page; brochure and research.json source URLs answer 200.
Stdlib only. Weekly run: .github/workflows/atlas-freshness.yml.
"""
import argparse
import html
import json
import pathlib
import re
import sys
import time
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data" / "catalog"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/124.0 Safari/537.36")
EXPECTED_REVISION = "course-catalog-rev-410.pdf"
TIMEOUT = 30


def fetch(url, want_body=False):
    """Return (status, final_url, text). status None means a network error."""
    last = "unknown"
    for attempt in range(2):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                body = r.read().decode("utf-8", "replace") if want_body else ""
                return r.status, r.geturl(), body
        except urllib.error.HTTPError as e:
            return e.code, url, ""
        except Exception as e:  # URLError, timeout, reset, DNS
            last = f"{type(e).__name__}: {e}"
            time.sleep(2)
    return None, url, last


def page_text(raw):
    raw = re.sub(r"(?is)<(script|style)\b.*?</\1>", " ", raw)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", raw)))


def check(links_path, outcomes_path):
    links = json.loads(pathlib.Path(links_path).read_text())
    outcomes = json.loads(pathlib.Path(outcomes_path).read_text())
    research = json.loads((CATALOG / "research.json").read_text())
    findings, probes = [], []  # probes: (url, status) for every request made

    def probe(label, url, body=False):
        status, final, text = fetch(url, body)
        probes.append((url, status))
        if status is None:
            findings.append({"kind": "unreachable", "what": label, "url": url, "detail": text})
        elif status != 200:
            findings.append({"kind": "http", "what": label, "url": url, "detail": f"HTTP {status}"})
        return status, final, text

    for name, url in (links.get("concentrationPages") or {}).items():
        if url:
            probe(f"Concentration page: {name}", url)
    probe("Course catalog PDF (catalogPdf)", links["catalogPdf"])
    majors = links["majorsPage"]
    for code, tab in (links.get("collegeTabs") or {}).items():
        probe(f"Majors page tab {code}", f"{majors}?tab={tab}")

    status, final, _ = probe("Latest catalog (catalogLatest)", links["catalogLatest"])
    if status == 200 and not final.endswith(EXPECTED_REVISION):
        findings.append({"kind": "new_catalog", "what": "New catalog revision published",
                         "url": final, "detail": "ATLAS must be re-parsed"})

    status, _, raw = probe("Majors page (outcome text)", majors, body=True)
    text = page_text(raw) if status == 200 else ""
    if text:
        for code, c in outcomes["colleges"].items():
            wanted = {"headline percent": c["headline"]["percent"],
                      "headline text": c["headline"]["text"].rstrip("."),
                      "sample line": c["sample"].lstrip("*").strip()}
            for what, needle in wanted.items():
                if needle not in text:
                    findings.append({"kind": "outcome_changed", "what": f"{code} {what} vanished",
                                     "url": majors, "detail": needle})
    for code, c in outcomes["colleges"].items():
        if c.get("brochure", {}).get("url"):
            probe(f"Brochure {code}", c["brochure"]["url"])
    probe("Research source (research.json)", research["source"])

    if probes and all(s is None for _, s in probes):
        return None, probes
    return findings, probes


def report(findings, n):
    if not findings:
        return f"## ATLAS freshness: unchanged\n\nChecked {n} URLs; nothing changed.\n"
    out = [f"## ATLAS freshness: {len(findings)} finding(s)\n", f"Checked {n} URLs.\n"]
    for f in findings:
        if f["kind"] == "new_catalog":
            out.append(f"- **New catalog revision published: {f['url']}** (ATLAS must be re-parsed)")
        elif f["kind"] == "outcome_changed":
            out.append(f"- {f['what']} on {f['url']}: `{f['detail']}`")
        else:
            out.append(f"- {f['what']}: {f['detail']} - {f['url']}")
    return "\n".join(out) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--json", action="store_true", help="also print findings as JSON")
    ap.add_argument("--links", default=str(CATALOG / "links.json"))
    ap.add_argument("--outcomes", default=str(CATALOG / "outcomes.json"))
    a = ap.parse_args()
    try:
        findings, probes = check(a.links, a.outcomes)
    except Exception as e:
        print(f"Checker could not run: {type(e).__name__}: {e}")
        return 2
    if findings is None:
        print("Checker could not run: every URL was unreachable (network or proxy down).")
        return 2
    print(report(findings, len(probes)))
    if a.json:
        print(json.dumps({"findings": findings, "checked": len(probes)}, indent=2))
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())

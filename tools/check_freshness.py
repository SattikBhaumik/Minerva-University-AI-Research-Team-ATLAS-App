#!/usr/bin/env python3
"""ATLAS freshness checker: has Minerva changed anything ATLAS was built from?

Usage:
  python3 tools/check_freshness.py [--json] [--links PATH] [--outcomes PATH]
                                   [--fingerprints PATH] [--update-fingerprints]
Exit codes:
  0  everything unchanged
  1  changes found (the markdown report lists them)
  2  the checker could not run (every URL unreachable: network/infra, not a finding)
Checks: every URL in data/catalog/links.json answers 200; catalogLatest still
redirects to the rev-410 PDF (a new revision means ATLAS must be re-parsed);
each college's headline percent, headline text and sample line in outcomes.json
are still on the majors page; brochure and research.json source URLs answer 200.

Watched pages (data/catalog/fingerprints.json): the academic calendar page, the
financial aid page and the Undergraduate Student Handbook PDF are fetched, their
text normalized, and the SHA-256 compared with the recorded one. A change means a
human must re-check the data derived from it. The handbook PDF URL carries a
content hash and moves on every republish, so the page that links to it
("linkedFrom") is also re-read and the link re-found; a moved link is a finding.
Normalization (so cosmetic churn is not a finding): HTML drops comments (Webflow
"Last Published"), script/style/noscript/svg blocks and tags, unescapes entities,
removes data-wf-* style ids and "Last Published" stamps, and collapses
whitespace; PDFs use `pdftotext` text with whitespace collapsed (raw bytes if
pdftotext is missing, which is then stable only for byte-identical files).
`--update-fingerprints` rewrites the file after a human re-checks the data.
Watched-page network failures are findings only if other URLs answered; if no
URL at all is reachable the run is exit 2 as before.
Stdlib only. Weekly run: .github/workflows/atlas-freshness.yml.
"""
import argparse
import html
import json
import pathlib
import hashlib
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data" / "catalog"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/124.0 Safari/537.36")
EXPECTED_REVISION = "course-catalog-rev-410.pdf"
TIMEOUT = 30


def fetch(url, want_body=False, raw=False):
    """Return (status, final_url, text). status None means a network error.
    raw=True returns the body as bytes instead of text."""
    last = "unknown"
    for attempt in range(2):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                if raw:
                    return r.status, r.geturl(), r.read()
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


def normalize_html(raw):
    raw = re.sub(r"(?s)<!--.*?-->", " ", raw)
    raw = re.sub(r"(?is)<(script|style|noscript|svg)\b.*?</\1>", " ", raw)
    text = page_text(raw)
    text = re.sub(r"(?i)last published:?\s*\w{3} \w{3} \d+ \d{4}[^)]*\)?", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_pdf(data):
    if shutil.which("pdftotext"):
        with tempfile.TemporaryDirectory() as d:
            f = pathlib.Path(d) / "in.pdf"
            f.write_bytes(data)
            r = subprocess.run(["pdftotext", "-layout", str(f), "-"],
                               capture_output=True, timeout=120)
            if r.returncode == 0:
                return re.sub(r"\s+", " ", r.stdout.decode("utf-8", "replace")).strip().encode()
    return data


def digest(kind, body):
    if kind == "pdf":
        return hashlib.sha256(normalize_pdf(body)).hexdigest()
    return hashlib.sha256(normalize_html(body.decode("utf-8", "replace")).encode()).hexdigest()


def find_handbook_link(page_html, hint):
    for m in re.finditer(r'href="([^"]+\.pdf)"', page_html):
        u = html.unescape(m.group(1))
        if hint.lower() in urllib.parse.unquote(u).lower():
            return u
    return None


def compute_page(entry):
    """Return (sha256 or None, link or None, error or None) for a watched page."""
    url = entry["url"]
    link = None
    if entry.get("linkedFrom"):
        status, _, page = fetch(entry["linkedFrom"], want_body=True)
        if status != 200:
            return None, None, f"linking page: {'network error' if status is None else 'HTTP ' + str(status)}"
        link = find_handbook_link(page, entry.get("linkHint", ""))
        if link is None:
            return None, None, "PDF link not found on linking page"
        url = link
    status, _, body = fetch(url, raw=True)
    if status != 200:
        return None, link, "network error" if status is None else f"HTTP {status}"
    return digest(entry["kind"], body), link, None


def check_watched(fp_path, findings, probes):
    fp = json.loads(pathlib.Path(fp_path).read_text())
    for e in fp["pages"]:
        sha, link, err = compute_page(e)
        probes.append((e["url"], None if err and ("network" in err) else 200))
        if err:
            findings.append({"kind": "watched_error", "what": f"Watched page {e['label']}",
                             "url": e["url"], "detail": err})
            continue
        if link and link != e["url"]:
            findings.append({"kind": "watched_changed", "what": e["label"], "url": e["linkedFrom"],
                             "detail": f"{e['label']} link changed since {fp['readOn']}: "
                                       f"now {link}; re-check data derived from it"})
        elif sha != e["sha256"]:
            findings.append({"kind": "watched_changed", "what": e["label"], "url": e["url"],
                             "detail": f"{e['label']} changed since {fp['readOn']}: re-check "
                                       f"{e.get('notes', 'derived data')}"})


def update_fingerprints(fp_path):
    p = pathlib.Path(fp_path)
    fp = json.loads(p.read_text())
    for e in fp["pages"]:
        sha, link, err = compute_page(e)
        if err:
            print(f"Cannot update {e['label']}: {err}")
            return 2
        e["sha256"] = sha
        if link:
            e["url"] = link
    fp["readOn"] = time.strftime("%Y-%m-%d", time.gmtime())
    p.write_text(json.dumps(fp, indent=2) + "\n")
    print(f"Fingerprints rewritten ({len(fp['pages'])} pages, readOn {fp['readOn']}).")
    return 0


def check(links_path, outcomes_path, fp_path=None):
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
    if fp_path and pathlib.Path(fp_path).exists():
        check_watched(fp_path, findings, probes)

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
        elif f["kind"] == "watched_changed":
            out.append(f"- {f['detail']} - {f['url']}")
        else:
            out.append(f"- {f['what']}: {f['detail']} - {f['url']}")
    return "\n".join(out) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--json", action="store_true", help="also print findings as JSON")
    ap.add_argument("--links", default=str(CATALOG / "links.json"))
    ap.add_argument("--outcomes", default=str(CATALOG / "outcomes.json"))
    ap.add_argument("--fingerprints", default=str(CATALOG / "fingerprints.json"))
    ap.add_argument("--update-fingerprints", action="store_true",
                    help="recompute and rewrite the fingerprints file, then exit")
    a = ap.parse_args()
    if a.update_fingerprints:
        try:
            return update_fingerprints(a.fingerprints)
        except Exception as e:
            print(f"Checker could not run: {type(e).__name__}: {e}")
            return 2
    try:
        findings, probes = check(a.links, a.outcomes, a.fingerprints)
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

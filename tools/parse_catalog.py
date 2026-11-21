#!/usr/bin/env python3
"""Parse Minerva's course catalog PDF (as text) into data/catalog/catalog-*.json.

    pdftotext -layout course-catalog-rev-410.pdf catalog.txt
    python3 tools/parse_catalog.py catalog.txt data/catalog/catalog-2026.v410.json

The latest catalog PDF: https://minerva.edu/academics/course-catalog-pdf/
Page ranges (majors 9-13, concentrations 15-22, minors 24-30, courses 31-82)
fit Revision 2026.v410; check them against a new revision's contents pages.
"""
import re, sys, json
src, out = sys.argv[1], sys.argv[2]
pages = {}; pg = 0
for line in open(src, encoding='utf-8'):
    m = re.search(r'Page (\d+) of 82', line)
    if m: pg = int(m.group(1)); continue
    if line.startswith('Revision 2026') or not line.strip(): continue
    pages.setdefault(pg, []).append(line.rstrip('\n'))
def lines(a, b):
    return [l.strip() for p in range(a, b + 1) for l in pages.get(p, [])]
CODE = r'[A-Z]{1,3}\d{2,5}[A-Z]?'
FIELDS = ('College:', 'Program Requirement:', 'Course Requirements:')

def parse_programs(ls, suffix):
    progs, cur, mode = [], None, None
    for l in ls:
        m = re.fullmatch(rf'(.+) {suffix}', l)
        if m and not l.startswith(('This program', 'Arts & Humanities majors')) and len(l) < 90:
            cur = {'name': m.group(1), 'description': '', 'college': None, 'courses': [], 'rules': []}
            progs.append(cur); mode = 'desc'; continue
        if cur is None: continue
        if l.startswith('College:'): cur['college'] = l.split(':', 1)[1].strip(); mode = None; continue
        if l.startswith('Program Requirement:'): mode = None; continue
        if l.startswith('Course Requirements:'): mode = 'courses'; continue
        mc = re.fullmatch(rf'({CODE}): (.+)', l)
        if mode == 'courses' and mc: cur['courses'].append({'code': mc.group(1), 'title': mc.group(2)}); continue
        if mode == 'courses' and cur['courses'] and not l.startswith(('This program', 'Arts & Humanities majors')) and not re.match(CODE, l) and cur['rules'] == []:
            cur['courses'][-1]['title'] += ' ' + l; continue
        if l.startswith(('This program', 'Arts & Humanities majors')) or mode == 'rules':
            if l.startswith(('This program', 'Arts & Humanities majors')): cur['rules'].append(l)
            else: cur['rules'][-1] += ' ' + l
            mode = 'rules'; continue
        if mode == 'desc': cur['description'] += (' ' if cur['description'] else '') + l
    return progs

majors = parse_programs(lines(9, 13), 'Major')
concs = parse_programs(lines(15, 22), 'Concentration')
minors = parse_programs(lines(24, 30), 'Minor')

courses, cur, mode = [], None, None
for l in lines(31, 82):
    m = re.fullmatch(rf'({CODE}) / (.+)', l)
    if m:
        cur = {'code': m.group(1), 'title': m.group(2), 'description': '', 'note': '', 'prerequisites': '', 'corequisites': '', 'type': '', 'credits': None}
        courses.append(cur); mode = 'desc'; continue
    if cur is None or l == 'Course Offerings': continue
    for key, field in (('Note:', 'note'), ('Prerequisites:', 'prerequisites'), ('Corequisites:', 'corequisites'), ('Co-requisites:', 'corequisites'), ('Course Type:', 'type')):
        if l.startswith(key): cur[field] = l[len(key):].strip(); mode = field; break
    else:
        if l.startswith('Credit Units:'): cur['credits'] = float(l.split(':')[1]); mode = None
        elif mode in ('desc', 'note', 'prerequisites', 'corequisites'):
            k = 'description' if mode == 'desc' else mode
            joined = re.search(r'[a-z]-$', cur[k]) and not re.match(r'(and|or|to)\b', l)
            cur[k] = (cur[k] + ('' if joined else ' ') + l).strip()
json.dump({'source': 'Minerva University Course Catalog, Revision 2026.v410 (2026-11-16)', 'majors': majors, 'concentrations': concs, 'minors': minors, 'courses': courses}, open(out, 'w'), indent=1, ensure_ascii=False)
print('majors', len(majors), [x['name'] for x in majors])
print('concentrations', len(concs), 'minors', len(minors), 'courses', len(courses))
bad = [c['name'] for c in concs if len(c['courses']) != 3]
print('concentrations without exactly 3 courses:', bad)
codes = {c['code'] for c in courses}
missing = sorted({x['code'] for c in concs + majors for x in c['courses']} - codes)
print('required codes missing from course list:', missing)
print('course types:', sorted({c['type'] for c in courses}))
print('courses with empty description:', [c['code'] for c in courses if not c['description']][:40])

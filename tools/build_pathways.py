#!/usr/bin/env python3
"""Build data/pathways.json and the catalog appendix from Minerva's own data.

    python3 tools/build_pathways.py

Inputs (all in data/catalog/):
  catalog-2026.v410.json  courses, majors, concentrations, minors (tools/parse_catalog.py)
  outcomes.json           each college's published outcomes, transcribed verbatim
  editorial.json          ATLAS's own words: preference questions, year labels

Every course name, description, prerequisite and statistic shown in ATLAS
comes from the first two files; editorial.json is the only hand-written
text. Choices never exceed three options: longer lists are staged behind a
"More" tab, in catalog order.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CAT = json.loads((ROOT / 'data/catalog/catalog-2026.v410.json').read_text())
OUT = json.loads((ROOT / 'data/catalog/outcomes.json').read_text())
ED = json.loads((ROOT / 'data/catalog/editorial.json').read_text())

AS_OF = '2026-11-21'
CATALOG_URL = 'https://minerva.edu/academics/course-catalog-pdf/'
CATALOG_SRC = {'label': 'Course Catalog 2026.v410', 'url': CATALOG_URL}
MAJORS_URL = 'https://www.minerva.edu/undergraduate/majors-concentrations/'
TABS = {'NS': 'natural-sciences', 'CS': 'computational-sciences'}

ORDER = ['AH', 'B', 'CS', 'NS', 'SS']
COLLEGE = {
    'AH': ('Arts & Humanities', 'Arts and Humanities'),
    'B': ('Business', 'Business'),
    'CS': ('Computational Sciences', 'Computational Sciences'),
    'NS': ('Natural Sciences', 'Natural Sciences'),
    'SS': ('Social Sciences', 'Social Sciences'),
}
CODE_RE = re.compile(r'\b([A-Z]{1,3}\d{2,5}[A-Z]?)\b')
COURSE = {c['code']: c for c in CAT['courses']}
MAJOR = {m['name']: m for m in CAT['majors']}


def prefix(code):
    return re.match(r'[A-Z]+', code).group(0)


def first_sentence(text):
    m = re.match(r'(.+?(?<!\b[A-Z])[.!?])(\s|$)', text.strip())
    return (m.group(1) if m else text).strip()


def course_line(code, with_needs=True):
    c = COURSE[code]
    line = f"{code} {c['title']}"
    needs = prereq_codes(code)
    if with_needs and needs:
        line += ' · needs ' + needs
    return line


def is_foundation(c):
    """Cornerstones (and their old codes) and Year 1 programming: everyone has them."""
    return COURSE[c]['type'].startswith(('Cornerstone', 'Non Degree', 'Structure')) or c in ('CS51B', 'PR51')


def prereq_groups(code):
    """Prerequisite clauses as lists of alternative codes, foundations removed."""
    groups = []
    for clause in re.split(r', (?=[A-Z]{1,3}\d)', COURSE[code]['prerequisites']):
        codes = list(dict.fromkeys(c for c in CODE_RE.findall(clause) if c in COURSE and not is_foundation(c)))
        if codes:
            groups.append((codes, 'corequisite' in clause))
    return groups


def prereq_codes(code):
    """Prerequisites as codes, keeping 'or' groups: 'NS110L or NS110U, NS113'."""
    groups = []
    for codes, coreq in prereq_groups(code):
        group = ' or '.join(codes)
        groups.append(group + ' (taken together)' if coreq else group)
    return ', '.join(dict.fromkeys(groups))


def outcome_source(col):
    return OUT['colleges'][col]['brochure']


def major_source(col):
    return {'label': COLLEGE[col][0], 'url': MAJORS_URL + (f"?tab={TABS[col]}" if col in TABS else '')}


def core(col):
    return [c['code'] for c in CAT['courses'] if c['type'] == 'Major Core' and prefix(c['code']) == col]


def concentrations(col):
    return [c for c in CAT['concentrations'] if c['college'] == COLLEGE[col][1]]


def minors(col):
    return [m for m in CAT['minors'] if m['college'] == COLLEGE[col][1]]


def depends_on(col, other):
    """Courses in col's core and concentrations whose prerequisites name other's core."""
    other_core = set(core(other))
    mine = core(col) + [x['code'] for c in concentrations(col) for x in c['courses']]
    hits = {}
    for code in dict.fromkeys(mine):
        # Only hard needs: a clause whose every alternative is in other's core.
        need = [x for codes, _ in prereq_groups(code) if all(c in other_core for c in codes) for x in codes]
        if need:
            hits[code] = sorted(set(need))
    return hits


def build():
    nodes = {}
    y = ED['years']

    # Who is this for: an applicant, or a Minervan who has just started
    role = ED['role']
    nodes['start'] = {
        'kind': 'choice', 'stage': 'Start', 'prompt': role['prompt'],
        'options': [dict(o, facts=[], source=CATALOG_SRC) for o in role['options']],
    }
    mv = ED['minervan']
    nodes['m-major'] = {
        'kind': 'choice', 'stage': 'Your major', 'prompt': mv['prompt'],
        'options': [dict(o, facts=[], source=CATALOG_SRC) for o in mv['options']],
    }
    def college_option(col):
        return {'id': col.lower(), 'name': COLLEGE[col][0], 'label': COLLEGE[col][0],
                'whatYouDo': first_sentence(MAJOR[COLLEGE[col][0]]['description']),
                'facts': ['Core: ' + ', '.join(f"{c} {COURSE[c]['title']}" for c in core(col))],
                'keepsOpen': f"{len(concentrations(col))} concentrations; at least 20 credits come from other colleges.",
                'source': major_source(col), 'next': f'college-{col}'}
    # Owner exception to the three-tab rule: all five colleges on one screen.
    opts = [college_option(c) for c in ORDER]
    for o in opts:
        o.pop('name', None)
    nodes['m-college-1'] = {'kind': 'choice', 'stage': 'Your major', 'prompt': mv['collegePrompt'],
                            'ownerException': mv['collegeException'], 'options': opts}

    # Preference funnel -> likely college
    start = ED['start']
    nodes['interest'] = {
        'kind': 'choice', 'stage': 'Your interests', 'prompt': start['prompt'],
        'options': [{
            'id': o['id'], 'label': o['label'], 'whatYouDo': o['whatYouDo'],
            'facts': [f"Leads toward: {', '.join(COLLEGE[q['college']][0] for q in ED['questions'][o['next']]['options'])}"],
            'keepsOpen': 'Every major takes at least 20 credits from other colleges, so nothing here closes a door.',
            'source': CATALOG_SRC, 'next': o['next'],
        } for o in start['options']],
    }
    for qid, q in ED['questions'].items():
        nodes[qid] = {
            'kind': 'choice', 'stage': 'Your interests', 'prompt': q['prompt'],
            'options': [{
                'id': o['college'].lower(), 'label': o['label'],
                'whatYouDo': first_sentence(MAJOR[COLLEGE[o['college']][0]]['description']),
                'facts': ['Sample courses: ' + ', '.join(f"{c} {COURSE[c]['title']}" for c in core(o['college'])[:3])],
                'keepsOpen': f"Points to {COLLEGE[o['college']][0]}.",
                'source': major_source(o['college']), 'next': f"college-{o['college']}",
            } for o in q['options']],
        }

    for col in ORDER:
        name = COLLEGE[col][0]
        major = MAJOR[name]
        nodes[f'college-{col}'] = {
            'kind': 'step', 'stage': 'Your college', 'prompt': name,
            'items': [
                'Core courses: ' + ', '.join(
                    'NS110U or NS110L (Physics of the Universe or of Life)' if c == 'NS110U' else f"{c} {COURSE[c]['title']}"
                    for c in core(col) if c != 'NS110L'),
                'A degree holds one or two majors and up to two minors.',
                'At least 20 credits come from other colleges.',
            ] + ([f"Minors here: {', '.join(m['name'].split(' - ')[-1] for m in minors(col))}"] if minors(col) else []),
            'note': 'Not your fit? Change an answer above.',
            'source': CATALOG_SRC, 'continueLabel': 'Start Year 1', 'next': f'y1-{col}',
            'plan': name,
        }
        nodes[f'y1-{col}'] = {
            'kind': 'step', 'stage': y['y1'], 'prompt': 'Four Cornerstone courses, all year',
            'items': [
                'Formal Analyses (FA50, FA51): logic, statistics, algorithmic thinking',
                'Empirical Analyses (EA50, EA51): research design, hypotheses, evidence',
                'Complex Systems (CX50, CX51): systems, collaboration, negotiation, leadership',
                'Multimodal Communications (MC50, MC51): writing, speaking, visual design, debate',
                'Integrated Learning I to VIII (IL91 to IL98) runs across the four years',
            ],
            'note': 'Everyone takes these. Older course pages call the Cornerstones CS51, NS51, SS51 and AH51.',
            'source': CATALOG_SRC, 'continueLabel': 'On to Year 2', 'next': f'y2-{col}',
            'plan': 'FA, EA, CX, MC Cornerstones',
        }

        # Year 2 core
        cores = core(col)
        after_core = f'y2e-{col}-1'
        if col == 'NS':
            shared = [c for c in cores if c not in ('NS110U', 'NS110L')]
            def physics(code):
                users = [k for k in COURSE if COURSE[k]['type'] == 'Concentration' and code in COURSE[k]['prerequisites']]
                sole = [k for k in users if not re.search(rf'(or {code}|{code}:[^,]* or )', COURSE[k]['prerequisites'])]
                alt = [k for k in users if k not in sole]
                keeps = '; '.join(filter(None, [
                    f"Required by {', '.join(sole)}" if sole else '',
                    f"accepted as one option by {', '.join(alt)}" if alt else '']))
                keeps = keeps[0].upper() + keeps[1:]
                return {
                    'id': code.lower(), 'label': COURSE[code]['title'],
                    'whatYouDo': first_sentence(COURSE[code]['description']),
                    'facts': [course_line(code), 'Plus the shared core: ' + ', '.join(f"{c} {COURSE[c]['title']}" for c in shared)],
                    'keepsOpen': keeps + '.',
                    'source': CATALOG_SRC, 'next': after_core, 'plan': ', '.join([code] + shared),
                }
            nodes[f'y2-{col}'] = {
                'kind': 'choice', 'stage': y['y2'],
                'prompt': 'Your core includes one of two physics courses. Which one?',
                'options': [physics('NS110U'), physics('NS110L')],
            }
        else:
            rule = 'Take at least 3 of these 4.' if col == 'AH' else 'All of these.'
            nodes[f'y2-{col}'] = {
                'kind': 'step', 'stage': y['y2'], 'prompt': f'{name} core',
                'items': [course_line(c) for c in cores],
                'note': rule + ' Academic and Career Exploration (AC81) also starts this year.',
                'source': CATALOG_SRC, 'continueLabel': 'Choose Year 2 electives', 'next': after_core,
                'plan': ', '.join(cores),
            }

        # Year 2 electives: other colleges, the ones this major depends on first
        others = sorted((o for o in ORDER if o != col), key=lambda o: (-len(depends_on(col, o)), ORDER.index(o)))
        def elective(o):
            dep = depends_on(col, o)
            facts = ['Core: ' + ', '.join(f"{c} {COURSE[c]['title']}" for c in core(o))]
            if dep:
                facts.append(f'Your {name} courses that need these: ' + '; '.join(f"{k} needs {', '.join(v)}" for k, v in dep.items()))
            mins = [m['name'].split(' - ')[-1] for m in minors(o)]
            keeps = (f"{COLLEGE[o][0]} minors: {', '.join(mins)}." if mins else 'Counts toward the 20 credits from other colleges.')
            return {'id': o.lower(), 'name': COLLEGE[o][0], 'label': f'{COLLEGE[o][0]} core',
                    'whatYouDo': first_sentence(MAJOR[COLLEGE[o][0]]['description']),
                    'facts': facts, 'keepsOpen': keeps, 'source': CATALOG_SRC,
                    'next': f'y3-{col}-1', 'plan': 'electives from ' + COLLEGE[o][0]}
        # Owner exception to the three-tab rule: all four other colleges in one row.
        opts = [elective(o) for o in others]
        for o in opts:
            o.pop('name', None)
        nodes[f'y2e-{col}-1'] = {
            'kind': 'choice', 'stage': y['y2'],
            'prompt': 'At least 20 credits come from other colleges. Where would your Year 2 electives come from?',
            'ownerException': ED['electivesException'],
            'options': opts,
        }

        # Year 3 concentrations, catalog order
        concs = concentrations(col)
        def conc(c):
            codes = [x['code'] for x in c['courses']]
            shares = []
            for other in concs:
                if other is c:
                    continue
                common = sorted(set(codes) & {x['code'] for x in other['courses']})
                if common:
                    shares.append(f"{', '.join(common)} with {other['name']}")
            keeps = ('Shares ' + '; '.join(shares) + '.') if shares else 'No courses shared with other concentrations.'
            if any(m['name'].endswith(' - ' + c['name']) for m in CAT['minors']):
                keeps += ' Also offered as a minor.'
            return {'id': re.sub(r'[^a-z]+', '-', c['name'].lower()).strip('-'), 'name': c['name'], 'label': c['name'],
                    'whatYouDo': first_sentence(c['description']) or 'The catalog gives no description; its three courses are below.',
                    'facts': [course_line(x) for x in codes], 'keepsOpen': keeps,
                    'source': CATALOG_SRC, 'next': f'y4-{col}', 'plan': ', '.join(codes)}
        if col == 'AH':
            prompt = 'Pick a track to lean into. Every AH major takes at least one course from Arts and Literature, Historical Forces, and Philosophy, Ethics, and the Law.'
        else:
            prompt = 'Pick a concentration. Declaring one is optional: every major takes 3 concentration courses either way.'
        # Owner exception to the three-tab rule: every concentration in one row.
        opts = [conc(c) for c in concs]
        for o in opts:
            o.pop('name', None)
        nodes[f'y3-{col}-1'] = {'kind': 'choice', 'stage': y['y3'], 'prompt': prompt,
                                'note': 'Students may also design a custom concentration with faculty guidance.',
                                'ownerException': ED['concentrationsException'], 'options': opts}

        # Year 4
        tutorials = [COURSE[x['code']]['title'].replace('Senior Tutorial: ', '') for x in major['courses'] if x['code'].startswith('IL181')]
        items = ['Capstone Seminars (CP191, CP192) begin in Year 3; Capstone Directed Study I and II (CP193, CP194) finish it',
                 'Manifest (CP196): present your capstone']
        if tutorials:
            items.append('Senior Tutorials listed for this major: ' + ', '.join(tutorials))
        if col == 'B':
            items.append('Business Practicum (B199)')
        cap = OUT['colleges'][col]['capstones']
        cap = re.sub(r',? for example\.?$', '', cap.strip()).rstrip('.')
        note = (f"Past capstones can involve {cap}." if col != 'B' else cap + '.') + ' What would yours chase?'
        nodes[f'y4-{col}'] = {
            'kind': 'step', 'stage': y['y4'], 'prompt': 'Capstone, tutorials, Manifest',
            'items': items, 'note': note, 'source': outcome_source(col),
            'continueLabel': 'After Minerva', 'next': f'after-{col}', 'plan': 'CP191 to CP196',
        }

        # After Minerva, from the college's published outcomes
        oc = OUT['colleges'][col]
        sample = oc['sample'].lstrip('*') if oc['sample'] else 'sample size not stated'
        def stat_lines(pattern):
            return [f"{s['percent']} {s['text'].replace('*', '')}" for s in oc['stats'] + [oc['headline']] if re.search(pattern, s['text'], re.I)]
        grad = stat_lines(r'advanced|graduate')[:1]
        work = stat_lines(r'employ|internship|working')
        work = [w for w in work if not re.search(r'advanced|graduate', w, re.I)] or work[:1]
        ind = ', '.join(f"{i['name']} {i['percent']}" for i in oc['industries'] if i['name'] not in oc.get('hideIndustries', []))
        nodes[f'after-{col}'] = {
            'kind': 'choice', 'stage': 'After Minerva',
            'prompt': 'Where might you head next?',
            'note': "Minerva's own figures, from its March 2026 brochures. No outside source has checked them, and each college counts its headline differently.",
            'options': [
                {'id': 'grad', 'label': 'Graduate study', 'whatYouDo': "A master's or Ph.D.",
                 'facts': grad + ([oc['gradSchools']] if oc['gradSchools'] else []) + [sample],
                 'keepsOpen': 'Research, teaching and specialist roles.', 'source': outcome_source(col), 'next': 'end'},
                {'id': 'work', 'label': 'Work', 'whatYouDo': 'Straight into a job.',
                 'facts': work + ([f'Industries: {ind}'] if ind else []) + ['Fields named: ' + ', '.join(oc['careers'])] + [sample],
                 'keepsOpen': 'Graduate study later, with work experience behind you.', 'source': outcome_source(col), 'next': 'end'},
                {'id': 'undecided', 'label': 'Not sure yet', 'whatYouDo': 'A fine place to be as an applicant.',
                 'facts': [f"{oc['headline']['percent']} {oc['headline']['text'].replace('*', '')}", oc['atlasFlag'], sample,
                           f"Across all colleges: {OUT['completion']['text']} (Minerva, November 2025)"],
                 'keepsOpen': 'Electives from every college keep a second interest alive; up to two minors are allowed.',
                 'source': outcome_source(col), 'next': 'end'},
            ],
        }

    nodes['end'] = {'kind': 'end', 'stage': 'Your plan', 'prompt': 'One possible plan, not a promise', 'note': ED['closingQuestion']}
    # Courses behind each tab or step, for the "About these courses" box.
    # Codes after "needs" and in "courses that need these" lines are
    # prerequisites, not the option's own courses.
    info = {}
    def own_codes(lines):
        codes = []
        for line in lines:
            if 'that need these' in line:
                continue
            for code in CODE_RE.findall(line.split(' · needs ')[0]):
                if code in COURSE and code not in codes:
                    codes.append(code)
        seen, out = set(), []
        for code in codes:
            key = (COURSE[code]['title'], re.sub(r'^Previously [A-Z0-9]+\.\s*', '', COURSE[code]['description'])[:80])
            if key not in seen:
                seen.add(key)
                out.append(code)
        return out
    # Only rows whose tabs are courses get the box: physics, electives, concentrations.
    for nid, n in nodes.items():
        if n['kind'] != 'choice' or not re.match(r'(y2-|y2e-|y3-)', nid):
            continue
        for holder in n['options']:
            codes = own_codes(holder.get('facts') or holder.get('items') or [])
            if codes:
                holder['courses'] = codes
                for code in codes:
                    c = COURSE[code]
                    desc = re.sub(r'^Previously [A-Z0-9]+\.\s*', '', c['description'])
                    sentences = re.split(r'(?<![\s“"(][A-Z][.!?])(?<=[.!?])\s+', desc)
                    short = ' '.join(sentences[:2])
                    if len(short) > 320:
                        short = sentences[0]
                    info[code] = {'title': c['title'], 'description': short, 'needs': prereq_codes(code)}

    return {
        'courseInfo': info,
        'asOf': AS_OF,
        'notice': "For applicants and new Minervans. Example plan. Courses, rules and outcomes come from Minerva's Course Catalog (2026.v410) and website as read on 21 Nov 2026; the questions are ATLAS's own. Courses and cities can change. Not admissions or academic advice; Minervans, check with your advisor.",
        'start': 'start',
        'nodes': nodes,
    }


def appendix():
    out = ['# Minerva catalog 2026.v410: generated tables', '',
           'Generated by `tools/build_pathways.py` from `data/catalog/`. Do not edit by hand.', '']
    for col in ORDER:
        name = COLLEGE[col][0]
        out += [f'## {name}', '', '**Core:** ' + '; '.join(course_line(c) for c in core(col)), '',
                '| Concentration | Courses |', '|---|---|']
        for c in concentrations(col):
            out.append(f"| {c['name']} | " + '; '.join(course_line(x['code']) for x in c['courses']) + ' |')
        mins = minors(col)
        if mins:
            out += ['', '**Minors:** ' + '; '.join(f"{m['name'].split(' - ')[-1]} ({', '.join(x['code'] for x in m['courses'])})" for m in mins)]
        deps = {COLLEGE[o][0]: depends_on(col, o) for o in ORDER if o != col}
        deps = {k: v for k, v in deps.items() if v}
        if deps:
            out += ['', '**Needs other colleges\' core:** ' + '; '.join(f"{k}: " + ', '.join(f"{a} needs {' and '.join(b)}" for a, b in v.items()) for k, v in deps.items())]
        stated = [x for x in re.split(r'(?<=[.])\s+', MAJOR[name]['description']) if re.search(r'required|must', x)]
        out += ['', '**Rules:** ' + ' '.join(stated + MAJOR[name]['rules']), '']
    return '\n'.join(out)


if __name__ == '__main__':
    data = build()
    (ROOT / 'data/pathways.json').write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    (ROOT / 'docs/research/atlas-catalog-2026.md').write_text(appendix())
    choices = [n for n in data['nodes'].values() if n['kind'] == 'choice']
    print(f"{len(data['nodes'])} nodes, {len(choices)} choices, max options {max(len(n['options']) for n in choices)}")

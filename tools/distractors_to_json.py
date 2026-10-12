#!/usr/bin/env python3
"""Convert multiplication_distractors.txt (tab-separated) to data/multiplication_distractors.json.

Each row is "a × b<TAB>answer<TAB>distractor…". The JSON lists each fact once, with a ≤ b;
look up b × a by swapping the factors.

    python3 tools/distractors_to_json.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'multiplication_distractors.txt'
TARGET = ROOT / 'data' / 'multiplication_distractors.json'

FACT = re.compile(r'^\s*(\d+)\s*[×xX*]\s*(\d+)\s*$')


def main():
    facts = []
    problems = []
    for line_no, line in enumerate(SOURCE.read_text(encoding='utf-8').splitlines(), 1):
        cells = [c.strip() for c in line.split('\t')]
        match = FACT.match(cells[0])
        if not match:
            continue  # title and header rows
        a, b = sorted(int(n) for n in match.groups())
        answer, *distractors = (int(c) for c in cells[1:] if c)
        where = f'line {line_no} ({cells[0]})'
        if answer != a * b:
            problems.append(f'{where}: answer {answer} should be {a * b}')
        if answer in distractors:
            problems.append(f'{where}: a distractor equals the answer')
        if len(set(distractors)) != len(distractors):
            problems.append(f'{where}: repeated distractor')
        facts.append({'a': a, 'b': b, 'answer': answer, 'distractors': distractors})

    seen = set()
    for f in facts:
        key = (f['a'], f['b'])
        if key in seen:
            problems.append(f'{f["a"]} × {f["b"]} is listed twice')
        seen.add(key)

    if problems:
        sys.exit('Not written:\n  ' + '\n  '.join(problems))

    facts.sort(key=lambda f: (f['a'], f['b']))
    data = {
        'description': 'Multiplication facts with likely wrong answers, for multiple-choice games. '
                       'Each fact is listed once with a ≤ b; for b × a, swap the factors.',
        'source': SOURCE.name,
        'facts': facts,
    }
    TARGET.parent.mkdir(exist_ok=True)
    # One fact per line: easy to read and to diff.
    body = ',\n'.join('    ' + json.dumps(f, ensure_ascii=False) for f in facts)
    head = json.dumps({k: v for k, v in data.items() if k != 'facts'}, ensure_ascii=False, indent=2)[:-2]
    TARGET.write_text(f'{head},\n  "facts": [\n{body}\n  ]\n}}\n', encoding='utf-8')
    json.loads(TARGET.read_text(encoding='utf-8'))  # sanity check
    print(f'Wrote {len(facts)} facts to {TARGET.relative_to(ROOT)}')


if __name__ == '__main__':
    main()

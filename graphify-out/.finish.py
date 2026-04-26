import sys, json
import os
from graphify.build import build_from_json
from graphify.export import to_html
from pathlib import Path
from datetime import datetime, timezone
from graphify.detect import save_manifest

extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding='utf-8'))
analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding='utf-8'))
labels_raw = json.loads(Path('graphify-out/.graphify_labels.json').read_text(encoding='utf-8')) if Path('graphify-out/.graphify_labels.json').exists() else {}

G = build_from_json(extraction)
communities = {int(k): v for k, v in analysis['communities'].items()}
labels = {int(k): v for k, v in labels_raw.items()}

if G.number_of_nodes() > 5000:
    print(f'Graph has {G.number_of_nodes()} nodes - too large for HTML viz. Use Obsidian vault instead.')
else:
    to_html(G, communities, 'graphify-out/graph.html', community_labels=labels or None)
    print('graph.html written - open in any browser, no server needed')

detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8'))
save_manifest(detect['files'])

input_tok = extraction.get('input_tokens', 0)
output_tok = extraction.get('output_tokens', 0)

cost_path = Path('graphify-out/cost.json')
if cost_path.exists():
    cost = json.loads(cost_path.read_text(encoding='utf-8'))
else:
    cost = {'runs': [], 'total_input_tokens': 0, 'total_output_tokens': 0}

cost['runs'].append({
    'date': datetime.now(timezone.utc).isoformat(),
    'input_tokens': input_tok,
    'output_tokens': output_tok,
    'files': detect.get('total_files', 0),
})
cost['total_input_tokens'] += input_tok
cost['total_output_tokens'] += output_tok
cost_path.write_text(json.dumps(cost, indent=2), encoding='utf-8')

print(f'This run: {input_tok:,} input tokens, {output_tok:,} output tokens')
print(f'All time: {cost["total_input_tokens"]:,} input, {cost["total_output_tokens"]:,} output ({len(cost["runs"])} runs)')

temp_files = [
    'graphify-out/.graphify_detect.json',
    'graphify-out/.graphify_extract.json',
    'graphify-out/.graphify_ast.json',
    'graphify-out/.graphify_semantic.json',
    'graphify-out/.graphify_analysis.json',
    'graphify-out/.graphify_labels.json',
    'graphify-out/.needs_update'
]
for f in temp_files:
    try:
        os.remove(f)
    except FileNotFoundError:
        pass
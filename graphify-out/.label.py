import sys, json
from graphify.build import build_from_json
from graphify.cluster import score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from pathlib import Path
from collections import Counter

extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding='utf-8'))
detection  = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8'))
analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding='utf-8'))

G = build_from_json(extraction)
communities = {int(k): v for k, v in analysis['communities'].items()}
cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}

def get_label(cid, nodes):
    if not nodes:
        return f"Community {cid}"
    stems = []
    for n in nodes:
        parts = n.split('_')
        stems.append(parts[0])
    most_common = Counter(stems).most_common(1)[0][0]
    return f"{most_common.capitalize()} Components"

labels = {cid: get_label(cid, nodes) for cid, nodes in communities.items()}

# specific overrides for top
overrides = {
    0: "API Activity Endpoints",
    1: "Admin App Routes",
    2: "Loading Skeletons",
    3: "Home Page Components",
    4: "Itinerary APIs",
    5: "Trip Tabs",
    6: "Error Boundary",
    7: "Navbar Icons",
    8: "Admin Dashboard Stats",
    9: "Destination APIs"
}
for k, v in overrides.items():
    if k in labels:
        labels[k] = v

questions = suggest_questions(G, communities, labels)

report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'], detection, tokens, '.', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}), encoding='utf-8')
print('Report updated with community labels')
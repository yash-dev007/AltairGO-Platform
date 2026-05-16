import json
with open('graphify-out/.graphify_detect.json') as f:
    data = json.load(f)
print(f"Corpus: {data.get('total_files', 0)} files · ~{data.get('total_words', 0)} words")
files = data.get('files', {})
if 'code' in files and files['code']:
    print(f"  code:     {len(files['code'])} files")
if 'document' in files and files['document']:
    print(f"  docs:     {len(files['document'])} files")
if 'paper' in files and files['paper']:
    print(f"  papers:   {len(files['paper'])} files")
if 'image' in files and files['image']:
    print(f"  images:   {len(files['image'])} files")
if 'video' in files and files['video']:
    print(f"  video:    {len(files['video'])} files")
if data.get('skipped_sensitive'):
    print(f"Skipped {len(data['skipped_sensitive'])} sensitive files")
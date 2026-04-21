import json

with open(r'C:\Users\saji_\Downloads\VideoMill\videomill-v6-complete.json', 'r', encoding='utf-8') as f:
    wf = json.load(f)

# Update connections - legg til nye koblinger
wf['connections']['Check Music'] = { "main": [[{ "node": "Add Music", "type": "main", "index": 0 }]] }
wf['connections']['Add Music'] = { "main": [[{ "node": "Add Captions", "type": "main", "index": 0 }]] }
wf['connections']['Add Captions'] = { "main": [[{ "node": "FFmpeg - Scale", "type": "main", "index": 0 }]] }
wf['connections']['Status: Complete'] = { "main": [[{ "node": "Update Episode Status", "type": "main", "index": 0 }]] }
wf['connections']['Update Episode Status'] = { "main": [[{ "node": "Auto YouTube Upload", "type": "main", "index": 0 }]] }
wf['connections']['Auto YouTube Upload'] = { "main": [[{ "node": "Prep Promo", "type": "main", "index": 0 }]] }

# Update versjon
wf['versionId'] = '6.0-complete'

with open(r'C:\Users\saji_\Downloads\VideoMill\videomill-v6-complete.json', 'w', encoding='utf-8') as f:
    json.dump(wf, f, indent=2)

print('Connections updated')
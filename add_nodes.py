import json

# Les eksisterende workflow
with open(r'C:\Users\saji_\Downloads\VideoMill\videomill-v6-fixed.json', 'r', encoding='utf-8') as f:
    wf = json.load(f)

# Nye noder å legge til
new_nodes = [
    # Add Music
    {
        "parameters": {
            "jsCode": "const item = items[0].json;\nconst musicEnabled = String($env.MUSIC_ENABLED || 'false').toLowerCase() === 'true';\n\nif (!musicEnabled) {\n  return [{ json: { ...item, music_added: false, music_skip: 'MUSIC_ENABLED=false' } }];\n}\n\nconst videoId = item.video_id;\nconst dir = `/workspace/video_assets/${videoId}`;\n\ntry {\n  require('child_process').execSync(`mkdir -p ${dir}`, { shell: '/bin/bash' });\n} catch {}\n\nconst musicUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';\n\ntry {\n  require('child_process').execSync(`wget -q -O ${dir}/music.mp3 \"${musicUrl}\"`, { shell: '/bin/bash', timeout: 30000 });\n  require('child_process').execSync(`ffmpeg -y -i ${dir}/merged.mp4 -i ${dir}/music.mp3 -filter_complex \"[1:a]volume=0.1[m];[0:a][m]amix=inputs=2:duration=first[a]\" -map 0:v -map \"[a]\" -c:v copy -c:a aac ${dir}/final_music.mp4`, { shell: '/bin/bash', timeout: 120000 });\n  require('child_process').execSync(`mv ${dir}/final_music.mp4 ${dir}/merged.mp4`, { shell: '/bin/bash' });\n  return [{ json: { ...item, music_added: true } }];\n} catch(e) {\n  console.log('Musikk feilet:', e.message);\n  return [{ json: { ...item, music_added: false, music_error: e.message } }];\n}"
        },
        "id": "add-music",
        "name": "Add Music",
        "type": "n8n-nodes-base.code",
        "position": [4496, 200],
        "typeVersion": 2
    },
    # Add Captions
    {
        "parameters": {
            "jsCode": "const item = items[0].json;\nconst captionsEnabled = String($env.CAPTIONS_ENABLED || 'false').toLowerCase() === 'true';\n\nif (!captionsEnabled) {\n  return [{ json: { ...item, captions_added: false } }];\n}\n\nconst videoId = item.video_id;\nconst scenes = item.scenes || [];\nif (!scenes.length) return [{ json: { ...item, captions_added: false } }];\n\nconst dir = `/workspace/video_assets/${videoId}`;\nlet srt = '';\nlet t = 0;\n\nscenes.forEach((s, i) => {\n  const dur = s.duration_seconds || s.duration || 5;\n  const ts = d => {\n    const ms = Math.round((d % 1) * 1000);\n    const sec = Math.floor(d) % 60;\n    const min = Math.floor(d / 60) % 60;\n    const hr = Math.floor(d / 3600);\n    return String(hr).padStart(2,'0') + ':' + String(min).padStart(2,'0') + ':' + String(sec).padStart(2,'0') + ',' + String(ms).padStart(3,'0');\n  };\n  srt += (i+1) + '\\n' + ts(t) + ' --> ' + ts(t+dur) + '\\n' + (s.narration||'').substring(0,80) + '\\n\\n';\n  t += dur;\n});\n\ntry {\n  require('fs').writeFileSync(dir + '/subs.srt', srt);\n  require('child_process').execSync('ffmpeg -y -i ' + dir + '/merged.mp4 -vf \"subtitles=' + dir + '/subs.srt:force_style=FontSize=18,PrimaryColour=&Hffffff\" -c:a copy ' + dir + '/final_captions.mp4', { shell: '/bin/bash', timeout: 120000 });\n  require('child_process').execSync('mv ' + dir + '/final_captions.mp4 ' + dir + '/merged.mp4', { shell: '/bin/bash' });\n  return [{ json: { ...item, captions_added: true } }];\n} catch(e) {\n  console.log('Captions feilet:', e.message);\n  return [{ json: { ...item, captions_added: false } }];\n}"
        },
        "id": "add-captions",
        "name": "Add Captions",
        "type": "n8n-nodes-base.code",
        "position": [4688, 200],
        "typeVersion": 2
    },
    # Update Episode Status
    {
        "parameters": {
            "jsCode": "const item = items[0].json;\nconst supabaseUrl = $env.SUPABASE_URL;\nconst serviceKey = $env.SUPABASE_SERVICE_ROLE_KEY;\n\nif (!item.is_series || !item.episode_id) {\n  return [{ json: { ...item, episode_updated: false, skip: 'not_series' } }];\n}\n\ntry {\n  const result = await this.helpers.httpRequest({\n    method: 'PATCH',\n    url: supabaseUrl + '/rest/v1/episodes?id=eq.' + item.episode_id,\n    headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },\n    body: { status: 'complete', video_id: item.video_id, video_url: item.video_url_16x9 || item.video_url_9x16 || '' },\n    json: true\n  });\n  return [{ json: { ...item, episode_updated: true } }];\n} catch(e) {\n  console.log('Episode update feilet:', e.message);\n  return [{ json: { ...item, episode_updated: false } }];\n}"
        },
        "id": "update-episode",
        "name": "Update Episode Status",
        "type": "n8n-nodes-base.code",
        "position": [5200, 200],
        "typeVersion": 2
    },
    # Auto YouTube Upload
    {
        "parameters": {
            "jsCode": "const item = items[0].json;\nconst supabaseUrl = $env.SUPABASE_URL;\nconst autoPublish = String($env.AUTO_PUBLISH || 'false').toLowerCase() === 'true';\n\nif (!autoPublish) {\n  return [{ json: { ...item, youtube_skip: 'AUTO_PUBLISH not enabled' } }];\n}\n\nconst videoUrl = item.video_url_16x9 || item.video_url_9x16 || '';\nif (!videoUrl || !item.video_id) {\n  return [{ json: { ...item, youtube_skip: 'no_video_url' } }];\n}\n\ntry {\n  const fnUrl = supabaseUrl.split('/rest/v1')[0] + '/functions/v1/youtube-upload';\n  const result = await this.helpers.httpRequest({\n    method: 'POST',\n    url: fnUrl,\n    headers: { 'Content-Type': 'application/json', 'X-Service-Key': $env.INTERNAL_SERVICE_KEY || '' },\n    body: {\n      user_id: item.user_id,\n      video_id: item.video_id,\n      video_url: videoUrl,\n      title: item.title || item.topic || 'VideoMill Video',\n      description: (item.scenes || []).map(s => s.narration || '').join(' ').substring(0, 500),\n      tags: item.hashtags || []\n    },\n    json: true\n  });\n  return [{ json: { ...item, youtube_result: result } }];\n} catch(e) {\n  console.log('YouTube upload feilet:', e.message);\n  return [{ json: { ...item, youtube_error: e.message } }];\n}"
        },
        "id": "auto-youtube",
        "name": "Auto YouTube Upload",
        "type": "n8n-nodes-base.code",
        "position": [5392, 200],
        "typeVersion": 2
    }
]

# Legg til nye noder
wf['nodes'].extend(new_nodes)

print('Nodes total:', len(wf['nodes']))

# Lagre
with open(r'C:\Users\saji_\Downloads\VideoMill\videomill-v6-complete.json', 'w', encoding='utf-8') as f:
    json.dump(wf, f, indent=2)

print("Saved to videomill-v6-complete.json")
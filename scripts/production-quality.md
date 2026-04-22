# VideoMill Production Quality Guide
## Video, Audio & Effects Configuration

---

## VIDEO SETTINGS

### Resolution & Codec

| Quality | Resolution | Codec | Bitrate | Use Case |
|---------|-----------|-------|--------|---------|
| **Standard** | 1080p | H.264 | 8 Mbps | TikTok, Reels |
| **High** | 1080p | H.265 | 12 Mbps | YouTube, IGTV |
| **Ultra** | 4K | H.265 | 25 Mbps | Archive, Master |

### FPS Recommendations

| Platform | Recommended FPS | Why |
|----------|--------------|----|
| TikTok | 30 fps | Smooth, viral |
| YouTube Shorts | 30 fps | Platform default |
| Instagram Reels | 30 fps | Platform default |
| Cinematic | 24 fps | Film look |

### FFmpeg Parameters

```bash
# 1080p @ 30fps - High Quality
ffmpeg -i input.mp4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black" \
  -c:v libx264 -preset fast -crf 18 \
  -c:a aac -b:a 192k \
  -r 30 -pix_fmt yuv420p \
  output.mp4

# 1080p @ 60fps - Ultra Smooth
ffmpeg -i input.mp4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black" \
  -c:v libx264 -preset fast -crf 16 \
  -c:a aac -b:a 256k \
  -r 60 -pix_fmt yuv420p \
  output.mp4

# 4K - Master Quality
ffmpeg -i input.mp4 \
  -c:v libx265 -preset slow -crf 20 \
  -c:a aac -b:a 320k \
  -pix_fmt yuv420p \
  output.mp4
```

---

## AUDIO SETTINGS

### Voice Options (ElevenLabs)

| Voice ID | Name | Language | Style |
|----------|------|----------|------|
| nb-NO-PernilleNeural | Pernille | NO | Professional |
| nb-NO-FinnNeural | Finn | NO | Casual |
| nb-NO-IselinNeural | Iselin | NO | Friendly |
| en-US-AriaNeural | Aria | EN | Professional |
| en-US-GuyNeural | Guy | EN | Deep |
| en-US-JennyNeural | Jenny | EN | Upbeat |
| es-ES-ElviraNeural | Elvira | ES | Professional |
| de-DE-KatjaNeural | Katja | DE | Professional |

### Voice Parameters

```json
{
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.85,
    "style": 0.2,
    "use_speaker_boost": true
  }
}
```

### Audio Normalization

```bash
# Normalize audio to -14 LUFS (Podcast standard)
ffmpeg -i input.mp4 \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" \
  -c:a aac -b:a 192k \
  output.mp4
```

### Background Music Mix

| Music Volume | Use Case |
|------------|--------|
| 0.05 (5%) | Background ambient |
| 0.12 (12%) | Standard viral |
| 0.20 (20%) | High energy |

```bash
# Mix background music at 12% volume
ffmpeg -i video.mp4 -i music.mp3 \
  -filter_complex "[0:a]volume=1.0[va];[1:a]volume=0.12[vm];[va][vm]amix=inputs=2:duration=first[aout]" \
  -map 0:v -map "[aout]" \
  -c:v copy -c:a aac -b:a 192k \
  output.mp4
```

---

## EFFECTS

### Captions/Subtitles Styles

| Style | Description | Font | Effect |
|-------|------------|------|--------|
| **Viral Pop** | Bold, animated pop-on | Impact | bounce + glow |
| **Minimal** | Clean, subtle | Roboto | fade |
| **Subtitle** | Traditional bottom | Arial | box |
| **Animated** | Dynamic entrance | Custom | typewriter |

### Caption Colors

| Color | Hex | Best For |
|-------|-----|--------|
| Gold | #FFB800 | Dark backgrounds |
| Red | #FF4757 | Drama, urgent |
| Cyan | #00F5FF | Tech, modern |
| White | #FFFFFF | Light backgrounds |
| Black | #000000 | Contrast |

### Transitions

| Type | Duration | Use Case |
|------|----------|---------|
| fade | 0.4s | Smooth |
| smooth | 0.5s | Cinematic |
| zoom | 0.3s | High energy |
| none | 0s | Raw |

### Color Filters

| Filter | Effect |
|--------|--------|
| none | Original |
| cinematic | Teal/orange grade |
| vibrant | Saturated |
| warm | Orange/yellow tint |
| cool | Blue tint |

---

## OUTPUT FORMATS

### Platform-Specific

| Platform | Aspect | Resolution | FPS | Duration |
|----------|-------|-----------|-----|---------|
| TikTok | 9:16 | 1080x1920 | 30 | 15-60s |
| YouTube Shorts | 9:16 | 1080x1920 | 30 | <60s |
| Instagram Reels | 9:16 | 1080x1920 | 30 | <90s |
| YouTube | 16:9 | 1920x1080 | 30/60 | Any |
| Instagram Feed | 1:1 | 1080x1080 | 30 | Any |
| LinkedIn | 4:5 | 1080x1350 | 30 | Any |

### Multi-Format Export

```bash
# Export all formats
for ratio in "9:16" "16:9" "1:1" "4:5"; do
  case $ratio in
    "9:16")  w=1080; h=1920 ;;
    "16:9")  w=1920; h=1080 ;;
    "1:1")   w=1080; h=1080 ;;
    "4:5")   w=1080; h=1350 ;;
  esac
  ffmpeg -i input.mp4 \
    -vf "scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=black" \
    -c:v libx264 -preset fast -crf 20 \
    -c:a aac -b:a 192k \
    output_${ratio//:/x}.mp4
done
```

---

## BACKGROUND MUSIC LIBRARY

### Royalty-Free Sources

1. **Pixabay Music** (free)
   - URL: pixabay.com/music/
   - License: Royalty-free

2. **Epidemic Sound** (paid)
   - URL: epidemicsound.com
   - License: Commercial allowed

3. **Artlist** (paid)
   - URL: artlist.io
   - License: Commercial allowed

### Suggested Music Categories

| Category | Mood | Use Case |
|----------|------|---------|
| Upbeat Energy | Motivational | Tech, finance |
| Cinematic Epic | Dramatic | History, documentary |
| Lo-Fi Chill | Relaxed | Lifestyle |
| Corporate Success | Professional | Business |
| Electronic Pulse | Tech | AI, innovation |
| Acoustic Warm | Personal | Stories |

---

## AUTO-PUBLISHING SETUP

### TikTok Upload

```javascript
// TikTok Upload via n8n
const tiktokUpload = {
  video_url: videoUrl,
  title: videoTitle,
  description: description,
  tags: ['fyp', 'viral', 'trending'],
  privacy: 'public'
};
```

### YouTube Upload

```javascript
// YouTube Upload
const youtubeUpload = {
  video_path: videoPath,
  title: videoTitle,
  description: description,
  privacy: 'private', // or 'public'
  tags: ['shorts', 'viral'],
  category: 'Entertainment'
};
```

### Instagram Upload

```javascript
// Instagram Reels
const instagramUpload = {
  video_url: videoUrl,
  caption: caption,
  hashtags: ['reels', 'fyp', 'viral']
};
```

---

## QUALITY PRESETS

### Quick Settings

| Preset | Video | Audio | Effects | Output |
|-------|-------|-------|--------|--------|
| **Viral Quick** | 1080p/30 | Voice + Music | Captions | TikTok |
| **High Quality** | 1080p/60 | Voice + Music | Full | YouTube |
| **Cinematic** | 4K/24 | Voice + Orchestra | Cinema | Archive |
| **Budget** | 720p/30 | Voice Only | None | Test |

---

## DEPLOYMENT

### Environment Variables

```bash
# Required for production
ANTHROPIC_API_KEY=sk-ant-xxx
ELEVENLABS_API_KEY=sk_xxx
PEXELS_API_KEY=xxx

# Optional
ELEVENLABS_VOICE_ID=nb-NO-PernilleNeural
BACKGROUND_MUSIC_ENABLED=true
MUSIC_VOLUME=0.12
AUDIO_NORMALIZATION=true

# Platform credentials
TIKTOK_SESSION_TOKEN=xxx
YOUTUBE_REFRESH_TOKEN=xxx
```

---

This guide ensures maximum quality for all VideoMill productions.
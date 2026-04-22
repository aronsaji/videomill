# VideoMill Serie-Generator PROMPT
## Claude 4 Sonnet / GPT-4o Integration

---

### FORMAT: SERIE REQUEST

```json
{
  "action": "generate_series",
  "serie_type": "tamil_history | trending | tech_education | motivation",
  "title": "Seriens hovedtittel",
  "language": "nb | en | es | de",
  "episodes": Antall episoder (6-12),
  "duration": "45-90 sekunder",
  "aspect_ratio": "9:16",
  "tone": "dramatisk | educativ | entertaining | action",
  "context": "Ekstra kontekst/bakgrunn"
}
```

---

### SERIE: Tamil History (CHOLA, CHERA, PANDYA)

#### SESONG 1: MUVENDAR (De tre store) — 12 episoder

**Prompt til Claude:**

```
Du er en profesjonell manusforfatter for dokumentarserier. Lag Sesong 1 av "Muvendar" 
om Chola, Chera og Pandya-dynastiene i Tamil Nadu.

## FORMAT PER EPISODE:
{
  "episode": 1-12,
  "title": {"nb": "...", "en": "..."},
  "description": "Kort beskrivelse 1-2 setninger",
  "duration_seconds": 60,
  "scenes": [
    {
      "narration": {
        "nb": "Norsk tekst",
        "en": "English text"
      },
      "visual_description": "Cinematisk beskrivelse for stock video",
      "search_keywords": ["keyword1", "keyword2"],
      "duration_seconds": 12
    }
  ]
}

## SESONG 1 INNHOLD:

### Episode 1: "Rikenenes Fødsel"
- Introduksjon til det tamilske kulturområdet (300f.kr - 300e.kr)
- De tre Muvendar-kongedømmene

### Episode 2-3: CHOLA - Karikalan & Pallava
- Karikalan Chozhans erobring av Kanchipuram
- Forholdet til Pallava-dynastiet

### Episode 4-6: CHERA - Kongene av Kerala
- Chera-handelsruter og krydder
- Havnebyer og sjøhandel

### Episode 7-9: PANDYA - Tempelbyggerne
- Madurai som religiøst sentrum
- Pandya-byråkratiet

### Episode 10-12: Første Store Kriger
- Allianser og konflikter
-Arven videre

## KRITISK:
- search_keywords MÅ være PÅ ENGELSK (for Pexels/Pixabay)
- narration bør være 45-60 ord per scene
- Bruk engasjerende åpninger ("Visste du at...")
- Avslutt med "I neste episode..."
```

---

#### SESONG 2: INGENIØRKUNST — 8 episoder

**Episoder:**
1. Kallanai-demningen (2. årh.)
2. Brihadeeswarar-tempelet
3. Akbars'ske vannsystemer
4. Kanjeepuram-byen
5. Murals og hulemalerier
6. Byplanlegging
7. Havnekonstruksjoner
8. Teknologi uten teknologi

---

#### SESONG 3: HANDELSRUTER — 8 episoder

**Episoder:**
1. Romerriket
2. Silkeveien til sjøs
3. Kina og Tang-dynastiet
4. Sørøst-Asia (Indonesia, Malaysia)
5. Pirater og handelsmenn
6. Perle-skatte
7. Tamilske diaspora
8. Moderne arv

---

#### SESONG 4: KRIGERNE — 10 episoder

**Episoder:**
1. Velpari-kongen
2. Adhiyaman
3. Rani Mangammal
4. Neduncheral
5. Krittiv天人
6. Slaget ved Vellore
7. Diplomatiet
8. Spionasje
9. Siste motstand
10. Legendenes arv

---

#### SESONG 5: UNDERGANGEN — 6 episoder

**Episoder:**
1. Invasjonen fra nord
2. Islam kommer
3. Delhi-sultanatet
4. Vijayanagara
5. Europeerne kommer
6. Arven i dag

---

### GENERERINGSPROSESS

```
┌─────────────────────────────────────────────────┐
│         VIDEO MILL SERIE PIPELINE                 │
├──────────────────────────────────────────────���──┤
│  1. Bruker velger serie-type                     │
│  2. Claude genererer alle episod-manus (JSON)    │
│  3. Hver episode → egen video-job              │
│  4. Voiceover (ElevenLabs)                     │
│  5. Video-clips (Pexels)                      │
│  6. FFmpeg render + upload                    │
│  7. Auto-publiser til TikTok/YouTube          │
│  8. Schedule: 1 episode/dag                  │
└───────────────────────────────────────────────┘
```

---

### AUTOMATISK SEQENSE

For automatisk serie-publisering:

```
Dag 1: Episode 1 → TikTok + YouTube
Dag 2: Episode 2 → TikTok + YouTube
...
Dag N: Episode N → TikTok + YouTube + "Fullstendig serie på YouTube"
```

---

### CLAUDE API CALL

```javascript
// Manuks-generering med Claude 4 Sonnet
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: SERIE_PROMPT
    }]
  })
});
```

---

### OUTPUT FORMAT (JSON)

```json
{
  "serie": {
    "id": "uuid",
    "title": "Muvendar",
    "title_translations": {
      "nb": "Muvendar - De tre store",
      "en": "Muvendar - The Three Great Kings"
    },
    "total_episodes": 12,
    "episodes": [
      {
        "episode": 1,
        "title": "...",
        "title_translations": {},
        "description": "...",
        "duration_seconds": 60,
        "scenes": [
          {
            "narration": {"nb": "...", "en": "..."},
            "visual_description": "...",
            "search_keywords": ["..."],
            "duration_seconds": 12
          }
        ]
      }
    ]
  }
}
```

---

### AUTO-PUBLISERING INnstillinger

```json
{
  "schedule": "daily_at_18:00",
  "platforms": ["tiktok", "youtube_shorts"],
  "youtube_playlist": "Muvendar - Full Season",
  "tiktok_series": true,
  "tiktok_hashtags": ["#tamilhistory", "#history", "#documentary"],
  "tiktok_description": "Del {{episode}} av {{total}} i serien om {{title}}"
}
```
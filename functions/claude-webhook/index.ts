import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, api-key, content-type, x-videomill-auth',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface VideoRequest {
  video_id: string;
  topic: string;
  platform?: string;
  language?: string;
  aspect_ratio?: string;
  target_audience?: string;
  voice_id?: string;
  promp?: string;
  action?: string;
  scenes?: any[];
  series_id?: string;
}

interface ClaudeResponse {
  script?: string;
  scenes?: any[];
  video_url?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('x-videomill-auth');
    const expectedAuth = Deno.env.get('N8N_HEADER_AUTH_VALUE') || Deno.env.get('VIDEO_CLAUDE_AUTH');
    
    if (authHeader !== expectedAuth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: VideoRequest = await req.json();
    const { video_id, topic, action = 'produce', promp, scenes, language = 'nb', platform = 'youtube' } = body;

    if (!video_id || !topic) {
      return new Response(JSON.stringify({ error: 'Missing video_id or topic' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result: ClaudeResponse = { error: 'Unknown action' };

    if (action === 'produce' || action === 'generate') {
      result = await generateScript({
        video_id,
        topic,
        promp: promp || `Lag en engasjerende ${platform}-video om: ${topic}. Bruk 4-5 scener, 45-60 sek.`,
        language,
        platform,
      });
    } else if (action === 'voiceover') {
      result = await generateVoiceover({ video_id, scenes, language });
    } else if (action === 'video_clips') {
      result = { scenes };
    } else if (action === 'render') {
      result = await renderVideo({ video_id, scenes });
    } else if (action === 'series') {
      result = await generateSeries({ video_id, topic, promp, language, num_episodes: 12 });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateScript(params: {
  video_id: string;
  topic: string;
  promp: string;
  language: string;
  platform: string;
}): Promise<ClaudeResponse> {
  const { video_id, topic, promp, language, platform } = params;
  
  const SYSTEM_PROMPT = `Du er en profesjonell video-manusforfatter. Lag et engasjerende manus for kortvideo.
VIKTIG:
- Returner KUN gyldig JSON
- search_keywords MÅ være på ENGELSK for stock video-søk
- narration: naturlig tale i ${language === 'nb' ? 'norsk' : language === 'en' ? 'engelsk' : language}
- 4-6 scener, 45-90 sekunder totalt
- Bruk engasjerende åpning og call-to-action

JSON-format:
{
  "title": "Video tittel",
  "script": "Kort sammendrag",
  "scenes": [
    {
      "narration": "Taletekst",
      "visual_description": "Cinematisk beskrivelse for stock video",
      "search_keywords": ["keyword1", "keyword2"],
      "duration_seconds": 12
    }
  ],
  "hashtags": ["#tag1", "#tag2"]
}`;

  const USER_PROMPT = `${promp}

Tittel: ${topic}
Platform: ${platform}
Språk: ${language}

Lag manus nå:`;

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: USER_PROMPT }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in Claude response');
    }

    const script = JSON.parse(jsonMatch[0]);
    return { script: script.script, scenes: script.scenes };
  } catch (error) {
    console.error('Claude generateScript error:', error.message);
    return { 
      script: `Video om ${topic}`,
      scenes: [
        { narration: `Velkommen til denne videoen om ${topic}.`, search_keywords: [topic], duration_seconds: 10 },
        { narration: `La oss utforske dette nærmere.`, search_keywords: [topic, 'background'], duration_seconds: 10 },
        { narration: `Takker for at du så på!`, search_keywords: ['thank you'], duration_seconds: 5 }
      ],
      error: undefined
    };
  }
}

async function generateVoiceover(params: {
  video_id: string;
  scenes: any[];
  language: string;
}): Promise<ClaudeResponse> {
  const { video_id, scenes, language } = params;
  
  const voiceId = language === 'nb' ? 'nb-NO-PernilleNeural' : 'en-US-AriaNeural';
  const text = scenes.map((s: any) => s.narration).join('\n\n');

  try {
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      console.log('No ELEVENLABS_API_KEY, using voice_id only');
      return { video_url: '', scenes };
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.85, style: 0.2, use_speaker_boost: true },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioBase64 = await audioBlob.text();
    
    return { scenes: { voiceover_base64: audioBase64 } };
  } catch (error) {
    console.log('Voiceover error, continuing without voice:', error.message);
    return { scenes };
  }
}

async function renderVideo(params: {
  video_id: string;
  scenes: any[];
}): Promise<ClaudeResponse> {
  const { video_id } = params;
  
  return {
    video_url: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/videos/${video_id}/final.mp4`,
  };
}

async function generateSeries(params: {
  video_id: string;
  topic: string;
  promp?: string;
  language: string;
  num_episodes: number;
}): Promise<ClaudeResponse> {
  const { topic, language, num_episodes } = params;

  const SERIES_PROMPT = `Lag en komplett ${num_episodes}-episodes dokumentarserie om: ${topic}

Returner KUN gyldig JSON:
{
  "series": {
    "title": "${topic}",
    "episodes": [
      {
        "episode": 1,
        "title": "Episodetittel",
        "description": "Kort beskrivelse",
        "duration_seconds": 60,
        "scenes": [
          {
            "narration": "Taletekst",
            "visual_description": "Beskrivelse for stock video",
            "search_keywords": ["keyword"],
            "duration_seconds": 12
          }
        ]
      }
    ]
  }
}`;

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{ role: 'user', content: SERIES_PROMPT }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON in response');
  } catch (error) {
    console.error('Series generation error:', error.message);
    return { 
      series: {
        title: topic,
        episodes: Array.from({ length: num_episodes }, (_, i) => ({
          episode: i + 1,
          title: `Episode ${i + 1}`,
          description: `Episode ${i + 1} om ${topic}`,
          duration_seconds: 60,
          scenes: [
            { narration: `Episode ${i + 1} om ${topic}`, search_keywords: [topic], duration_seconds: 15 },
            { narration: `Fortsettelse...`, search_keywords: [topic], duration_seconds: 15 },
            { narration: `Takker for at du så på!`, search_keywords: ['thank you'], duration_seconds: 10 }
          ]
        }))
      }
    };
  }
}
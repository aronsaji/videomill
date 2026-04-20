/**
 * VideoMill AI Comment & Engagement Automator
 * 
 * Fully automated:
 * 1. Henter kommentarer fra TikTok/YouTube/IG
 * 2. Analyserer sentiment
 * 3. Svarer med AI (Claude)
 * 4. Følger opp viktige kommentarer
 * 5. Tracker engagement metrics
 */

interface Comment {
  id: string;
  platform: 'tiktok' | 'youtube' | 'instagram';
  video_id: string;
  author: string;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  created_at: string;
  replied: boolean;
  reply_text?: string;
  follow_up_needed?: boolean;
}

interface EngagementConfig {
  autoReply: boolean;
  autoFollowUp: boolean;
  sentimentThreshold: number;
  responseDelay: number; // minutes
  maxRepliesPerHour: number;
  keywordsTrigger: string[];
  blockedWords: string[];
}

const DEFAULT_CONFIG: EngagementConfig = {
  autoReply: true,
  autoFollowUp: true,
  sentimentThreshold: 0.3,
  responseDelay: 5,
  maxRepliesPerHour: 20,
  keywordsTrigger: ['wow', 'awesome', 'thanks', 'how', '?', 'please', 'help'],
  blockedWords: ['scam', 'fake', 'hate', 'worst'],
};

const RESPONSE_TEMPLATES = {
  positive: [
    "Takk! {name}! Gleder meg til å lage mer content som dette! 🚀",
    "Veldig takk! {name} - din støtte betyr alt! 🙏",
    "Yaaas! {name} takker! ❤️‍🔥",
    "Hei {name}! Takker så meget! Vil du se mer av dette?",
  ],
  question: [
    "Godt spørsmål! {name} - jeg lager en video om akkurat det snart! 🎬",
    "Flott spørsmål! Følg med - det kommer en forklaring!",
    "Det skal jeg forklare i neste video! Stay tuned {name}!",
  ],
  suggestion: [
    "God ide! {name} - jeg noterer! Takker! ✍️",
    "Det er en god innspill! {name} - skal vurdere det!",
  ],
  neutral: [
    "Takk for tilbakemelding {name}! 👍",
    "Ok {name}! Takker!",
    "Forstått {name}! 👍",
  ],
  negative: [
    "Takk for feedback {name}! Tar det til meg som læringspunkt.",
    "Forstått {name}. Takker for ærlig tilbakemelding!",
  ],
};

const FOLLOW_UP_TRIGGERS = [
  { pattern: /help|trenger|støtte/i, action: 'support', delay: 60 },
  { pattern: /when|next|når/i, action: 'info', delay: 120 },
  { pattern: /wait|long|purple/i, action: 'patience', delay: 180 },
  { pattern: /broken|error|bug|iussue/i, action: 'fix', delay: 30 },
];

const POSITIVE_KEYWORDS = [
  'awesome', 'amazing', 'great', 'love', 'fantastic', 'perfect', 
  'best', 'incredible', 'wow', '🔥', '❤️', '🙏', 'thank', 'thanks',
  'good', 'nice', 'cool', ' Sick ', 'kinda', 'yaaas'
];

const NEGATIVE_KEYWORDS = [
  'bad', 'worst', 'hate', 'suck', 'terrible', 'awful', 
  'boring', 'waste', 'trash', 'fake', 'scam', 'stupid',
  '🤮', '💩', '👎'
];

export class CommentBot {
  private config: EngagementConfig;
  private anthropicKey: string;
  private openaiKey: string;
  private repliedToday: number = 0;

  constructor(
    anthropicKey: string,
    openaiKey: string,
    config: Partial<EngagementConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.anthropicKey = anthropicKey;
    this.openaiKey = openaiKey;
  }

  async analyzeSentiment(text: string): Promise<'positive' | 'neutral' | 'negative'> {
    const lower = text.toLowerCase();
    
    const positiveCount = POSITIVE_KEYWORDS.filter(k => lower.includes(k)).length;
    const negativeCount = NEGATIVE_KEYWORDS.filter(k => lower.includes(k)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  async detectIntent(text: string): Promise<{
    intent: 'question' | 'suggestion' | 'positive' | 'neutral';
    keywords: string[];
  }> {
    const lower = text.toLowerCase();
    
    const questions = lower.match(/\?/g) || [];
    const suggestions = ['could', 'should', 'maybe', 'if only', 'wish', 'would be nice'];
    const hasSuggestion = suggestions.some(s => lower.includes(s));
    
    if (questions.length > 0) return { intent: 'question', keywords: ['?'] };
    if (hasSuggestion) return { intent: 'suggestion', keywords: suggestions };
    
    const sentiment = await this.analyzeSentiment(text);
    return { intent: sentiment, keywords: [] };
  }

  async generateReply(comment: Comment): Promise<string> {
    const intent = await this.detectIntent(comment.text);
    
    // Sjekk om skal blokkeres
    const hasBlocked = this.config.blockedWords.some(
      word => comment.text.toLowerCase().includes(word)
    );
    if (hasBlocked) return '';
    
    // Velg template
    let templates = RESPONSE_TEMPLATES.neutral;
    if (intent.intent === 'question') {
      templates = RESPONSE_TEMPLATES.question;
    } else if (intent.intent === 'suggestion') {
      templates = RESPONSE_TEMPLATES.suggestion;
    } else if (intent.intent === 'positive') {
      templates = RESPONSE_TEMPLATES.positive;
    }
    
    // Velg tilfeldig template
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Custom AI-svar via Claude
    if (comment.text.length > 100 || intent.intent === 'question') {
      return await this.generateAIReply(comment);
    }
    
    // Erstatt {name}
    const name = comment.author.split(' ')[0];
    return template.replace('{name}', name);
  }

  async generateAIReply(comment: Comment): Promise<string> {
    const systemPrompt = `Du er VideoMill sin AI-assistent. Svar kort, vennlig og naturlig på norsk eller engelsk.
    
Regler:
- Vær kort (maks 2 setninger)
- Vær personlig og vennlig
- Aldri avslør at du er en AI
- Oppfordre til mer engagement
- Bruk emoji sparsomt

Svar kun med reply-teksten, inget annet.`;

    const userPrompt = `Kommentar fra ${comment.platform}: "${comment.text}"
    
Brukernavn: ${comment.author}
Sentiment: ${comment.sentiment}
    
Skriv et passende svar:`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 150,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) {
        throw new Error('Claude API error');
      }

      const data = await response.json();
      return data.content?.[0]?.text?.trim() || '';
    } catch (error) {
      // Fallback til template
      const name = comment.author.split(' ')[0];
      return `Takk ${name}! 👍`;
    }
  }

  async needsFollowUp(comment: Comment): Promise<{
    needed: boolean;
    action: 'support' | 'info' | 'patience' | 'fix' | null;
    delay: number;
  }> {
    for (const trigger of FOLLOW_UP_TRIGGERS) {
      if (trigger.pattern.test(comment.text)) {
        return { needed: true, action: trigger.action, delay: trigger.delay };
      }
    }
    return { needed: false, action: null, delay: 0 };
  }

  async processComment(comment: Comment): Promise<{
    reply: string;
    followUp: { needed: boolean; action: string; delay: number };
  }> {
    const reply = await this.generateReply(comment);
    const followUp = await this.needsFollowUp(comment);
    
    return { reply, followUp };
  }

  async schedulePost(
    platform: 'tiktok' | 'youtube' | 'instagram',
    videoId: string,
    scheduledTime: Date
  ): Promise<{ scheduled: boolean; post_id: string }> {
    // Bruker n8n til faktisk posting
    // Her returneres kun scheduling info
    return {
      scheduled: true,
      post_id: `${platform}_${videoId}_${Date.now()}`,
    };
  }

  async getBestPostTime(
    platform: 'tiktok' | 'youtube' | 'instagram'
  ): Promise<{ optimalHour: number; day: string }> {
    // Basert på platform analytics
    // TikTok: 18:00-21:00 på hverdager
    // YouTube: 16:00-19:00
    // Instagram: 19:00-21:00
    
    const bestTimes: Record<string, { optimalHour: number; day: string }> = {
      tiktok: { optimalHour: 19, day: 'tuesday' },
      youtube: { optimalHour: 17, day: 'saturday' },
      instagram: { optimalHour: 20, day: 'wednesday' },
    };
    
    return bestTimes[platform] || { optimalHour: 18, day: 'friday' };
  }

  async generateHashtags(
    topic: string,
    platform: 'tiktok' | 'youtube' | 'instagram'
  ): Promise<string[]> {
    const baseTags = [
      '#viral', '#fyp', '#fyp', '#trending',
      '#shorts', '#reels', '#viral', '#viral'
    ];
    
    const topicTags = topic
      .toLowerCase()
      .split(' ')
      .filter(w => w.length > 3)
      .map(w => `#${w.replace(/[^a-z]/gi, '')}`);
    
    const platformTags = {
      tiktok: ['#fyp', '#foryou', '#fyp'],
      youtube: ['#shorts', '#youtubeshorts'],
      instagram: ['#reels', '#instagram'],
    };
    
    // Kombiner og limit til 5 tags
    const allTags = [
      ...new Set([...topicTags, ...platformTags[platform], ...baseTags])
    ].slice(0, 5);
    
    return allTags;
  }

  async trackEngagement(
    videoId: string,
    platform: 'tiktok' | 'youtube' | 'instagram'
  ): Promise<{
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  }> {
    // Hent фактические metrics fra platform
    // Returnerer mock for now
    return {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      engagementRate: 0,
    };
  }
}

export const commentBot = new CommentBot(
  process.env.ANTHROPIC_API_KEY || '',
  process.env.OPENAI_API_KEY || ''
);

export type { Comment, EngagementConfig };
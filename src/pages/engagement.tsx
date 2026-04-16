import { useState } from 'react';
import { MessageSquare, Send, Bot, ThumbsUp, Minus, ThumbsDown, Youtube, Hash } from 'lucide-react';
import { mockComments } from '../lib/mockdata';
import StatusBadge from '../components/statusbadge';

const sentimentIcon = {
  positive: <ThumbsUp size={12} className="text-teal-400" />,
  neutral: <Minus size={12} className="text-slate-400" />,
  negative: <ThumbsDown size={12} className="text-red-400" />,
};

const platformIcon: Record<string, React.ReactNode> = {
  YouTube: <Youtube size={12} className="text-red-400" />,
  TikTok: <Hash size={12} className="text-pink-400" />,
};

export default function Engagement() {
  const [comments, setComments] = useState(mockComments);
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative' | 'unreplied'>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filtered = comments.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'unreplied') return !c.replied;
    return c.sentiment === filter;
  });

  const handleAutoReply = (id: string) => {
    const comment = comments.find(c => c.id === id);
    if (!comment) return;
    const aiReply = `Takk for kommentaren, ${comment.author}! Vi setter stor pris på tilbakemeldingen din. Abonner for mer innhold som dette!`;
    setComments(prev => prev.map(c => c.id === id ? { ...c, replied: true, reply_text: aiReply } : c));
  };

  const handleSendReply = (id: string) => {
    if (!replyText.trim()) return;
    setComments(prev => prev.map(c => c.id === id ? { ...c, replied: true, reply_text: replyText } : c));
    setReplyingTo(null);
    setReplyText('');
  };

  const positiveCount = comments.filter(c => c.sentiment === 'positive').length;
  const neutralCount = comments.filter(c => c.sentiment === 'neutral').length;
  const negativeCount = comments.filter(c => c.sentiment === 'negative').length;
  const unreplied = comments.filter(c => !c.replied).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#111118] border border-white/6 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsUp size={14} className="text-teal-400" />
            <span className="text-xs text-white/35 uppercase tracking-wider">Positive</span>
          </div>
          <p className="text-2xl font-bold text-white">{positiveCount}</p>
          <p className="text-xs text-teal-400/70 mt-0.5">{Math.round((positiveCount / comments.length) * 100)}% av totalt</p>
        </div>
        <div className="bg-[#111118] border border-white/6 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Minus size={14} className="text-slate-400" />
            <span className="text-xs text-white/35 uppercase tracking-wider">Nøytrale</span>
          </div>
          <p className="text-2xl font-bold text-white">{neutralCount}</p>
          <p className="text-xs text-white/25 mt-0.5">{Math.round((neutralCount / comments.length) * 100)}% av totalt</p>
        </div>
        <div className="bg-[#111118] border border-white/6 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsDown size={14} className="text-red-400" />
            <span className="text-xs text-white/35 uppercase tracking-wider">Negative</span>
          </div>
          <p className="text-2xl font-bold text-white">{negativeCount}</p>
          <p className="text-xs text-red-400/70 mt-0.5">{Math.round((negativeCount / comments.length) * 100)}% av totalt</p>
        </div>
        <div className="bg-[#111118] border border-white/6 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-amber-400" />
            <span className="text-xs text-white/35 uppercase tracking-wider">Ubesvarte</span>
          </div>
          <p className="text-2xl font-bold text-white">{unreplied}</p>
          <p className="text-xs text-amber-400/70 mt-0.5">Trenger svar</p>
        </div>
      </div>

      <div className="bg-teal-500/6 border border-teal-500/15 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
          <Bot size={16} className="text-teal-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">AI-kommentar-robot er aktiv</p>
          <p className="text-xs text-white/40">Overvåker kommentarer hvert 60. minutt · Svarer automatisk på enkle spørsmål</p>
        </div>
      </div>

      <div className="flex gap-1 bg-white/4 p-1 rounded-xl border border-white/6 w-fit">
        {(['all', 'positive', 'neutral', 'negative', 'unreplied'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f ? 'bg-teal-500/20 text-teal-400 border border-teal-500/25' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {f === 'all' ? 'Alle' : f === 'unreplied' ? 'Ubesvarte' : f === 'positive' ? 'Positive' : f === 'neutral' ? 'Nøytrale' : 'Negative'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((comment) => (
          <div key={comment.id} className="bg-[#111118] border border-white/6 rounded-xl p-5 hover:border-white/10 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/30 to-cyan-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-teal-300">
                  {comment.author[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white/80">{comment.author}</span>
                    <div className="flex items-center gap-1 text-white/30">{platformIcon[comment.platform]}</div>
                    <StatusBadge status={comment.sentiment} />
                    {comment.replied && (
                      <span className="text-xs bg-teal-500/10 border border-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded-full">Besvart</span>
                    )}
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{comment.text}</p>
                  <p className="text-xs text-white/25 mt-1">
                    {comment.videoTitle} · {new Date(comment.posted_at).toLocaleString('nb-NO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>

                  {comment.replied && comment.reply_text && (
                    <div className="mt-3 ml-0 p-3 bg-teal-500/6 border border-teal-500/15 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Bot size={11} className="text-teal-400" />
                        <span className="text-xs font-medium text-teal-400">AI-svar</span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">{comment.reply_text}</p>
                    </div>
                  )}

                  {replyingTo === comment.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Skriv et svar..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 placeholder-white/25 focus:outline-none focus:border-teal-500/40"
                        onKeyDown={e => e.key === 'Enter' && handleSendReply(comment.id)}
                      />
                      <button
                        onClick={() => handleSendReply(comment.id)}
                        className="px-3 py-2 bg-teal-500 text-white text-xs rounded-lg hover:bg-teal-400 transition-colors flex items-center gap-1"
                      >
                        <Send size={12} />
                        Send
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {!comment.replied && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAutoReply(comment.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs rounded-lg hover:bg-teal-500/20 transition-all"
                  >
                    <Bot size={12} />
                    AI-svar
                  </button>
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/6 border border-white/10 text-white/60 text-xs rounded-lg hover:bg-white/10 transition-all"
                  >
                    <MessageSquare size={12} />
                    Svar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

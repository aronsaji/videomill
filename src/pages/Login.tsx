import { useState } from 'react';
import { Eye, EyeOff, Globe, ArrowLeft, Mail } from 'lucide-react';
import Logo from '../components/Logo';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

type Mode = 'login' | 'register' | 'forgot';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setLoading(false);
      onLogin(); // Mock login success
    }, 1500);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      onLogin();
    }, 1500);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
  };

  const backgroundDecor = (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-neon-cyan/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/5 rounded-full blur-[150px]" />
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">
      {backgroundDecor}

      <div className="absolute top-5 right-5 flex items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white text-xs font-medium transition-all">
          <Globe size={12} />
          Norsk
        </button>
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="bg-surface/60 border border-border rounded-2xl p-8 backdrop-blur-md shadow-2xl shadow-black/50">
          {mode === 'forgot' ? (
            <>
              <div className="text-center mb-7">
                <div className="w-12 h-12 bg-purple-500/15 border border-purple-500/25 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={22} className="text-purple-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Glemt passord?</h1>
                <p className="text-sm text-gray-400 mt-1.5">Vi sender deg en lenke for å tilbakestille passordet ditt.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-1.5">E-postadresse</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="navn@eksempel.no"
                    className="w-full bg-black/30 border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-purple-500/20"
                >
                  {loading ? 'Sender lenke...' : 'Send lenke for tilbakestilling'}
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mx-auto pt-1"
                >
                  <ArrowLeft size={14} />
                  Tilbake til innlogging
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-7">
                <h1 className="text-2xl font-bold text-white">Velkommen tilbake</h1>
                <p className="text-sm text-gray-400 mt-1.5">Logg inn for å få tilgang til ditt VideoMill-dashboard.</p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 hover:bg-white/10 border border-border text-gray-300 hover:text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 mb-5"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Fortsett med Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-gray-500 font-medium">eller med e-post</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="flex gap-1 bg-black/20 p-1 rounded-xl border border-border mb-5">
                <button
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Logg inn
                </button>
                <button
                  onClick={() => switchMode('register')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Opprett konto
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="text-xs font-medium text-gray-400 block mb-1.5">Fullt navn</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ola Nordmann"
                      className="w-full bg-black/30 border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-1.5">E-postadresse</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="navn@eksempel.no"
                    className="w-full bg-black/30 border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-400">Passord</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-xs text-purple-400/80 hover:text-purple-400 transition-colors"
                      >
                        Glemt passord?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-black/30 border border-border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="text-xs font-medium text-gray-400 block mb-1.5">Bekreft passord</label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-black/30 border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-purple-500/20 mt-2"
                >
                  {loading
                    ? (mode === 'login' ? 'Logg inn...' : 'Oppretter konto...')
                    : (mode === 'login' ? 'Logg inn' : 'Opprett konto')}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-5">
          VideoMill AI Studio &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

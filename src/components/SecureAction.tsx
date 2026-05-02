import React, { useState } from 'react';
import { ShieldAlert, Key, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SecureActionProps {
  onVerify: () => void;
  children: React.ReactNode;
  actionName: string;
}

export function SecureAction({ onVerify, children, actionName }: SecureActionProps) {
  const [isChallenging, setIsChallenging] = useState(false);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');

  const handleTrigger = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsChallenging(true);
  };

  const verifyMFA = async () => {
    setStatus('verifying');
    
    // ISO 27001: Step-Up Authentication Implementation
    // I et produksjonsmiljø med Supabase vil koden se slik ut:
    /*
    const factors = await supabase.auth.mfa.listFactors();
    const factorId = factors.data.totp[0].id;
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    const verifyRes = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code
    });
    */

    // Simulert verifisering for VideoMill (Godkjenner alt over 6 siffer for dev)
    setTimeout(() => {
      if (code.length === 6) {
        setStatus('success');
        setTimeout(() => {
          setIsChallenging(false);
          setStatus('idle');
          setCode('');
          onVerify(); // Utfør den sensitive handlingen
        }, 1000);
      } else {
        setStatus('error');
      }
    }, 800);
  };

  return (
    <>
      <div onClick={handleTrigger} className="inline-block cursor-pointer">
        {children}
      </div>

      <AnimatePresence>
        {isChallenging && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsChallenging(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-neon-amber/50 w-full max-w-sm rounded-xl shadow-[0_0_50px_rgba(245,158,11,0.1)] relative z-10 overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-neon-amber/10 text-neon-amber rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-amber/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <ShieldAlert size={32} />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Zero Trust Validering</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Handlingen <strong className="text-neon-amber">{actionName}</strong> krever MFA (Multi-Factor Authentication) for å utføres. Tast 123456.
                </p>

                <div className="space-y-4">
                  <div className="relative">
                    <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full bg-black/50 border border-border rounded-lg pl-12 pr-4 py-4 text-center text-2xl tracking-[0.4em] font-mono text-white focus:outline-none focus:border-neon-amber focus:ring-1 focus:ring-neon-amber transition-all shadow-inner"
                    />
                  </div>

                  {status === 'error' && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 font-mono">Ugyldig kode. Prøv igjen.</motion.p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setIsChallenging(false)}
                      className="flex-1 py-3 rounded-lg font-bold text-gray-400 hover:text-white transition-colors border border-transparent hover:border-gray-700 bg-white/5"
                    >
                      Avbryt
                    </button>
                    <button 
                      onClick={verifyMFA}
                      disabled={code.length !== 6 || status === 'verifying'}
                      className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                        code.length !== 6
                          ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                          : status === 'success'
                          ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                          : 'bg-neon-amber text-black hover:bg-neon-amber/90 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      }`}
                    >
                      {status === 'verifying' ? 'Validerer...' : status === 'success' ? <><CheckCircle size={18} /> Godkjent</> : 'Verifiser'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

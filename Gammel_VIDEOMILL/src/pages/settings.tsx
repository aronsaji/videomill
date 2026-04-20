"use client";

import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  Youtube, 
  Instagram, 
  Facebook, 
  Twitter, 
  Music2, 
  ShieldCheck,
  Link2,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext"; // Lagt til for å få tak i bruker-ID

const platforms = [
  { name: "YouTube", icon: <Youtube className="w-5 h-5 text-[#ff0000]" />, status: "Ready", info: "Direct Shorts Upload" },
  { name: "TikTok", icon: <Music2 className="w-5 h-5 text-[#00f2ea]" />, status: "Coming Soon", info: "Viral Pipeline" },
  { name: "Instagram", icon: <Instagram className="w-5 h-5 text-[#e1306c]" />, status: "Coming Soon", info: "Reels Automation" },
  { name: "Facebook", icon: <Facebook className="w-5 h-5 text-[#1877F2]" />, status: "Coming Soon", info: "Page Distribution" },
  { name: "X / Twitter", icon: <Twitter className="w-5 h-5 text-white" />, status: "Coming Soon", info: "Video Threader" },
];

export default function Settings() {
  const { user } = useAuth(); // Henter den innloggede brukeren

  const handleConnect = (platformName: string) => {
    if (platformName === "YouTube") {
      // 1. Client ID fra din Google Cloud Console
      const clientId = "245637637589-ev1qvupln75qclrfden6dr8b0ulcdiqr.apps.googleusercontent.com";
      
      // 2. Dynamisk redirect URI basert på hvor du er (Localhost eller Vercel)
      const redirectUri = encodeURIComponent(window.location.origin + "/auth/callback/youtube");
      
      // 3. Tilgangene vi ber om
      const scope = encodeURIComponent("https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.email");
      
      // 4. Bruker-ID sendes som 'state' så vi vet hvem vi lagrer tokens for
      const state = user?.id || "";

      if (!state) {
        alert("Error: User session not found. Please try logging in again.");
        return;
      }
      
      // 5. Bygg URL-en med alle nødvendige parametere for offline access (refresh tokens)
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
                      `client_id=${clientId}&` +
                      `redirect_uri=${redirectUri}&` +
                      `response_type=code&` +
                      `scope=${scope}&` +
                      `access_type=offline&` +
                      `include_granted_scopes=true&` +
                      `prompt=consent&` +
                      `state=${state}`;
      
      // 6. Send brukeren til Google
      window.location.href = authUrl;
    } else {
      alert(`${platformName} tilkobling kommer snart!`);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-12">
      {/* HEADER */}
      <header className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-500">
            <SettingsIcon className="w-5 h-5" />
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              System_<span className="text-amber-500">Config</span>
            </h1>
          </div>
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-[0.3em] font-bold">
            Node Settings & User Credentials
          </p>
        </div>
      </header>

      {/* CONNECTED ACCOUNTS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Link2 className="w-4 h-4 text-amber-500" />
          <h2 className="text-white font-black uppercase tracking-widest text-sm italic">Connected Accounts</h2>
        </div>
        
        <p className="text-sm text-zinc-300 font-medium max-w-2xl leading-relaxed">
          Connect your social media accounts to publish videos directly from <span className="text-amber-500 font-bold">ViraNode</span>. 
          Your credentials are securely encrypted and stored.
        </p>

        <div className="grid gap-3">
          {platforms.map((p) => (
            <div key={p.name} className="flex items-center justify-between p-4 bg-zinc-900/40 border border-white/5 rounded-xl hover:border-white/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                  {p.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-tight">{p.name}</h3>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase font-black">{p.info}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {p.status === "Coming Soon" && (
                  <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 uppercase font-black">
                    Coming Soon
                  </span>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => handleConnect(p.name)}
                  className={cn(
                    "h-9 px-6 rounded-lg text-[10px] font-black uppercase tracking-widest border-white/10",
                    p.status === "Ready" ? "bg-white text-black hover:bg-zinc-200" : "opacity-50"
                  )}
                  disabled={p.status !== "Ready"}
                >
                  Connect
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY INFO */}
      <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 items-start">
        <ShieldCheck className="w-6 h-6 text-amber-500 shrink-0" />
        <div>
          <h4 className="text-amber-500 font-black uppercase text-xs tracking-widest mb-1">How it works</h4>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
            Connect your accounts once, then every video you generate can be automatically published to your connected platforms. 
            We use enterprise-grade OAuth2 protocols to ensure your data never leaves the production pipeline.
          </p>
        </div>
      </div>

      {/* FOOTER INFO */}
      <footer className="pt-10 flex justify-between items-center opacity-30">
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase font-black">
          <Cpu className="w-3 h-3" />
          Node_Status: Encrypted_Session
        </div>
        <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">v2.0.4-security-core</p>
      </footer>
    </div>
  );
}

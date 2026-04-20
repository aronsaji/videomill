import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ShieldCheck, AlertTriangle, Info, User } from "lucide-react";

interface AuditEntry {
  id: string; 
  timestamp: string; 
  action: string; 
  actor: string; 
  level: "info" | "warning" | "critical"; 
  details: string;
}

const mockAudit: AuditEntry[] = [
  { id: "A1", timestamp: "2026-04-12 12:45:03", action: "VIDEO_QUEUED", actor: "admin@videomill.io", level: "info", details: "Job VM-0044 queued for YouTube (NO)" },
  { id: "A2", timestamp: "2026-04-12 12:40:12", action: "VIDEO_QUEUED", actor: "admin@videomill.io", level: "info", details: "Job VM-0042 queued for TikTok (NO)" },
  { id: "A3", timestamp: "2026-04-12 12:34:00", action: "VIDEO_QUEUED", actor: "admin@videomill.io", level: "info", details: "Job VM-0041 queued for YouTube (EN)" },
  { id: "A4", timestamp: "2026-04-12 11:52:30", action: "AUTO_RETRY", actor: "system", level: "warning", details: "Job VM-0045 auto-retry #2 triggered (RENDERING_ERROR)" },
  { id: "A5", timestamp: "2026-04-12 11:50:05", action: "VIDEO_FAILED", actor: "system", level: "critical", details: "Job VM-0045 failed: RENDERING_ERROR – FFmpeg timeout" },
  { id: "A6", timestamp: "2026-04-12 10:21:00", action: "VIDEO_PUBLISHED", actor: "system", level: "info", details: "Job VM-0046 published to YouTube Shorts" },
  { id: "A7", timestamp: "2026-04-12 09:15:44", action: "VIDEO_FAILED", actor: "system", level: "critical", details: "Job VM-0047 failed after 3 retries, marked for manual intervention" },
  { id: "A8", timestamp: "2026-04-12 08:00:00", action: "LOGIN", actor: "admin@videomill.io", level: "info", details: "Successful login via MFA (IP: 194.x.x.x)" },
  { id: "A9", timestamp: "2026-04-12 06:00:00", action: "TRENDS_UPDATED", actor: "system", level: "info", details: "Pipeline B: 6 trending topics refreshed" },
];

const levelConfig = {
  info: { color: "text-info", bg: "bg-info/10", icon: Info },
  warning: { color: "text-accent", bg: "bg-accent/10", icon: AlertTriangle },
  critical: { color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle },
};

export default function AuditLogPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-primary" />
          {t("audit.title")} <span className="text-gradient-cyan">{t("audit.title_accent")}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">{t("audit.subtitle")}</p>
      </div>

      <div className="space-y-2">
        {mockAudit.map((entry, i) => {
          const level = levelConfig[entry.level];
          const LevelIcon = level.icon;

          return (
            <motion.div 
              key={entry.id} 
              initial={{ opacity: 0, x: -8 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.04 }} 
              className="glass-card rounded-lg px-4 py-3 flex items-start gap-3"
            >
              <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center ${level.bg}`}>
                <LevelIcon className={`w-3.5 h-3.5 ${level.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-muted-foreground">{entry.timestamp}</span>
                  {/* Her oversettes logg-handlingen hvis den finnes i i18n, ellers vises originalen */}
                  <span className={`text-[10px] font-mono font-bold ${level.color}`}>
                    {entry.action.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-foreground mt-0.5">{entry.details}</p>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground shrink-0 uppercase">
                <User className="w-3 h-3" />
                {entry.actor === "system" ? t("admin.title").toUpperCase() : entry.actor}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
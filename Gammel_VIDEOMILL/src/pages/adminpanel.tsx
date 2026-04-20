import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Crown, Users, Server, Shield, Activity, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Vi flytter stats inn i selve komponenten eller bruker t() nøkler
const recentUsers = [
  { email: "admin@videomill.io", role: "Admin", lastLogin: "2026-04-12 12:45", status: "active" },
  { email: "editor@videomill.io", role: "Editor", lastLogin: "2026-04-12 10:22", status: "active" },
  { email: "viewer@videomill.io", role: "Viewer", lastLogin: "2026-04-11 08:15", status: "active" },
  { email: "test@videomill.io", role: "Editor", lastLogin: "2026-04-09 16:30", status: "inactive" },
];

export default function AdminPanelPage() {
  const { t } = useTranslation();

  // Definerer stats her for å få tilgang til 't'
  const systemStats = [
    { label: t("analytics.total_views"), value: "142", icon: Users, color: "text-primary" }, // Gjenbruker eksisterende nøkkel
    { label: "Pipeline Nodes", value: "22", icon: Server, color: "text-accent" },
    { label: "Uptime", value: "99.97%", icon: Activity, color: "text-success" },
    { label: "DB Size", value: "4.2 GB", icon: Database, color: "text-info" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground">
            <Crown className="h-6 w-6 text-accent" />
            {t("admin.title")} <span className="text-gradient-amber">{t("admin.title_accent")}</span>
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{t("admin.subtitle")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => toast.success("System cache cleared")}
          className="gap-2 font-mono text-xs uppercase tracking-wider"
        >
          <RefreshCw className="h-3.5 w-3.5" /> {t("menu.settings")} - Flush
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {systemStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-lg p-4 flex items-center gap-4"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            {t("admin.title")}
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{t("login.email")}</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Role</th>
              <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground hidden md:table-cell">Last Login</th>
              <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user, i) => (
              <motion.tr
                key={user.email}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-foreground">{user.email}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-secondary-foreground">{user.role}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-muted-foreground">{user.lastLogin}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center gap-1 font-mono text-[10px] ${user.status === "active" ? "text-success" : "text-muted-foreground"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${user.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
                    {user.status === "active" ? t("status.system_online").split(' ')[1].toUpperCase() : "INACTIVE"}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CreditCard, Check, Zap, Crown, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function PaymentsPage() {
  const { t } = useTranslation();

  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: t("analytics.avg_views").includes("Gjennomsnitt") ? "/mnd" : "/mo",
      icon: Zap,
      color: "text-muted-foreground",
      border: "border-border",
      features: ["10 videos/mo", "2 platforms", "720p rendering", "Basic analytics"],
    },
    {
      name: "Pro",
      price: "$79",
      period: t("analytics.avg_views").includes("Gjennomsnitt") ? "/mnd" : "/mo",
      icon: Crown,
      color: "text-primary",
      border: "border-primary/30",
      popular: true,
      features: ["50 videos/mo", "All platforms", "1080p rendering", "TrendRadar", "Auto-retry", "Priority queue"],
    },
    {
      name: "Enterprise",
      price: "$199",
      period: t("analytics.avg_views").includes("Gjennomsnitt") ? "/mnd" : "/mo",
      icon: Rocket,
      color: "text-accent",
      border: "border-accent/30",
      features: ["Unlimited videos", "All platforms", "4K rendering", "TrendRadar Pro", "Dedicated pipeline", "API access", "SLA 99.9%"],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground">
          <CreditCard className="h-6 w-6 text-accent" />
          {t("payments.title") || "Billing"}
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{t("payments.subtitle") || "Manage your subscription and plans"}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card relative rounded-lg border p-6 ${plan.border}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                  {t("factory.all") === "Alle" ? "Populær" : "Popular"}
                </div>
              )}
              <div className="mb-4 flex items-center gap-2">
                <Icon className={`h-5 w-5 ${plan.color}`} />
                <span className="font-mono text-sm font-bold text-foreground">{plan.name}</span>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="font-mono text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mb-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className={`h-3.5 w-3.5 shrink-0 ${plan.color}`} />
                    {/* Her kan du legge til t(`plans.features.${f}`) hvis du vil oversette hvert punkt */}
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => toast.success(t("login.submit"), { description: plan.name })}
                className="w-full font-mono text-xs uppercase tracking-wider"
              >
                {t("factory.all") === "Alle" ? "Velg plan" : "Choose Plan"}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
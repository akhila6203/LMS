import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";
import { TrendingUp, TrendingDown } from "lucide-react";

export function KPICard({ title, value, prefix, suffix, change, icon, gradient, delay = 0 }) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${gradient} rounded-xl border border-border/50 p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center shadow-sm">
          {icon}
        </div>

        <div
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {Math.abs(change)}%
        </div>
      </div>

      <div className="text-2xl font-heading font-bold text-foreground mb-1">
        <AnimatedCounter target={value} prefix={prefix} suffix={suffix} />
      </div>

      <p className="text-sm text-muted-foreground">{title}</p>
    </motion.div>
  );
}

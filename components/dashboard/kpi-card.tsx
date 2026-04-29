import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  children?: React.ReactNode;
}

export function KPICard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconBg,
  iconColor,
  children,
}: KPICardProps) {
  return (
    <div className="bg-surface p-6 rounded-xl tonal-shadow border border-border-subtle">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        {change && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
              changeType === "positive" && "text-success bg-success/10",
              changeType === "negative" && "text-error bg-error/10",
              changeType === "neutral" && "text-text-secondary bg-surface-container"
            )}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-text-primary font-[var(--font-heading)]">
        {value}
      </h3>
      {children}
    </div>
  );
}

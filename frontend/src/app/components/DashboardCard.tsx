import { LucideIcon } from "lucide-react";

type DashboardCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBg?: string;
  valueClassName?: string;
};

export function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = "bg-violet-100 text-violet-600",
  valueClassName = "text-slate-900",
}: DashboardCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${iconBg}`}>
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className={`mt-1 text-4xl font-bold tracking-tight ${valueClassName}`}>
            {value}
          </h3>
          {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
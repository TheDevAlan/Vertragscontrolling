import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatsCardProps) => {
  const variants = {
    default: {
      bg: 'bg-white',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
    primary: {
      bg: 'bg-white',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
    },
    success: {
      bg: 'bg-white',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    warning: {
      bg: 'bg-white',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    danger: {
      bg: 'bg-white',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    info: {
      bg: 'bg-white',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  };

  const style = variants[variant];

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 p-6 shadow-sm',
        style.bg
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              <span className="text-slate-500 font-normal ml-1">
                vs. letzter Monat
              </span>
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', style.iconBg)}>
          <Icon className={cn('w-6 h-6', style.iconColor)} />
        </div>
      </div>
    </div>
  );
};


import clsx from 'clsx';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

interface DateCardProps {
  label: string;
  date: string;
  type?: 'standard' | 'warning' | 'danger';
}

export const DateCard = ({ label, date, type = 'standard' }: DateCardProps) => {
  
  const styles = {
    standard: { 
      iconBg: 'bg-blue-600 text-white shadow-blue-200',
      label: 'text-slate-500',
      icon: Calendar 
    },
    warning: { 
      iconBg: 'bg-amber-500 text-white shadow-amber-200',
      label: 'text-amber-600',
      icon: Clock 
    },
    danger: { 
      iconBg: 'bg-rose-500 text-white shadow-rose-200',
      label: 'text-rose-600',
      icon: AlertCircle 
    }
  };

  const currentStyle = styles[type];
  const Icon = currentStyle.icon;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-1 group">
      
      {/* 1. Data (Left) */}
      <div className="flex flex-col gap-1">
        <span className={clsx("text-[10px] font-bold uppercase tracking-wider", currentStyle.label)}>
          {label}
        </span>
        <p className="text-2xl font-bold text-slate-800 tracking-tight font-mono">
          {date}
        </p>
      </div>
      
      {/* 2. Icon (Right) */}
      <div className={clsx(
        "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 group-hover:rotate-3",
        currentStyle.iconBg
      )}>
        <Icon size={22} strokeWidth={2.5} />
      </div>

    </div>
  );
};
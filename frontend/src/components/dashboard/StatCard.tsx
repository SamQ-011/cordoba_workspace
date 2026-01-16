import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: string; // Color del texto del icono
  bgIcon?: string; // Color de fondo del icono
}

export const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color = "text-blue-600",
  bgIcon = "bg-blue-50"
}: StatCardProps) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md group">
      
      {/* Icono a la Izquierda (Estilo Avatar) */}
      <div className={clsx(
        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", 
        bgIcon, color
      )}>
        <Icon size={26} strokeWidth={2} />
      </div>
      
      {/* Datos a la Derecha */}
      <div className="flex flex-col">
        <span className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
          {value}
        </span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">
          {label}
        </span>
      </div>

    </div>
  );
};
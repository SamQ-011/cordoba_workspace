import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Bell, UserCircle, Clock } from 'lucide-react'; // Agregué el icono Clock
import clsx from 'clsx';

export const TopBar = () => {
  const { user } = useAuthStore();
  const [time, setTime] = useState(new Date());

  // 1. RELOJ EN VIVO: Se actualiza cada segundo para que no se congele
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper para formatear la hora (HH:MM)
  const formatTime = (date: Date, timeZone: string) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
    }).format(date);
  };

  return (
    // CAMBIO DE ESTILO: Celeste Ejecutivo (Ice Blue)
    // bg-blue-50/90: Tono celeste suave con transparencia
    // backdrop-blur-md: Efecto cristal moderno
    // border-b-blue-100: Borde sutil para separar del fondo
    <header className="h-20 bg-blue-50/90 backdrop-blur-md border-b border-blue-100 flex items-center justify-between px-8 sticky top-0 z-20 transition-all shadow-sm shadow-blue-100/50">
      
      {/* IZQUIERDA: Identidad del Agente */}
      <div className="flex items-center gap-4">
        {/* Avatar estilizado */}
        <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
          <UserCircle size={26} />
        </div>
        
        <div className="flex flex-col">
          {/* Nombre Real */}
          <h2 className="text-sm font-bold text-slate-800 leading-tight">
            {user?.name || "Usuario"}
          </h2>
          {/* Rol con Badge */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className={clsx(
              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
              user?.role === 'Admin' 
                ? "bg-purple-50 text-purple-700 border-purple-100" 
                : "bg-blue-100 text-blue-700 border-blue-200"
            )}>
              {user?.role || "Agente"}
            </span>
          </div>
        </div>
      </div>

      {/* DERECHA: Reloj Mundial Premium */}
      <div className="flex items-center gap-6">
        
        {/* Widget de Relojes (Diseño Cápsula) */}
        <div className="hidden md:flex bg-white/80 px-5 py-2.5 rounded-xl border border-blue-100 shadow-sm gap-6 items-center">
          <div className="flex items-center gap-2 text-blue-300">
            <Clock size={14} />
          </div>
          
          <div className="text-center">
            <div className="text-sm font-bold text-slate-700 font-mono tracking-tight">
              {formatTime(time, 'America/New_York')}
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">NYC</div>
          </div>
          
          <div className="w-px h-6 bg-blue-100"></div> {/* Separador */}
          
          <div className="text-center relative">
            {/* Indicador de "Tu Hora" */}
            <div className="absolute -top-1 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="text-sm font-bold text-blue-700 font-mono tracking-tight">
              {formatTime(time, 'America/La_Paz')}
            </div>
            <div className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">BOL</div>
          </div>

          <div className="w-px h-6 bg-blue-100"></div> {/* Separador */}

          <div className="text-center">
            <div className="text-sm font-bold text-slate-700 font-mono tracking-tight">
              {formatTime(time, 'America/Bogota')}
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">COL</div>
          </div>
        </div>

        {/* Campana de Notificaciones */}
        <button className="relative p-2.5 bg-white rounded-xl text-slate-400 hover:text-blue-600 hover:shadow-md border border-transparent hover:border-blue-100 transition-all group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

      </div>
    </header>
  );
};
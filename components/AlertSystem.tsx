
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';
import { CriticalAlert } from '../types';
import { XMarkIcon, SparklesIcon } from './icons';

interface AlertSystemProps {
  alerts: CriticalAlert[];
  onDismiss: (id: string) => void;
  onViewProtocol: (id: number) => void;
}

const AlertSystem: React.FC<AlertSystemProps> = ({ alerts, onDismiss, onViewProtocol }) => {
  const lastAlertId = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const unreadAlerts = alerts.filter(a => !a.isRead);
    if (unreadAlerts.length > 0) {
      const newest = unreadAlerts[unreadAlerts.length - 1];
      if (newest.id !== lastAlertId.current) {
        lastAlertId.current = newest.id;
        // Play alert sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.log("Audio play blocked", e));
        }
      }
    }
  }, [alerts]);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-24 right-8 z-[100] w-full max-w-sm space-y-4 pointer-events-none">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" />
      
      {alerts.map((alert) => (
        <div 
          key={alert.id}
          className={`pointer-events-auto relative overflow-hidden animate-in slide-in-from-right-full duration-500 cyber-glass rounded-2xl border-l-4 p-6 shadow-2xl ${
            alert.type === 'EXTRAVIADA' ? 'border-red-500 bg-red-950/20' : 'border-amber-500 bg-amber-950/20'
          }`}
        >
          {/* Animated Background Pulse */}
          <div className={`absolute inset-0 opacity-10 animate-pulse ${
            alert.type === 'EXTRAVIADA' ? 'bg-red-500' : 'bg-amber-500'
          }`}></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded bg-black/40 ${
                alert.type === 'EXTRAVIADA' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {alert.type === 'EXTRAVIADA' ? 'CRITICAL: LOSS DETECTED' : 'WARNING: UNUSUAL PATTERN'}
              </span>
              <button 
                onClick={() => onDismiss(alert.id)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm font-bold text-white mb-4 italic">
              {alert.message}
            </p>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Localização</span>
                <span className="text-xs font-bold text-white">{alert.location}</span>
              </div>
              {alert.protocolId && (
                <button 
                  onClick={() => onViewProtocol(alert.protocolId!)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Ver Protocolo
                  <SparklesIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertSystem;

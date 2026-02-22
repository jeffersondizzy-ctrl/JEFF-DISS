
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';
import { UserAccount } from '../types';
import { UsersIcon, XMarkIcon, DatabaseIcon, SparklesIcon } from './icons';

interface OnlineUsersProps {
  currentUser: string;
  currentUserUnit: string;
}

const STORAGE_USERS_KEY = 'pre_alerta_gr_agent_registry_v2';

const OnlineUsers: React.FC<OnlineUsersProps> = ({ currentUser, currentUserUnit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [agents, setAgents] = useState<UserAccount[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_USERS_KEY);
    if (saved) {
      try {
        const list = JSON.parse(saved);
        // Oculta o ADMIN da lista de usuários disponíveis para o monitor
        const filteredList = list.filter((u: any) => u.username.toUpperCase() !== 'ADMIN');
        setAgents(filteredList.map((u: any) => ({ ...u, units: u.units || [u.unit] })));
      } catch (e) { console.error(e); }
    }
  }, []);

  // Simulação de usuários online para efeito visual de rede viva
  const onlineAgents = useMemo(() => {
    // O usuário atual sempre está online
    const current = agents.find(a => a.username.toUpperCase() === currentUser.toUpperCase());
    const others = agents.filter(a => a.username.toUpperCase() !== currentUser.toUpperCase());
    
    // Pega o usuário atual e mais uns 2 aleatórios para simular atividade real
    const simulatedOnline = others.slice(0, 3);
    
    const finalSelection = [];
    if (current) finalSelection.push({ ...current, isYou: true });
    simulatedOnline.forEach(a => finalSelection.push({ ...a, isYou: false }));
    
    return finalSelection;
  }, [agents, currentUser]);

  return (
    <div className="fixed bottom-8 right-8 z-[150] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-72 bg-black/80 backdrop-blur-2xl border border-roasted-gold/30 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-5 border-b border-white/5 bg-roasted-gold/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <h3 className="text-[10px] font-black text-roasted-gold uppercase tracking-widest">Agentes em Rede</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {onlineAgents.map((agent, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full border border-roasted-gold/20 overflow-hidden bg-black flex items-center justify-center">
                    {agent.profilePic ? (
                      <img src={agent.profilePic} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-black text-roasted-gold">{agent.username[0]}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase truncate">
                      {agent.username}
                      {agent.isYou && <span className="ml-1.5 text-roasted-gold/60">(VOCÊ)</span>}
                    </span>
                    <span className="text-[7px] font-black text-roasted-gold/60 uppercase tracking-tighter">
                      {agent.role || 'AGENTE DE RISCO'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-40 mt-1">
                    <DatabaseIcon className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-black uppercase truncate">{agent.units[0]}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {onlineAgents.length === 0 && (
              <div className="py-10 text-center opacity-20">
                <SparklesIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-[8px] font-black uppercase tracking-widest">Sincronizando Rede...</p>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
            <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em]">Scanner Platinum v5.0</span>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative group ${isOpen ? 'bg-roasted-gold text-espresso-dark rotate-90' : 'bg-espresso-dark border border-roasted-gold/20 text-roasted-gold hover:border-roasted-gold/60'}`}
      >
        {/* Efeito de Pulso de Radar quando fechado */}
        {!isOpen && (
          <>
            <div className="absolute inset-0 rounded-full border border-green-500/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border border-green-500/10 animate-[ping_2s_infinite]"></div>
          </>
        )}
        
        <UsersIcon className={`w-6 h-6 transition-transform duration-500 ${isOpen ? 'scale-90' : 'group-hover:scale-110'}`} />
        
        {/* Contador sutil */}
        {!isOpen && onlineAgents.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#120A07]">
            {onlineAgents.length}
          </span>
        )}
      </button>
    </div>
  );
};

export default OnlineUsers;

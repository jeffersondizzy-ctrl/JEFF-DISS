
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { UserAccount } from '../types';
import { SparklesIcon, XMarkIcon, CakeIcon, AwardIcon } from './icons';

interface BirthdayModalProps {
  agent: UserAccount;
  onClose: () => void;
}

const BirthdayModal: React.FC<BirthdayModalProps> = ({ agent, onClose }) => {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Efeito de partículas de ouro flutuantes */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-roasted-gold rounded-full animate-ping opacity-20"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-2xl coffee-panel p-1 border-roasted-gold/40 relative overflow-hidden group shadow-[0_0_100px_rgba(192,149,92,0.2)]">
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 z-20 text-white/20 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-8 h-8" />
        </button>

        <div className="bg-gradient-to-b from-roasted-gold/10 to-transparent p-12 flex flex-col items-center text-center">
          
          <div className="relative mb-10">
            {/* Aura de Celebração */}
            <div className="absolute inset-0 bg-roasted-gold/30 blur-3xl rounded-full scale-150 animate-pulse"></div>
            
            <div className="w-48 h-48 rounded-full border-4 border-roasted-gold p-1.5 relative z-10 shadow-2xl overflow-hidden bg-espresso-dark">
              {agent.profilePic ? (
                <img src={agent.profilePic} className="w-full h-full object-cover rounded-full" alt={agent.username} />
              ) : (
                <div className="w-full h-full rounded-full bg-roasted-gold/10 flex items-center justify-center text-5xl font-black text-roasted-gold uppercase">
                  {agent.username[0]}
                </div>
              )}
            </div>
            
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 bg-roasted-gold text-espresso-dark px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2">
              <AwardIcon className="w-4 h-4" /> AGENTE DE ELITE
            </div>
          </div>

          <div className="space-y-6 relative z-10 max-w-lg">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-4 text-roasted-gold mb-2">
                <CakeIcon className="w-6 h-6 animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-[0.6em] opacity-60">Celebração de Ciclo</span>
                <CakeIcon className="w-6 h-6 animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none pb-2">
                {agent.fullName || agent.username}
              </h2>
              <div className="h-0.5 w-32 bg-roasted-gold/30 mt-4"></div>
            </div>

            <p className="text-sm text-[#e6f1ff]/80 leading-relaxed font-medium italic">
              "Hoje a Rede Platinum faz uma pausa operacional para homenagear um de seus pilares. {agent.username}, sua presença é fundamental para a integridade da nossa logística. Seu compromisso com a excelência não apenas protege cargas, mas fortalece toda a nossa família. Você é peça-chave no sucesso do Café Três Corações."
            </p>

            <div className="pt-8 flex flex-col items-center">
               <span className="text-[10px] font-black text-roasted-gold uppercase tracking-[0.4em] mb-4">Membro da Família Três Corações</span>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Sincronização Vital Concluída</span>
               </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="mt-12 w-full max-w-xs coffee-button py-5 text-[10px] flex items-center justify-center gap-3"
          >
            <SparklesIcon className="w-4 h-4" /> CONTINUAR OPERAÇÃO
          </button>
        </div>
      </div>
    </div>
  );
};

export default BirthdayModal;

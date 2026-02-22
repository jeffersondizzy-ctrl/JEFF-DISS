
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { AwardIcon } from './icons';

const FounderSection: React.FC = () => {
  return (
    <div className="cyber-glass rounded-[4rem] p-16 animate-in zoom-in-95 duration-700 border border-[#C0955C]/20 relative overflow-hidden flex flex-col items-center text-center bg-black/40">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#C0955C]/50 to-transparent"></div>
      <div className="absolute -top-24 w-96 h-96 bg-[#C0955C]/5 blur-[100px] rounded-full"></div>
      
      <div className="relative mb-12">
        <div className="w-32 h-32 rounded-full border-2 border-[#C0955C]/30 flex items-center justify-center bg-[#0a192f] shadow-[0_0_50px_rgba(192,149,92,0.1)] relative z-10">
          <AwardIcon className="w-16 h-16 text-[#C0955C]" />
        </div>
        <div className="absolute inset-0 border border-[#C0955C]/20 rounded-full scale-125 animate-[spin_20s_linear_infinite] border-dashed"></div>
      </div>

      <div className="space-y-4 max-w-2xl relative z-10">
        <span className="text-[10px] font-black text-[#C0955C] uppercase tracking-[0.8em] opacity-60">Architect & Founder</span>
        <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none pb-2">
          Jefferson Augusto
        </h2>
        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-[#C0955C]/40 to-transparent mx-auto"></div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
            <span>28 Anos</span>
            <span className="w-1 h-1 rounded-full bg-[#C0955C]"></span>
            <span>Membro desde 16/03/2022</span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#C0955C]">Operação Café Três Corações</span>
        </div>
      </div>

      <p className="mt-12 text-sm text-[#e6f1ff]/60 leading-relaxed max-w-xl font-medium italic">
        "Com início de jornada no Café em 16 de março de 2022, minha missão tem sido redefinir os limites da segurança logística através da inovação tecnológica contínua, garantindo que cada operação seja monitorada com precisão absoluta e inteligência preventiva para o sucesso do grupo."
      </p>

      <div className="mt-16 grid grid-cols-3 gap-8 w-full max-w-md">
        <div className="flex flex-col items-center">
          <span className="text-lg font-black text-white">V5.0 PLATINUM</span>
          <span className="text-[8px] font-black uppercase tracking-widest text-[#C0955C]/40">Edição Café Três Corações</span>
        </div>
        <div className="w-[1px] h-full bg-white/5 mx-auto"></div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-black text-white">2026</span>
          <span className="text-[8px] font-black uppercase tracking-widest text-[#C0955C]/40">Ciclo Operacional</span>
        </div>
      </div>

      {/* Signature area simulation */}
      <div className="mt-20 opacity-30">
        <div className="text-[9px] font-black uppercase tracking-[0.4em] mb-4">Assinatura Digital Autenticada</div>
        <div className="h-0.5 w-64 bg-white/20 relative">
          <div className="absolute top-0 left-0 h-full w-1/2 bg-[#C0955C]"></div>
        </div>
      </div>
    </div>
  );
};

export default FounderSection;

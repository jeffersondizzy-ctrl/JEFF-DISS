
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { LogisticsEntry, OperationStatus } from '../types';

interface IscaHistoryProps {
  entries: LogisticsEntry[];
  currentUser: string;
}

const IscaHistory: React.FC<IscaHistoryProps> = ({ entries, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtro de Segurança: Apenas registros criados pelo usuário logado (Protegido por Usuário)
  const userEntries = entries.filter(e => e.author === currentUser);

  // Agrupamento de entradas por ID da isca (Telemetria por Dispositivo)
  const iscaGroups = userEntries.reduce((acc, entry) => {
    entry.numIsca.forEach(iscaId => {
      if (!acc[iscaId]) acc[iscaId] = [];
      acc[iscaId].push(entry);
    });
    return acc;
  }, {} as Record<string, LogisticsEntry[]>);

  const filteredIscas = Object.keys(iscaGroups).filter(id => id.includes(searchTerm));

  return (
    <div className="space-y-6">
      <div className="cyber-glass p-8 rounded-[3rem] border border-[#64ffda]/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div>
            <h2 className="text-xl font-black uppercase text-[#64ffda] tracking-widest">Registro de Isca</h2>
            <p className="text-[10px] text-white/30 font-bold uppercase mt-1">Dados Privados de: {currentUser}</p>
          </div>
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="PESQUISAR ISCA ID..." 
              className="w-full bg-[#050a10] border border-[#64ffda]/20 rounded-2xl px-6 py-4 text-xs text-[#64ffda] outline-none focus:border-[#64ffda] shadow-inner"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIscas.map(iscaId => {
            const history = iscaGroups[iscaId];
            const lastUpdate = history[0]; // Ordenado por timestamp decrescente no storage
            
            return (
              <div key={iscaId} className="bg-[#0a192f]/50 border border-[#64ffda]/10 rounded-3xl p-6 hover:border-[#64ffda]/40 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#64ffda]/5 rounded-full -mr-8 -mt-8 animate-pulse"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">ID Dispositivo</span>
                    <h3 className="text-2xl font-black text-[#64ffda]">#{iscaId}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#64ffda]/10 flex items-center justify-center text-[#64ffda] font-black border border-[#64ffda]/20 shadow-lg">
                    {history.length}
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                      <span className="text-white/40">Última Unidade</span>
                      <span className="text-white/80">{lastUpdate.placaCavalo}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                      <span className="text-white/40">Localização Atual</span>
                      <span className="text-white/80">{lastUpdate.destino}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                      <span className="text-white/40">Estado de Risco</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] border ${lastUpdate.status === OperationStatus.EXTRAVIADA ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-[#64ffda]/10 text-[#64ffda] border-[#64ffda]/20'}`}>
                        {lastUpdate.status}
                      </span>
                   </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 relative z-10">
                  <p className="text-[9px] font-black uppercase text-white/10 mb-2 tracking-widest">Rastro de Telemetria</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                    {history.slice(0, 8).map((h, idx) => (
                      <div key={h.id} className="w-8 h-1 bg-[#64ffda]/20 rounded-full shrink-0" title={`${h.status} em ${new Date(h.timestamp).toLocaleDateString()}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredIscas.length === 0 && (
            <div className="col-span-full py-32 text-center">
               <div className="opacity-10 mb-6">
                  <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-4xl">?</div>
               </div>
               <p className="text-[#64ffda]/30 uppercase text-xs font-black tracking-[0.4em]">Nenhum registro privado encontrado</p>
               <p className="text-[9px] text-white/10 uppercase mt-2">Os dados de outros usuários são protegidos e inacessíveis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IscaHistory;

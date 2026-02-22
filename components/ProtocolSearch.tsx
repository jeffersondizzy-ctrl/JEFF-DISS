
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { LogisticsEntry } from '../types';
import { SearchIcon, XMarkIcon } from './icons';

interface ProtocolSearchProps {
  entries: LogisticsEntry[];
}

const ProtocolSearch: React.FC<ProtocolSearchProps> = ({ entries }) => {
  const [protocolId, setProtocolId] = useState('');
  const [foundEntry, setFoundEntry] = useState<LogisticsEntry | null>(null);
  const [error, setError] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = entries.find(ent => ent.protocol === parseInt(protocolId));
    if (entry) {
      setFoundEntry(entry);
      setError(false);
    } else {
      setFoundEntry(null);
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const clear = () => {
    setProtocolId('');
    setFoundEntry(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="cyber-glass p-12 rounded-[3.5rem] border border-[#64ffda]/10 max-w-2xl mx-auto">
        <h2 className="text-xl font-black text-[#64ffda] uppercase tracking-[0.4em] mb-8 text-center">Consultar Protocolo Ativo</h2>
        
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <input 
              type="number" 
              value={protocolId}
              onChange={e => setProtocolId(e.target.value)}
              placeholder="DIGITE O Nº DO PROTOCOLO" 
              className={`w-full bg-[#050a10] border rounded-2xl px-6 py-5 text-lg font-black text-[#64ffda] outline-none transition-all placeholder:text-white/5 ${error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#64ffda]/20 focus:border-[#64ffda]'}`}
            />
            {error && <span className="absolute -bottom-6 left-6 text-[10px] font-bold text-red-500 uppercase">Protocolo não localizado na rede</span>}
          </div>
          <button type="submit" className="px-8 bg-[#64ffda] text-[#0a192f] rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(100,255,218,0.3)]">
            <SearchIcon className="w-6 h-6" />
          </button>
        </form>
      </div>

      {foundEntry && (
        <div className="animate-in slide-in-from-bottom-8 duration-700 max-w-5xl mx-auto">
          <div className="bg-[#f8fafc] text-[#0f172a] rounded-[3rem] overflow-hidden shadow-2xl border border-white/20">
            <div className="bg-white p-10 border-b border-gray-100 flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-[#64ffda] font-black italic shadow-xl">GR</div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Protocolo de Segurança #{foundEntry.protocol}</h3>
                </div>
                <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase text-gray-400">
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Transmissão Platinum Ativa</span>
                  <span className="flex items-center gap-2">Agente: {foundEntry.author}</span>
                  <span className="flex items-center gap-2">Rota: {foundEntry.origem} ➜ {foundEntry.destino}</span>
                </div>
              </div>
              <button onClick={clear} className="p-3 bg-gray-100 hover:bg-red-50 rounded-2xl transition-all hover:text-red-500">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 bg-white">
              <div className="bg-gradient-to-br from-[#0a192f] to-[#03070a] rounded-[2.5rem] p-10 border-4 border-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <span className="text-[10px] font-black text-[#64ffda] uppercase tracking-[0.3em] block mb-2">Condutor e Veículo</span>
                      <p className="text-3xl font-black text-white uppercase italic">{foundEntry.motorista}</p>
                      <div className="flex gap-4 mt-4">
                        <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 text-xl font-black text-white font-mono tracking-tighter">
                          {foundEntry.placaCavalo}
                        </div>
                        <div className="flex-1 px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex flex-wrap gap-2">
                           {foundEntry.placaVeiculo.map((pv, i) => (
                             <span key={i} className="text-sm font-black text-white/50 font-mono">{pv}</span>
                           ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10">
                      <span className="text-[9px] font-black text-[#64ffda] uppercase block mb-1">Responsável Pré</span>
                      <p className="text-xs font-bold text-white uppercase">{foundEntry.responsavelPreAlerta || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <span className="text-[10px] font-black text-[#64ffda] uppercase tracking-[0.3em] block">Status de Embarque de Iscas</span>
                    <div className="space-y-4">
                      {foundEntry.embarqueIsca.map((pos, idx) => (
                        <div key={idx} className="flex flex-col p-6 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden group">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#64ffda] text-[#0a192f] flex items-center justify-center font-black text-xs">{idx + 1}</div>
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">ID #{foundEntry.numIsca[idx] || 'S/N'}</span>
                            </div>
                            <span className="text-[9px] font-black text-[#64ffda] uppercase">{foundEntry.iscaPertencente[idx]}</span>
                          </div>
                          <p className="text-sm font-black text-white uppercase">{pos}</p>
                          <p className="text-[10px] text-white/40 italic mt-2 leading-tight">"{foundEntry.embarqueObservacoes[idx] || 'Nenhuma obs.'}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-[#64ffda] uppercase">Notas Fiscais</span>
                    <p className="text-[10px] font-bold text-white/60 truncate">{foundEntry.numNF.join(' | ')}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-[#64ffda] uppercase">UMA</span>
                    <p className="text-[10px] font-bold text-white/60 truncate">{foundEntry.uma.join(' | ')}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-[#64ffda] uppercase">Código Produto</span>
                    <p className="text-[10px] font-bold text-white/60 truncate">{foundEntry.codigoProduto.join(' | ')}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-[#64ffda] uppercase">Gerado em</span>
                    <p className="text-[10px] font-bold text-white/60">{new Date(foundEntry.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-center italic text-[10px] text-gray-400 font-bold uppercase tracking-[0.5em]">
              Monitoramento Platinum Ativo / Fim do Registro Oficial
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtocolSearch;

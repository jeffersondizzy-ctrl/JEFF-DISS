
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { LogisticsEntry, OperationStatus } from '../types';
import { ChevronRightIcon } from './icons';

interface HistoryTableProps {
  entries: LogisticsEntry[];
  onSelect: (entry: LogisticsEntry) => void;
  onEdit: (entry: LogisticsEntry) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ entries, onSelect, onEdit }) => {
  if (entries.length === 0) {
    return (
      <div className="p-32 text-center">
        <div className="w-20 h-20 bg-[#64ffda]/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#64ffda]/10 animate-pulse">
          <div className="w-10 h-10 border-2 border-[#64ffda]/20 border-t-[#64ffda] rounded-full animate-spin"></div>
        </div>
        <p className="text-[#64ffda]/30 text-xs font-black uppercase tracking-[0.3em]">Varrendo rede por telemetria...</p>
      </div>
    );
  }

  const getStatusStyle = (status: OperationStatus) => {
    switch (status) {
      case OperationStatus.EXTRAVIADA: return 'text-red-400 bg-red-400/10 border-red-500/30';
      case OperationStatus.NO_DESTINO: return 'text-green-400 bg-green-400/10 border-green-500/30';
      default: return 'text-[#64ffda] bg-[#64ffda]/10 border-[#64ffda]/30';
    }
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#0a192f] text-[10px] font-black text-[#64ffda]/50 uppercase tracking-[0.2em] sticky top-0 z-20">
            <th className="px-8 py-6 border-b border-white/5">Protocolo</th>
            <th className="px-8 py-6 border-b border-white/5">Agente / Condutor</th>
            <th className="px-8 py-6 border-b border-white/5">Unidade de Carga</th>
            <th className="px-8 py-6 border-b border-white/5">Isca ID(s)</th>
            <th className="px-8 py-6 border-b border-white/5">Geo-Destino</th>
            <th className="px-8 py-6 border-b border-white/5">Estado Operacional</th>
            <th className="px-8 py-6 border-b border-white/5 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {entries.map((e, idx) => (
            <tr 
              key={e.id} 
              className="addictive-row bg-transparent"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <td className="px-8 py-5" onClick={() => onSelect(e)}>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-[#64ffda] tracking-tighter">#P{e.protocol?.toString().padStart(4, '0') || '----'}</span>
                  <span className="text-[9px] text-white/20 font-bold">{new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </td>
              <td className="px-8 py-5" onClick={() => onSelect(e)}>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white/90 uppercase tracking-tight">{e.motorista}</span>
                  <span className="text-[9px] text-[#64ffda]/40 font-black uppercase tracking-widest">{e.author}</span>
                </div>
              </td>
              <td className="px-8 py-5" onClick={() => onSelect(e)}>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] px-2 py-0.5 bg-black border border-white/10 rounded font-mono font-black text-[#64ffda]">{e.placaCavalo}</span>
                    <div className="flex flex-wrap gap-1 max-w-[120px]">
                      {e.placaVeiculo.map((pv, pIdx) => (
                        <span key={pIdx} className="text-[9px] px-1.5 py-0.5 bg-black border border-white/5 rounded font-mono font-black text-white/30">{pv}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5" onClick={() => onSelect(e)}>
                <div className="flex flex-wrap items-center gap-2 max-w-[150px]">
                  {e.numIsca.map((isc, iscIdx) => (
                    <div key={iscIdx} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-[#64ffda] animate-pulse"></div>
                      <span className="text-[10px] font-mono text-white/60 font-black">{isc}</span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-8 py-5" onClick={() => onSelect(e)}>
                <span className="text-xs font-black text-white/80 uppercase tracking-tight">{e.destino}</span>
              </td>
              <td className="px-8 py-5" onClick={() => onSelect(e)}>
                <span className={`text-[9px] font-black px-3 py-1.5 rounded-md border uppercase tracking-tighter ${getStatusStyle(e.status)}`}>
                  {e.status}
                </span>
              </td>
              <td className="px-8 py-5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={(ev) => { ev.stopPropagation(); onEdit(e); }}
                    className="px-3 py-2 bg-white/5 text-white/40 hover:bg-[#64ffda]/20 hover:text-[#64ffda] rounded-lg text-[10px] font-black uppercase transition-all border border-white/10"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => onSelect(e)}
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-[#64ffda] bg-[#64ffda]/5 hover:bg-[#64ffda] hover:text-[#0a192f] px-4 py-2 rounded-lg transition-all border border-[#64ffda]/20"
                  >
                    Exibir
                    <ChevronRightIcon className="w-3 h-3" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;

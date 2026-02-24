
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useState } from 'react';
import { LogisticsEntry, OperationStatus, UnitTab } from '../types';
import { 
  ClipboardIcon, 
  SearchIcon, 
  XMarkIcon, 
  DatabaseIcon, 
  PlusIcon,
  KeyIcon
} from './icons';
import { CityDropdown } from './LogisticsForm';

interface PreAlertsViewProps {
  entries: LogisticsEntry[];
  unitTabs: UnitTab[];
  onAddUnitTab: (unit: UnitTab) => void;
  onSelect: (entry: LogisticsEntry) => void;
  onUpdateEntry: (id: string, updates: Partial<LogisticsEntry>) => void;
  currentUser: string;
  currentUserUnit: string;
}

const inputStyle = "w-full bg-black/40 border border-roasted-gold/20 rounded-xl px-5 py-4 text-sm focus:border-roasted-gold outline-none transition-none placeholder:text-white/10 text-white font-bold uppercase tracking-wider";
const labelStyle = "text-[10px] font-black text-roasted-gold uppercase tracking-[0.2em] mb-2 block ml-1 opacity-70";

/**
 * Badge de Status Informativo
 */
const StatusBadge: React.FC<{ status: OperationStatus }> = ({ status }) => {
  const getStatusBadgeStyle = (status: OperationStatus) => {
    switch (status) {
      case OperationStatus.ROTA_IDA:
      case OperationStatus.ROTA_VOLTA:
        return "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]";
      default:
        return "bg-roasted-gold/10 text-roasted-gold border-roasted-gold/20";
    }
  };

  return (
    <div className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.15em] transition-all ${getStatusBadgeStyle(status)}`}>
      {status}
    </div>
  );
};

const PreAlertsView: React.FC<PreAlertsViewProps> = ({ entries, unitTabs, onAddUnitTab, onSelect, onUpdateEntry, currentUser, currentUserUnit }) => {
  const [activeUnit, setActiveUnit] = useState<UnitTab | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState<UnitTab | null>(null);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitPass, setNewUnitPass] = useState('');
  const [unlockError, setUnlockError] = useState(false);
  const [searchIsca, setSearchIsca] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (showUnlockModal && unlockPassword === showUnlockModal.password) {
      setActiveUnit(showUnlockModal);
      setShowUnlockModal(null);
      setUnlockPassword('');
      setUnlockError(false);
    } else {
      setUnlockError(true);
      setTimeout(() => setUnlockError(false), 2000);
    }
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName || !newUnitPass) return;
    const newUnit: UnitTab = {
      id: crypto.randomUUID(),
      name: newUnitName.toUpperCase(),
      password: newUnitPass,
      createdAt: new Date().toISOString()
    };
    onAddUnitTab(newUnit);
    setNewUnitName('');
    setNewUnitPass('');
    setShowCreateModal(false);
  };

  const filteredEntries = useMemo(() => {
    if (!activeUnit) return [];
    const unitName = activeUnit.name.toUpperCase();
    
    return entries.filter(entry => {
      if (entry.status === OperationStatus.EXTRAVIADA || entry.status === OperationStatus.NO_DESTINO) {
        return false;
      }

      const isOrigem = entry.origem?.toUpperCase() === unitName;
      const isDestino = entry.destino?.toUpperCase() === unitName;
      const isIscaOwner = entry.iscaPertencente?.some(city => city?.toUpperCase() === unitName);
      
      const isRelevant = isOrigem || isDestino || isIscaOwner;
      if (!isRelevant) return false;

      if (!searchIsca.trim()) return true;
      const term = searchIsca.toUpperCase();
      return (
        entry.numIsca.some(isca => isca.toUpperCase().includes(term)) ||
        entry.placaCavalo.toUpperCase().includes(term) ||
        entry.motorista.toUpperCase().includes(term) ||
        entry.protocol?.toString().includes(term)
      );
    });
  }, [entries, activeUnit, searchIsca]);

  if (!activeUnit) {
    return (
      <div className="space-y-6 md:space-y-12">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4 md:space-y-6">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-roasted-gold/10 rounded-full flex items-center justify-center border border-roasted-gold/20 shadow-2xl">
            <ClipboardIcon className="w-8 h-8 md:w-12 md:h-12 text-roasted-gold" />
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Cargas em Trânsito</h2>
            <p className="text-[8px] md:text-[10px] text-roasted-gold/50 font-black uppercase tracking-[0.5em] mt-2 md:mt-3">Monitoramento em Tempo Real de Dispositivos Ativos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          <div onClick={() => setShowCreateModal(true)} className="p-6 md:p-10 rounded-[2rem] border-2 border-dashed border-roasted-gold/20 hover:border-roasted-gold/60 bg-roasted-gold/5 hover:bg-roasted-gold/10 cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] md:min-h-[220px]">
            <PlusIcon className="w-6 h-6 md:w-10 md:h-10 text-roasted-gold mb-4" />
            <h3 className="text-xs md:text-sm font-black text-roasted-gold uppercase tracking-widest">Ativar Unidade</h3>
          </div>

          {unitTabs.map(unit => (
            <div key={unit.id} onClick={() => setShowUnlockModal(unit)} className="coffee-panel p-6 md:p-10 cursor-pointer transition-all group relative overflow-hidden flex flex-col items-center justify-center min-h-[160px] md:min-h-[220px]">
              <div className="absolute top-4 md:top-6 right-4 md:right-6"><KeyIcon className="w-4 h-4 md:w-5 md:h-5 text-roasted-gold/20" /></div>
              <DatabaseIcon className="w-6 h-6 md:w-10 md:h-10 text-white/10 mb-4 group-hover:text-roasted-gold transition-all" />
              <h3 className="text-sm md:text-base font-black text-white uppercase tracking-widest text-center">{unit.name}</h3>
            </div>
          ))}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/95">
            <form onSubmit={handleCreateUnit} className="w-full max-w-md coffee-panel p-8 md:p-12 border border-roasted-gold/20 relative">
              <button type="button" onClick={() => setShowCreateModal(false)} className="absolute top-6 md:top-8 right-6 md:right-8 text-white/20 hover:text-white"><XMarkIcon className="w-6 h-6 md:w-8 md:h-8" /></button>
              <h2 className="text-lg md:text-xl font-black text-roasted-gold uppercase tracking-[0.3em] mb-8 md:mb-10 text-center">Registrar Unidade</h2>
              <div className="space-y-6 md:space-y-8">
                <CityDropdown label="Filial Oficial" value={newUnitName} placeholder="LOCALIDADE..." onChange={v => setNewUnitName(v)} />
                <div className="space-y-2">
                  <label className={labelStyle}>Senha de Acesso</label>
                  <input required type="password" className={inputStyle} value={newUnitPass} onChange={e => setNewUnitPass(e.target.value)} placeholder="••••••••" />
                </div>
                <button type="submit" className="w-full coffee-button py-4 md:py-5 text-xs">Ativar Terminal</button>
              </div>
            </form>
          </div>
        )}

        {showUnlockModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/95">
            <form onSubmit={handleUnlock} className={`w-full max-sm coffee-panel p-8 md:p-12 flex flex-col items-center border ${unlockError ? 'border-red-500 animate-shake' : 'border-roasted-gold/20'}`}>
              <KeyIcon className="w-8 h-8 md:w-10 md:h-10 text-roasted-gold mb-6 md:mb-8" />
              <h2 className="text-base md:text-lg font-black text-white uppercase tracking-widest mb-10 text-center">{showUnlockModal.name}</h2>
              <input autoFocus required type="password" className={`${inputStyle} text-center tracking-[0.5em] mb-6`} value={unlockPassword} onChange={(e) => setUnlockPassword(e.target.value)} placeholder="••••••••" />
              <div className="flex gap-4 w-full">
                <button type="button" onClick={() => {setShowUnlockModal(null); setUnlockPassword('');}} className="flex-1 py-3 md:py-4 bg-white/5 text-white/30 rounded-xl font-black uppercase text-[8px]">Voltar</button>
                <button type="submit" className="flex-[2] coffee-button py-3 md:py-4 text-[8px]">Acessar</button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 p-5 md:p-8 rounded-[2.5rem] border border-roasted-gold/10 gap-4 md:gap-6">
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-roasted-gold text-espresso-dark rounded-2xl flex items-center justify-center font-black text-lg md:text-xl shrink-0">
            {activeUnit.name.substring(0, 2)}
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-xl font-black text-white uppercase tracking-widest truncate">{activeUnit.name}</h3>
            <span className="text-[8px] md:text-[9px] text-roasted-gold/60 font-black uppercase tracking-widest">Monitoramento Ativo de Trânsito</span>
          </div>
        </div>
        <div className="w-full md:flex-1 md:max-w-md relative group">
           <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
           <input 
            type="text" 
            placeholder="PROCURAR POR PROTOCOLO, ISCA OU MOTORISTA..." 
            value={searchIsca}
            onChange={e => setSearchIsca(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 md:py-3 text-[10px] font-black text-white outline-none focus:border-roasted-gold uppercase"
           />
        </div>
        <button onClick={() => setActiveUnit(null)} className="w-full md:w-auto px-6 py-2.5 md:py-3 bg-white/5 text-white/40 hover:bg-white/10 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest">Trocar Unidade</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {filteredEntries.slice(0, visibleCount).map((entry) => {
          const isUnread = !entry.readByUnits?.includes(activeUnit.name);
          
          return (
            <div 
              key={entry.id}
              className={`coffee-panel p-5 md:p-8 border flex flex-col justify-between transition-all duration-500 ${
                isUnread 
                  ? 'border-roasted-gold shadow-[0_0_40px_rgba(192,149,92,0.2)] bg-roasted-gold/[0.05]' 
                  : 'border-white/5 hover:border-roasted-gold/30'
              }`}
            >
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{isUnread ? '✉️' : '📂'}</span>
                      {isUnread && (
                        <span className="text-[7px] font-black text-roasted-gold uppercase tracking-[0.3em] mb-1 animate-pulse">Novo Registro</span>
                      )}
                    </div>
                    <span className="text-[7px] md:text-[8px] text-white/20 font-black uppercase tracking-widest">{new Date(entry.timestamp).toLocaleDateString()}</span>
                  </div>
                  {/* PROTOCOLO MOVIDO PARA O CANTO DIREITO */}
                  <div className="bg-black/60 px-3 py-1.5 rounded-lg border border-roasted-gold/30 shadow-[0_0_15px_rgba(192,149,92,0.1)]">
                    <span className="text-[10px] font-black text-roasted-gold tracking-widest font-mono">
                      #P{entry.protocol?.toString().padStart(5, '0')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base md:text-lg font-black text-white uppercase truncate tracking-tight">{entry.motorista}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] text-white/30 uppercase font-black tracking-widest">Origem:</span>
                    <span className="text-[8px] text-white/60 font-black uppercase">{entry.origem}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] text-white/30 uppercase font-black tracking-widest">Destino:</span>
                    <span className="text-[8px] text-white font-black uppercase">{entry.destino}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-5 border-t border-white/5">
                  <span className="text-[8px] font-black uppercase block text-roasted-gold/40 tracking-[0.3em]">Estado da Carga</span>
                  <div className="space-y-3">
                    {entry.numIsca.map((iscaId, idx) => {
                      const individualStatus = entry.iscaStatuses?.[idx] || entry.status;
                      const isOwnerOfIsca = entry.iscaPertencente[idx].toUpperCase() === activeUnit.name.toUpperCase();
                      
                      return (
                        <div key={idx} className="flex items-center justify-between gap-4 p-4 bg-black/40 rounded-2xl border border-white/5 transition-all hover:bg-white/[0.02]">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                               <span className="text-[11px] font-black text-white font-mono tracking-tighter">#{iscaId}</span>
                               {isOwnerOfIsca && <span className="text-[6px] bg-roasted-gold text-espresso-dark px-1.5 py-0.5 rounded font-black uppercase">Própria</span>}
                            </div>
                            <span className="text-[7px] text-white/20 uppercase font-black tracking-tighter">Proprietário: {entry.iscaPertencente[idx]}</span>
                          </div>
                          
                          <div className="flex items-center">
                            {entry.destino.toUpperCase() === activeUnit.name.toUpperCase() ? (
                              <select 
                                value={individualStatus}
                                onChange={(e) => {
                                  const newStatuses = [...(entry.iscaStatuses || entry.numIsca.map(() => entry.status))];
                                  newStatuses[idx] = e.target.value as OperationStatus;
                                  onUpdateEntry(entry.id, { iscaStatuses: newStatuses });
                                }}
                                className="bg-black/60 text-white border border-roasted-gold/30 rounded-xl px-3 py-2 text-[9px] font-black uppercase outline-none focus:border-roasted-gold transition-all"
                              >
                                <option value={OperationStatus.ROTA_IDA}>{OperationStatus.ROTA_IDA}</option>
                                <option value={OperationStatus.ROTA_VOLTA}>{OperationStatus.ROTA_VOLTA}</option>
                                <option value={OperationStatus.NO_DESTINO}>{OperationStatus.NO_DESTINO}</option>
                                <option value={OperationStatus.EXTRAVIADA}>{OperationStatus.EXTRAVIADA}</option>
                              </select>
                            ) : (
                              <StatusBadge status={individualStatus} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                    <span className="text-[7px] font-black uppercase block mb-1 opacity-40">Placa Cavalo</span>
                    <span className="text-[9px] font-black font-mono text-white tracking-widest">{entry.placaCavalo}</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                    <span className="text-[7px] font-black uppercase block mb-1 opacity-40">Baú/Carreta</span>
                    <span className="text-[9px] font-black font-mono text-white tracking-widest truncate">{entry.placaVeiculo.join('/')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
                <button 
                  onClick={() => onSelect(entry)}
                  className="w-full bg-white/5 hover:bg-roasted-gold hover:text-espresso-dark text-white/40 hover:text-espresso-dark font-black py-4 rounded-xl text-[8px] md:text-[9px] uppercase tracking-[0.3em] transition-all border border-white/10 shadow-lg"
                >
                  Ver Pre Alerta
                </button>
              </div>
            </div>
          );
        })}

        {visibleCount < filteredEntries.length && (
          <div className="col-span-full py-8 text-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-12 py-4 bg-roasted-gold/10 text-roasted-gold border border-roasted-gold/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-roasted-gold/20 transition-all"
            >
              Carregar mais trânsitos ({filteredEntries.length - visibleCount} restantes)
            </button>
          </div>
        )}

        {filteredEntries.length === 0 && (
          <div className="col-span-full py-40 text-center opacity-20">
            <DatabaseIcon className="w-16 h-16 mx-auto mb-6" />
            <p className="text-sm font-black uppercase tracking-[0.5em]">Nenhum trânsito ativo detectado para {activeUnit.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreAlertsView;

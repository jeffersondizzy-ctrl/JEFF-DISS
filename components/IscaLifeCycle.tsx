
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useState } from 'react';
import { LogisticsEntry, OperationStatus, UnitTab, City, LoadingPosition, VehicleType } from '../types';
import { SearchIcon, XMarkIcon, TruckIcon, ChevronRightIcon, AwardIcon, PlusIcon, ChevronDownIcon } from './icons';

interface IscaLifeCycleProps {
  entries: LogisticsEntry[];
  iscaControlEntries: LogisticsEntry[];
  activeUnit: UnitTab;
  onEditEntry: (entry: LogisticsEntry) => void;
  onAddExpress: (entry: Omit<LogisticsEntry, 'id' | 'timestamp' | 'protocol'>) => void;
}

const statusThemes: Record<string, { color: string, glow: string, label: string, desc: string }> = {
  [OperationStatus.ROTA_IDA]: { color: '#00f2ff', glow: 'rgba(0, 242, 255, 0.4)', label: 'Rota Ida', desc: 'O ATIVO ESTÁ EM DESLOCAMENTO PARA A UNIDADE DE DESTINO FINAL.' },
  [OperationStatus.NO_DESTINO]: { color: '#00ff88', glow: 'rgba(0, 255, 136, 0.4)', label: 'No Destino', desc: 'O ATIVO CHEGOU AO DESTINO E AGUARDA PROCESSAMENTO OU RETORNO.' },
  [OperationStatus.ROTA_VOLTA]: { color: '#7000ff', glow: 'rgba(112, 0, 255, 0.4)', label: 'Rota Volta', desc: 'O ATIVO ESTÁ RETORNANDO PARA SUA UNIDADE DE ORIGEM (DONA).' },
  [OperationStatus.ISCA_DISPONIVEL]: { color: '#64ffda', glow: 'rgba(100, 255, 218, 0.4)', label: 'Disponível', desc: 'O ATIVO ENCONTRA-SE NO ESTOQUE DA UNIDADE PRONTO PARA USO.' },
  [OperationStatus.PREPARACAO]: { color: '#ff00ff', glow: 'rgba(255, 0, 255, 0.4)', label: 'Preparação', desc: 'O ATIVO ESTÁ EM MANUTENÇÃO, CARGA DE BATERIA OU CONFIGURAÇÃO.' },
  [OperationStatus.VIA_CORREIO]: { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)', label: 'Via Correio', desc: 'O ATIVO FOI DESPACHADO VIA MALOTE OU CORREIOS PARA OUTRA FILIAL.' },
  [OperationStatus.EXTRAVIADA]: { color: '#ff4444', glow: 'rgba(255, 68, 68, 0.4)', label: 'Extraviada', desc: 'ALERTA CRÍTICO: ATIVO PERDIDO, ROUBADO OU SEM COMUNICAÇÃO PROLONGADA.' },
  'DEFAULT': { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.1)', label: 'Indefinido', desc: 'AGUARDANDO ATUALIZAÇÃO DE STATUS OPERACIONAL.' }
};

const IscaLifeCycle: React.FC<IscaLifeCycleProps> = ({ entries, iscaControlEntries, activeUnit, onEditEntry, onAddExpress }) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIscaId, setNewIscaId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OperationStatus>(OperationStatus.ISCA_DISPONIVEL);

  const trackerData = useMemo(() => {
    const all = [...entries, ...iscaControlEntries];
    const trackers: Record<string, { id: string, history: LogisticsEntry[], lastStatus: OperationStatus }> = {};

    all.forEach(entry => {
      entry.numIsca.forEach(iscaId => {
        const id = iscaId.trim().toUpperCase();
        if (!id) return;
        
        const isOwner = entry.iscaPertencente.some(city => city && city.toUpperCase() === activeUnit.name.toUpperCase());
        const isInUnit = entry.destino && entry.destino.toUpperCase() === activeUnit.name.toUpperCase();
        const isManuallyInUnit = entry.unitId === activeUnit.id;

        if (isOwner || isInUnit || isManuallyInUnit) {
          if (!trackers[id]) {
            trackers[id] = { id, history: [], lastStatus: OperationStatus.ISCA_DISPONIVEL };
          }
          trackers[id].history.push(entry);
        }
      });
    });

    return Object.values(trackers).map(t => {
      const sortedHistory = t.history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return {
        ...t,
        history: sortedHistory,
        lastStatus: sortedHistory[0]?.status || OperationStatus.ISCA_DISPONIVEL,
        lastUpdate: sortedHistory[0]?.timestamp || new Date().toISOString()
      };
    }).filter(t => t.id.includes(search.toUpperCase()));
  }, [entries, iscaControlEntries, activeUnit, search]);

  const lastLocation = useMemo(() => {
    if (!newIscaId) return null;
    const all = [...entries, ...iscaControlEntries];
    const id = newIscaId.toUpperCase();
    const sorted = all.filter(e => e.numIsca.some(i => i.toUpperCase() === id))
                     .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return sorted[0] || null;
  }, [newIscaId, entries, iscaControlEntries]);

  const handleAddExpress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIscaId) return;

    onAddExpress({
      author: 'SISTEMA',
      responsavelPreAlerta: 'EXPRESSO',
      motorista: lastLocation?.motorista || 'NÃO INFORMADO',
      placaCavalo: lastLocation?.placaCavalo || 'XXXX-000',
      placaVeiculo: lastLocation?.placaVeiculo || [],
      numIsca: [newIscaId.toUpperCase()],
      numNF: lastLocation?.numNF || [],
      uma: lastLocation?.uma || [],
      codigoProduto: lastLocation?.codigoProduto || [],
      iscaPertencente: lastLocation?.iscaPertencente || [activeUnit.name as City],
      origem: activeUnit.name as City,
      destino: activeUnit.name as City,
      tipoVeiculo: lastLocation?.tipoVeiculo || VehicleType.BAU,
      status: selectedStatus,
      observacoes: `ATUALIZAÇÃO EXPRESSA INDIVIDUAL EM ${activeUnit.name}`,
      embarqueIsca: [LoadingPosition.NAO_INFORMADO],
      embarqueObservacoes: ['REGISTRO EXPRESSO'],
      unitId: activeUnit.id,
      dataOperacao: new Date().toISOString().split('T')[0],
      horaOperacao: new Date().toTimeString().slice(0, 5)
    });

    setNewIscaId('');
    setShowAddModal(false);
  };

  const stats = useMemo(() => {
    const total = trackerData.length;
    const count = (status: OperationStatus) => trackerData.filter(t => t.lastStatus === status).length;
    
    return {
      total,
      available: count(OperationStatus.ISCA_DISPONIVEL),
      inTransit: count(OperationStatus.ROTA_IDA) + count(OperationStatus.ROTA_VOLTA),
      atDestination: count(OperationStatus.NO_DESTINO),
      preparing: count(OperationStatus.PREPARACAO),
      lost: count(OperationStatus.EXTRAVIADA)
    };
  }, [trackerData]);

  return (
    <div className="space-y-10 p-2 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div 
          className="lg:col-span-2 bg-gradient-to-br from-[#1a1133] to-[#0d071a] rounded-[3.5rem] p-10 border border-[#7000ff]/20 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
          title="PAINEL DE TELEMETRIA GLOBAL"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#7000ff]/10 blur-[80px] rounded-full"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
               <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="#ffffff08" strokeWidth="8" fill="transparent" />
                  <circle cx="96" cy="96" r="88" stroke="#7000ff" strokeWidth="8" fill="transparent" strokeDasharray="552.92" strokeDashoffset={552.92 * (1 - (stats.total / (stats.total > 0 ? stats.total : 1)))} strokeLinecap="round" className="transition-all duration-1000 shadow-[0_0_15px_#7000ff]" />
               </svg>
               <div className="flex flex-col items-center">
                  <span className="text-5xl font-black text-white italic tracking-tighter">{stats.total}</span>
                  <span className="text-[10px] font-black uppercase text-[#7000ff] tracking-[0.2em] mt-1 text-center leading-none">Total<br/>Iscas</span>
               </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              {[
                { label: 'Prontas', val: stats.available, col: '#64ffda', desc: 'DISPONÍVEIS' },
                { label: 'Em Rota', val: stats.inTransit, col: '#3b82f6', desc: 'MOVIMENTAÇÃO' },
                { label: 'Carregando', val: stats.preparing, col: '#ff00ff', desc: 'MANUTENÇÃO' },
                { label: 'Perdidas', val: stats.lost, col: '#ff4444', desc: 'ALERTA' }
              ].map(st => (
                <div 
                  key={st.label} 
                  className="bg-black/40 p-5 rounded-3xl border border-white/5 hover:border-white/20 transition-all cursor-help"
                  title={st.desc}
                >
                  <span className="text-[9px] font-black uppercase text-white/30 tracking-widest block mb-1">{st.label}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{st.val}</span>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.col, boxShadow: `0 0 10px ${st.col}` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#1a1133]/60 rounded-[3.5rem] p-8 border border-white/5 flex flex-col justify-between gap-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-[#7000ff] uppercase tracking-[0.4em]">Filtragem Ativos</h4>
              <button 
                onClick={() => setShowAddModal(true)}
                className="w-10 h-10 bg-[#7000ff] text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_#7000ff44]"
              >
                <PlusIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="relative group">
              <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-[#7000ff] transition-colors" />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value.toUpperCase())}
                placeholder="ID DA ISCA..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-5 text-sm font-black text-white outline-none focus:border-[#7000ff] placeholder:text-white/5 transition-all"
              />
            </div>
          </div>
          <div className="pt-6 border-t border-white/5 flex items-center gap-4 cursor-default">
             <div className="w-12 h-12 bg-[#7000ff]/10 rounded-2xl flex items-center justify-center text-[#7000ff]">
                <AwardIcon className="w-6 h-6" />
             </div>
             <div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest block">Unidade: {activeUnit.name}</span>
                <span className="text-[8px] text-white/30 uppercase font-black">Ciclo de vida habilitado</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {trackerData.map((tracker) => {
          const theme = statusThemes[tracker.lastStatus] || statusThemes.DEFAULT;
          return (
            <div 
              key={tracker.id} 
              className="bg-[#0f0a1f] rounded-[2.5rem] border border-white/5 hover:border-[#7000ff]/40 transition-all duration-500 group relative overflow-hidden shadow-xl"
            >
              <div 
                className="absolute top-0 bottom-0 left-0 w-1.5 transition-colors duration-500" 
                style={{ backgroundColor: theme.color, boxShadow: `0 0 15px ${theme.glow}` }}
              ></div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black text-[#7000ff] uppercase tracking-[0.2em] block mb-1">Localizador</span>
                    <h3 className="text-3xl font-black italic tracking-tighter text-white">#{tracker.id}</h3>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Último Update</span>
                    <span className="text-[10px] font-bold text-white/60">{new Date(tracker.lastUpdate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div 
                  className="mb-8 p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between cursor-help"
                  title={theme.desc}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: theme.color, boxShadow: `0 0 10px ${theme.glow}` }}></div>
                    <span className="text-[10px] font-black uppercase text-white tracking-widest">{theme.label}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] block">Últimas Localizações</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {tracker.history.slice(0, 5).map((h, i) => (
                      <div key={h.id} className="shrink-0 flex items-center">
                        <div 
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-black hover:bg-[#7000ff]/20 cursor-help uppercase p-1 text-center transition-all"
                          title={`DESTINO: ${h.destino} | STATUS: ${h.status}`}
                        >
                          {h.destino.substring(0, 5)}
                        </div>
                        {i < tracker.history.length - 1 && <ChevronRightIcon className="w-3 h-3 text-white/10 mx-1" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Responsável</span>
                      <span className="text-[10px] font-black text-white uppercase truncate max-w-[120px]">{tracker.history[0]?.author || 'N/A'}</span>
                   </div>
                   <button 
                    onClick={() => onEditEntry(tracker.history[0])}
                    className="px-6 py-2.5 bg-white/5 text-white/40 rounded-xl text-[9px] font-black uppercase hover:bg-[#7000ff] hover:text-white transition-all border border-white/10 shadow-lg"
                   >
                    Atualizar Status
                   </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#03070a]/90 backdrop-blur-xl animate-in fade-in duration-300">
          <form 
            onSubmit={handleAddExpress}
            className="w-full max-w-lg bg-[#0f0a1f] p-10 rounded-[3rem] border border-[#7000ff]/30 relative shadow-[0_0_100px_#7000ff11]"
          >
            <button type="button" onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-black text-[#7000ff] uppercase tracking-[0.4em] mb-8">Novo Registro Individual</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-[#7000ff] uppercase tracking-widest mb-2 block ml-1 opacity-60">ID da Isca</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newIscaId}
                  onChange={e => setNewIscaId(e.target.value.toUpperCase())}
                  placeholder="DIGITE O NÚMERO DA ISCA..."
                  className="w-full bg-black/40 border border-[#7000ff]/20 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-[#7000ff] transition-all"
                />
              </div>

              {lastLocation && (
                <div className="bg-[#7000ff]/5 p-6 rounded-2xl border border-[#7000ff]/10 animate-in slide-in-from-top-4 cursor-default">
                  <span className="text-[8px] font-black text-[#7000ff]/40 uppercase tracking-widest block mb-2">Última Localização Detectada</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[8px] text-white/20 uppercase font-black block">Filial</span>
                      <span className="text-[10px] text-white font-black uppercase">{lastLocation.destino}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-white/20 uppercase font-black block">Último Status</span>
                      <span className="text-[10px] text-[#7000ff] font-black uppercase">{lastLocation.status}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative">
                <label className="text-[9px] font-black text-[#7000ff] uppercase tracking-widest mb-2 block ml-1 opacity-60">Novo Status</label>
                <select 
                  className="w-full bg-black/40 border border-[#7000ff]/20 rounded-2xl px-6 py-4 text-xs font-black text-white outline-none focus:border-[#7000ff] appearance-none cursor-pointer"
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value as OperationStatus)}
                >
                  <option value={OperationStatus.ROTA_IDA}>ROTA IDA</option>
                  <option value={OperationStatus.EXTRAVIADA}>EXTRAVIADA</option>
                  <option value={OperationStatus.ROTA_VOLTA}>ROTA VOLTA</option>
                  <option value={OperationStatus.ISCA_DISPONIVEL}>DISPONÍVEL</option>
                  <option value={OperationStatus.VIA_CORREIO}>VIA CORREIO</option>
                  <option value={OperationStatus.PREPARACAO}>PREPARAÇÃO</option>
                </select>
                <ChevronDownIcon className="absolute right-6 bottom-4 w-4 h-4 text-[#7000ff]/40 pointer-events-none" />
              </div>

              <button type="submit" className="w-full bg-[#7000ff] text-white font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-[10px] shadow-2xl">
                Efetuar Check-in Individual
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default IscaLifeCycle;

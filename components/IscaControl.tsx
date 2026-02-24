
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { LogisticsEntry, OperationStatus, UnitTab, City, LoadingPosition, VehicleType, CITIES } from '../types';
import { 
  PlusIcon, 
  SearchIcon, 
  KeyIcon, 
  DatabaseIcon, 
  ChevronDownIcon, 
  SparklesIcon,
  AlertIcon,
  XMarkIcon,
  EditIcon,
  TruckIcon,
  MapIcon
} from './icons';
import { CityDropdown } from './LogisticsForm';

interface IscaControlProps {
  onAdd: (entry: Omit<LogisticsEntry, 'id' | 'timestamp' | 'protocol'>) => void;
  onUpdateEntry: (id: string, updates: Partial<LogisticsEntry>) => void;
  onDeleteEntry: (id: string) => void;
  onEditEntry?: (entry: LogisticsEntry) => void;
  initialAuthor?: string;
  entries: LogisticsEntry[];
  iscaControlEntries: LogisticsEntry[];
  unitTabs: UnitTab[];
  onAddUnitTab: (unit: UnitTab) => void;
  currentUser: string;
  currentUserUnit: string;
}

const inputStyle = "w-full bg-black/40 border border-roasted-gold/20 rounded-xl px-5 py-4 text-sm focus:border-roasted-gold outline-none transition-all placeholder:text-white/10 text-white font-bold uppercase tracking-wider";
const labelStyle = "text-[10px] font-black text-roasted-gold uppercase tracking-[0.2em] mb-2 block ml-1 opacity-70";

const statusColors: Record<string, string> = {
  [OperationStatus.ISCA_DISPONIVEL]: 'bg-emerald-500',
  [OperationStatus.PREPARACAO]: 'bg-amber-500',
  [OperationStatus.ISCA_CONGELADA]: 'bg-blue-500',
  [OperationStatus.COM_DEFEITO]: 'bg-red-500',
  [OperationStatus.ROTA_IDA]: 'bg-indigo-500',
  [OperationStatus.ROTA_VOLTA]: 'bg-purple-500',
  [OperationStatus.EXTRAVIADA]: 'bg-rose-600',
  [OperationStatus.NO_DESTINO]: 'bg-cyan-500',
  [OperationStatus.VIA_CORREIO]: 'bg-slate-500',
};

const IscaControl: React.FC<IscaControlProps> = ({ 
  onAdd, 
  onUpdateEntry, 
  onDeleteEntry, 
  onEditEntry,
  initialAuthor,
  entries, 
  iscaControlEntries, 
  unitTabs, 
  onAddUnitTab, 
  currentUser,
  currentUserUnit
}) => {
  const [activeUnit, setActiveUnit] = useState<UnitTab | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState<UnitTab | null>(null);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState(false);
  const [showOnlyMyUnit, setShowOnlyMyUnit] = useState(false);
  
  // Edit State Completo
  const [activeSubTab, setActiveSubTab] = useState<'patrimonio' | 'disponiveis'>('patrimonio');
  const [editingItem, setEditingItem] = useState<{ 
    entryId: string, 
    iscaId: string, 
    protocol: string,
    date: string,
    motorista: string,
    placaCavalo: string,
    placaVeiculo: string,
    status: OperationStatus,
    destino: City,
    observacoes: string
  } | null>(null);

  // Form State para Nova Adição
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    iscaId: '',
    status: OperationStatus.ISCA_DISPONIVEL
  });

  const [searchTerm, setSearchTerm] = useState('');

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

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUnit || !formData.iscaId) return;

    const iscaId = formData.iscaId.trim().toUpperCase();
    const owner = activeUnit.name as City;

    // Validação de Duplicidade em Outras Filiais
    const allExisting = [...entries, ...iscaControlEntries];
    const conflict = allExisting.find(entry => {
      const idx = entry.numIsca.findIndex(id => id.toUpperCase() === iscaId);
      return idx !== -1 && entry.iscaPertencente[idx] !== owner;
    });

    if (conflict) {
      const conflictIdx = conflict.numIsca.findIndex(id => id.toUpperCase() === iscaId);
      const originalOwner = conflict.iscaPertencente[conflictIdx];
      alert(`ERRO: A ISCA #${iscaId} JÁ ESTÁ REGISTRADA NA UNIDADE ${originalOwner.toUpperCase()}. NÃO É PERMITIDO REGISTRAR EM DUAS FILIAIS DIFERENTES.`);
      return;
    }

    onAdd({
      author: currentUser,
      responsavelPreAlerta: 'REGISTRO MANUAL',
      motorista: 'N/A - CONTROLE DE ESTOQUE',
      placaCavalo: 'UNIDADE LOCAL',
      placaVeiculo: [],
      numIsca: [iscaId],
      numNF: [],
      uma: [],
      codigoProduto: [],
      iscaPertencente: [owner],
      origem: owner,
      destino: owner,
      tipoVeiculo: VehicleType.BAU,
      status: formData.status,
      iscaStatuses: [formData.status],
      observacoes: `LANÇAMENTO MANUAL DE ATIVO EM ${activeUnit.name}`,
      embarqueIsca: [LoadingPosition.NAO_INFORMADO],
      embarqueObservacoes: ['REGISTRO MANUAL'],
      unitId: activeUnit.id,
      dataOperacao: formData.date
    });

    setFormData(prev => ({ ...prev, iscaId: '', status: OperationStatus.ISCA_DISPONIVEL }));
    alert(`ATIVO #${iscaId} REGISTRADO COM SUCESSO.`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const placaVeiculoArray = editingItem.placaVeiculo
      .split('/')
      .map(p => p.trim().toUpperCase())
      .filter(p => p !== '');

    onUpdateEntry(editingItem.entryId, {
      protocol: parseInt(editingItem.protocol) || undefined,
      dataOperacao: editingItem.date,
      motorista: editingItem.motorista.toUpperCase(),
      placaCavalo: editingItem.placaCavalo.toUpperCase(),
      placaVeiculo: placaVeiculoArray,
      status: editingItem.status,
      destino: editingItem.destino,
      observacoes: editingItem.observacoes.toUpperCase()
    });

    setEditingItem(null);
    alert("REGISTRO ATUALIZADO COM SUCESSO.");
  };

  const myIscas = useMemo(() => {
    if (!activeUnit) return [];
    const unitName = activeUnit.name.toUpperCase();
    const all = [...entries, ...iscaControlEntries];

    const inventory: Record<string, any> = {};

    all.forEach(e => {
      e.numIsca.forEach((id, idx) => {
        const owner = e.iscaPertencente[idx]?.toUpperCase();
        const currentLocation = e.destino?.toUpperCase();
        
        const isOwner = owner === unitName;
        const isAtLocation = currentLocation === unitName;

        // Se estamos na aba de patrimônio, filtramos por dono
        // Se estamos na aba de disponíveis, filtramos por localização atual
        const shouldInclude = activeSubTab === 'patrimonio' ? isOwner : isAtLocation;

        if (shouldInclude) {
          const individualStatus = e.iscaStatuses?.[idx] || e.status;
          const currentIscaStatuses = e.iscaStatuses || e.numIsca.map(() => e.status);
          
          if (!inventory[id] || new Date(e.timestamp) > new Date(inventory[id].timestamp)) {
            inventory[id] = { 
              id, 
              status: individualStatus, 
              lastUpdate: e.timestamp, 
              dataOperacao: e.dataOperacao,
              entryId: e.id,
              iscaIndex: idx,
              allIscaStatuses: currentIscaStatuses,
              protocol: e.protocol,
              motorista: e.motorista,
              placaCavalo: e.placaCavalo,
              placaVeiculo: e.placaVeiculo,
              destino: e.destino,
              observacoes: e.observacoes,
              owner: e.iscaPertencente[idx]
            };
          }
        }
      });
    });

    return Object.values(inventory).filter(item => {
      const matchesSearch = item.id.includes(searchTerm.toUpperCase());
      const matchesUnitFilter = !showOnlyMyUnit || (item.owner?.toUpperCase() === currentUserUnit.toUpperCase());
      return matchesSearch && matchesUnitFilter;
    }).sort((a, b) => b.id.localeCompare(a.id));
  }, [entries, iscaControlEntries, activeUnit, searchTerm, activeSubTab, showOnlyMyUnit, currentUserUnit]);

  const statusStats = useMemo(() => {
    const stats: Record<string, number> = {
      [OperationStatus.ISCA_DISPONIVEL]: 0,
      [OperationStatus.PREPARACAO]: 0,
      [OperationStatus.ISCA_CONGELADA]: 0,
      [OperationStatus.COM_DEFEITO]: 0,
      [OperationStatus.ROTA_IDA]: 0,
      [OperationStatus.ROTA_VOLTA]: 0,
      [OperationStatus.EXTRAVIADA]: 0,
      [OperationStatus.NO_DESTINO]: 0,
      [OperationStatus.VIA_CORREIO]: 0,
    };
    
    myIscas.forEach(item => {
      if (item.status && stats[item.status] !== undefined) {
        stats[item.status]++;
      }
    });
    
    return stats;
  }, [myIscas]);

  const totalIscas = myIscas.length;

  if (!activeUnit) {
    return (
      <div className="space-y-12 animate-in fade-in duration-700">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
          <div className="w-24 h-24 bg-roasted-gold/10 rounded-full flex items-center justify-center border border-roasted-gold/20 shadow-2xl relative">
            <SparklesIcon className="w-12 h-12 text-roasted-gold" />
          </div>
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Inventário de Ativos</h2>
            <p className="text-[10px] text-roasted-gold/50 font-black uppercase tracking-[0.5em] mt-3">Gestão de Iscas Próprias por Terminal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {unitTabs.map(unit => (
            <div 
              key={unit.id} 
              onClick={() => setShowUnlockModal(unit)} 
              className="coffee-panel p-10 cursor-pointer transition-all group relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]"
            >
              <div className="absolute top-6 right-6"><KeyIcon className="w-5 h-5 text-roasted-gold/20" /></div>
              <DatabaseIcon className="w-12 h-12 text-white/10 mb-6 group-hover:text-roasted-gold transition-all" />
              <h3 className="text-base font-black text-white uppercase tracking-widest text-center leading-tight">{unit.name}</h3>
              <p className="text-[9px] text-roasted-gold/40 uppercase font-black mt-2">Clique para Gerenciar</p>
            </div>
          ))}
        </div>

        {showUnlockModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
            <form onSubmit={handleUnlock} className={`w-full max-w-sm coffee-panel p-12 rounded-[3rem] flex flex-col items-center border ${unlockError ? 'border-red-500 animate-shake' : 'border-roasted-gold/20'}`}>
              <KeyIcon className="w-12 h-12 text-roasted-gold mb-8" />
              <h2 className="text-xl font-black text-white uppercase tracking-widest mb-1 text-center">{showUnlockModal.name}</h2>
              <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-10">Acesso Restrito ao Terminal</p>
              <input autoFocus required type="password" className={`${inputStyle} text-center tracking-[0.5em] mb-6`} value={unlockPassword} onChange={(e) => setUnlockPassword(e.target.value)} placeholder="••••••••" />
              <div className="flex gap-4 w-full">
                <button type="button" onClick={() => {setShowUnlockModal(null); setUnlockPassword('');}} className="flex-1 py-4 bg-white/5 text-white/30 rounded-xl font-black uppercase text-[10px]">Voltar</button>
                <button type="submit" className="flex-[2] coffee-button py-4 text-[10px]">Entrar no Painel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center bg-black/20 p-6 rounded-[2rem] border border-white/5 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-roasted-gold text-espresso-dark rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
            {activeUnit.name.substring(0, 2)}
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest">{activeUnit.name}</h3>
            <span className="text-[9px] text-roasted-gold/60 font-black uppercase tracking-[0.4em]">Painel de Controle</span>
          </div>
        </div>
        <button onClick={() => setActiveUnit(null)} className="px-6 py-3 bg-white/5 text-white/40 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Sair do Terminal</button>
      </div>

      <div className="bg-black/20 p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <PlusIcon className="w-5 h-5 text-roasted-gold" />
          <h4 className="text-sm font-black text-white uppercase tracking-widest">Novo Ativo</h4>
        </div>
        
        <form onSubmit={handleManualAdd} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div>
            <label className={labelStyle}>Data</label>
            <input required type="date" className={`${inputStyle} py-3`} value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div>
            <label className={labelStyle}>ID da Isca</label>
            <input required type="text" placeholder="R1000..." className={`${inputStyle} py-3`} value={formData.iscaId} onChange={e => setFormData(p => ({ ...p, iscaId: e.target.value.toUpperCase() }))} />
          </div>
          <div>
            <label className={labelStyle}>Estado Inicial</label>
            <select 
              required 
              className={`${inputStyle} py-3`} 
              value={formData.status} 
              onChange={e => setFormData(p => ({ ...p, status: e.target.value as OperationStatus }))}
            >
              <option value={OperationStatus.ISCA_DISPONIVEL}>DISPONÍVEL</option>
              <option value={OperationStatus.PREPARACAO}>PREPARAÇÃO</option>
              <option value={OperationStatus.ISCA_CONGELADA}>ISCA CONGELADA</option>
              <option value={OperationStatus.COM_DEFEITO}>COM DEFEITO</option>
            </select>
          </div>
          <button type="submit" className="coffee-button py-3.5 text-[10px] shadow-none">Registrar</button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4 px-4">
          {Object.entries(statusStats).map(([status, count]) => {
            if (count === 0 && totalIscas > 0) return null;
            const percentage = totalIscas > 0 ? (count / totalIscas) * 100 : 0;
            return (
              <div key={status} className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col gap-1 hover:border-roasted-gold/20 transition-all group">
                <span className="text-[7px] font-black text-roasted-gold/60 uppercase tracking-widest truncate group-hover:text-roasted-gold transition-colors">
                  {status.replace('ISCA ', '')}
                </span>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-black text-white">{count}</span>
                  <span className="text-[8px] text-white/20 mb-1">{percentage.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                  <div 
                    className={`h-full ${statusColors[status] || 'bg-roasted-gold'} transition-all duration-1000`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center px-4 gap-6">
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveSubTab('patrimonio')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'patrimonio' ? 'bg-roasted-gold text-espresso-dark shadow-lg' : 'text-white/30 hover:text-white'}`}
            >
              Meu Patrimônio
            </button>
            <button 
              onClick={() => setActiveSubTab('disponiveis')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'disponiveis' ? 'bg-roasted-gold text-espresso-dark shadow-lg' : 'text-white/30 hover:text-white'}`}
            >
              Iscas Disponíveis
            </button>
          </div>
          
          <div className="flex justify-between items-center flex-1 w-full md:w-auto gap-4">
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
              <input 
                type="checkbox" 
                id="myUnitFilter"
                checked={showOnlyMyUnit}
                onChange={(e) => setShowOnlyMyUnit(e.target.checked)}
                className="w-4 h-4 accent-roasted-gold cursor-pointer"
              />
              <label htmlFor="myUnitFilter" className="text-[9px] font-black text-white/60 uppercase tracking-widest cursor-pointer select-none">
                Apenas Minha Unidade ({currentUserUnit})
              </label>
            </div>
            <h4 className="text-xs font-black text-roasted-gold/60 uppercase tracking-[0.5em] hidden lg:block">{activeSubTab === 'patrimonio' ? 'Inventário Patrimonial' : 'Iscas no Local'} • {myIscas.length} Itens</h4>
            <div className="relative w-72">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text" 
                placeholder="BUSCAR POR ID..." 
                className="w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-[10px] font-black text-white outline-none focus:border-roasted-gold/40 uppercase"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="coffee-panel rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[9px] font-black text-roasted-gold/50 uppercase tracking-[0.2em]">
                <th className="px-10 py-6">ID / Proprietário</th>
                <th className="px-10 py-6">Data de Operação</th>
                <th className="px-10 py-6">Status / Local</th>
                <th className="px-10 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {myIscas.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-black text-white font-mono tracking-widest">#{item.id}</span>
                      <span className="text-[8px] font-black text-roasted-gold/60 uppercase tracking-tighter">Dono: {item.owner || '-----'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">{item.dataOperacao || 'S/ DATA'}</span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${statusColors[item.status] || 'bg-roasted-gold'} shadow-[0_0_10px_rgba(192,149,92,0.3)] animate-pulse`}></div>
                         <select 
                           value={item.status}
                           onChange={(e) => {
                             const newStatus = e.target.value as OperationStatus;
                             const newStatuses = [...item.allIscaStatuses];
                             newStatuses[item.iscaIndex] = newStatus;
                             onUpdateEntry(item.entryId, { iscaStatuses: newStatuses });
                           }}
                           className="bg-[#0a192f] text-roasted-gold border border-roasted-gold/30 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase outline-none focus:border-roasted-gold transition-all flex-1 min-w-[160px] cursor-pointer hover:bg-black/40"
                         >
                           <option value={OperationStatus.ISCA_DISPONIVEL}>DISPONÍVEL</option>
                           <option value={OperationStatus.PREPARACAO}>PREPARAÇÃO</option>
                           <option value={OperationStatus.ISCA_CONGELADA}>ISCA CONGELADA</option>
                           <option value={OperationStatus.COM_DEFEITO}>COM DEFEITO</option>
                           <option value={OperationStatus.ROTA_IDA}>ROTA IDA</option>
                           <option value={OperationStatus.ROTA_VOLTA}>ROTA VOLTA</option>
                           <option value={OperationStatus.EXTRAVIADA}>EXTRAVIADA</option>
                           <option value={OperationStatus.NO_DESTINO}>RESGATADA</option>
                         </select>
                       </div>
                       <div className="flex items-center gap-1.5 px-1">
                         <MapIcon className="w-3 h-3 text-white/20" />
                         <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">{item.destino}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setEditingItem({ 
                          entryId: item.entryId, 
                          iscaId: item.id, 
                          protocol: item.protocol?.toString() || '',
                          date: item.dataOperacao || '',
                          motorista: item.motorista || '',
                          placaCavalo: item.placaCavalo || '',
                          placaVeiculo: item.placaVeiculo?.join(' / ') || '',
                          status: item.status as OperationStatus,
                          destino: item.destino as City,
                          observacoes: item.observacoes || ''
                        })}
                        className="px-4 py-2 bg-white/5 hover:bg-roasted-gold hover:text-black rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-white/10"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.entryId) {
                            onDeleteEntry(item.entryId);
                          } else {
                            alert('ERRO: ID DO REGISTRO NÃO ENCONTRADO.');
                          }
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-red-500/20 shadow-lg shadow-red-900/20"
                      >
                        Apagar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
           <form onSubmit={handleSaveEdit} className="w-full max-w-2xl coffee-panel p-10 md:p-12 rounded-[3.5rem] border border-roasted-gold/40 relative shadow-[0_0_100px_rgba(192,149,92,0.15)] my-10 overflow-visible">
              <button type="button" onClick={() => setEditingItem(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                <XMarkIcon className="w-8 h-8" />
              </button>
              
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-roasted-gold/10 rounded-2xl flex items-center justify-center text-roasted-gold mx-auto mb-6">
                  <EditIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-widest">Painel Técnico de Ajuste</h3>
                {/* PROTOCOLO EM DESTAQUE NO TOPO DO MODAL */}
                <div className="mt-3 flex justify-center">
                  <div className="bg-black/60 px-6 py-2 rounded-xl border border-roasted-gold/40 shadow-inner">
                    <span className="text-xs font-black text-roasted-gold tracking-[0.3em] font-mono">PROTOCOLO #P{editingItem.protocol.padStart(5, '0')}</span>
                  </div>
                </div>
                <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-4">Sincronizando Ativo #{editingItem.iscaId}</p>
              </div>

              <div className="space-y-6 overflow-visible">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelStyle}>Nº Protocolo (P-ID)</label>
                        <input type="text" className={inputStyle} value={editingItem.protocol} onChange={e => setEditingItem({ ...editingItem, protocol: e.target.value })} placeholder="00000" />
                    </div>
                    <div>
                        <label className={labelStyle}>Data Operacional</label>
                        <input required type="date" className={inputStyle} value={editingItem.date} onChange={e => setEditingItem({ ...editingItem, date: e.target.value })} />
                    </div>
                 </div>

                 <div>
                    <label className={labelStyle}>Motorista / Condutor</label>
                    <input type="text" className={inputStyle} value={editingItem.motorista} onChange={e => setEditingItem({ ...editingItem, motorista: e.target.value.toUpperCase() })} placeholder="IDENTIFICAÇÃO" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <label className={labelStyle}>Placa Cavalo</label>
                        <div className="absolute left-4 bottom-4 text-roasted-gold/20"><TruckIcon className="w-4 h-4" /></div>
                        <input type="text" className={`${inputStyle} pl-12`} value={editingItem.placaCavalo} onChange={e => setEditingItem({ ...editingItem, placaCavalo: e.target.value.toUpperCase() })} placeholder="AAA-0000" />
                    </div>
                    <div className="relative">
                        <label className={labelStyle}>Placa Baú / Carreta</label>
                        <input type="text" className={inputStyle} value={editingItem.placaVeiculo} onChange={e => setEditingItem({ ...editingItem, placaVeiculo: e.target.value.toUpperCase() })} placeholder="PLACA1 / PLACA2" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelStyle}>Status Atual</label>
                      <select 
                        className={inputStyle} 
                        value={editingItem.status} 
                        onChange={e => setEditingItem({ ...editingItem, status: e.target.value as OperationStatus })}
                      >
                        <option value={OperationStatus.ISCA_DISPONIVEL}>DISPONÍVEL</option>
                        <option value={OperationStatus.PREPARACAO}>PREPARAÇÃO</option>
                        <option value={OperationStatus.ISCA_CONGELADA}>ISCA CONGELADA</option>
                        <option value={OperationStatus.COM_DEFEITO}>COM DEFEITO</option>
                        <option value={OperationStatus.ROTA_IDA}>ROTA IDA</option>
                        <option value={OperationStatus.ROTA_VOLTA}>ROTA VOLTA</option>
                        <option value={OperationStatus.EXTRAVIADA}>EXTRAVIADA</option>
                        <option value={OperationStatus.NO_DESTINO}>RESGATADA</option>
                      </select>
                    </div>
                    <div className="overflow-visible">
                      <CityDropdown 
                        label="Local Atual da Isca (Filial)"
                        value={editingItem.destino}
                        placeholder="SELECIONE A UNIDADE..."
                        onChange={v => setEditingItem({ ...editingItem, destino: v })}
                      />
                    </div>
                 </div>

                 <div>
                    <label className={labelStyle}>Relato de Ajuste / Observações</label>
                    <textarea 
                      className={`${inputStyle} h-24 resize-none`} 
                      value={editingItem.observacoes} 
                      onChange={e => setEditingItem({ ...editingItem, observacoes: e.target.value.toUpperCase() })} 
                      placeholder="MOTIVO DA EDIÇÃO..."
                    />
                 </div>

                 <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-5 bg-white/5 text-white/40 rounded-2xl font-black uppercase text-[10px]">Cancelar</button>
                    <button type="submit" className="flex-[2] coffee-button py-5 text-[10px]">Confirmar Alterações</button>
                 </div>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default IscaControl;

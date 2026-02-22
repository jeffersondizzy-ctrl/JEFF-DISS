
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useState, useEffect } from 'react';
import { LogisticsEntry, City, UnitTab, OperationStatus, Recado } from '../types';
import RecadosModule from './RecadosModule';
import { 
  AlertIcon, 
  MailIcon, 
  ChevronRightIcon, 
  SparklesIcon, 
  SearchIcon,
  KeyIcon,
  DatabaseIcon,
  XMarkIcon,
  PlusIcon,
  LockIcon,
  AwardIcon,
  TrashIcon,
  MessageSquareIcon,
  ArrowRightIcon
} from './icons';
import { CityDropdown } from './LogisticsForm';

interface IscaBillingProps {
  entries: LogisticsEntry[];
  iscaControlEntries: LogisticsEntry[];
  unitTabs: UnitTab[];
  onAddUnitTab: (unit: UnitTab) => void;
  onAddNotification: (unit: string, text: string, type: 'info' | 'alert' | 'success') => void;
  onSendRecado: (recado: Omit<Recado, 'id' | 'timestamp' | 'status'>) => void;
  onSendResponse: (recadoId: string, response: string) => void;
  onUpdateEntry: (id: string, updates: Partial<LogisticsEntry>) => void;
  recados: Recado[];
  currentUser: string;
  currentUserUnit: string;
  onBackToMenu: () => void;
}

const inputStyle = "w-full bg-black/40 border border-red-500/20 rounded-xl px-5 py-4 text-sm focus:border-red-500 outline-none transition-all placeholder:text-white/10 text-white font-bold uppercase tracking-wider";
const labelStyle = "text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-2 block ml-1 opacity-70";

const IscaBilling: React.FC<IscaBillingProps> = ({ 
  entries, 
  iscaControlEntries,
  unitTabs, 
  onAddUnitTab, 
  onAddNotification, 
  onSendRecado,
  onSendResponse,
  onUpdateEntry,
  recados,
  currentUser,
  currentUserUnit,
  onBackToMenu
}) => {
  const [activeUnit, setActiveUnit] = useState<UnitTab | null>(null);
  const [activeTab, setActiveTab] = useState<'billing' | 'recados'>('billing');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState<UnitTab | null>(null);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitPass, setNewUnitPass] = useState('');
  const [unlockError, setUnlockError] = useState(false);

  // Filtragem de Ativos por Dono
  const billingData = useMemo(() => {
    if (!activeUnit) return { lost: [], held: [] };
    const unitName = activeUnit.name.toUpperCase();
    
    const lost: any[] = [];
    const held: any[] = [];

    entries.forEach(entry => {
      entry.numIsca.forEach((iscaId, idx) => {
        const owner = entry.iscaPertencente[idx]?.toUpperCase();
        const individualStatus = entry.iscaStatuses?.[idx] || entry.status;
        
        if (owner === unitName) {
          // Se a isca é minha e está extraviada
          if (individualStatus === OperationStatus.EXTRAVIADA) {
            lost.push({ iscaId, entry });
          }
          // Se a isca é minha e está em posse de outro destino
          else if (individualStatus === OperationStatus.NO_DESTINO && entry.destino?.toUpperCase() !== unitName) {
            held.push({ iscaId, entry });
          }
        }
      });
    });

    return { lost, held };
  }, [entries, activeUnit]);

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName || !newUnitPass) return;
    
    if (unitTabs.find(u => u.name === newUnitName)) {
      alert("ESTA FILIAL JÁ POSSUI UM TERMINAL ATIVO.");
      return;
    }

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

  const handleNotifyDebt = (item: any, type: 'LOST' | 'HELD') => {
    const targetUnit = item.entry.destino;
    const subject = type === 'LOST' ? 'COBRANÇA DE EXTRAVIO' : 'SOLICITAÇÃO DE RETORNO';
    const msg = type === 'LOST' 
      ? `ALERTA DE DÉBITO: Sua unidade é responsável pelo EXTRAVIO da isca #${item.iscaId} pertencente a ${activeUnit?.name}. Favor registrar boletim.`
      : `ALERTA DE POSSE: Identificamos que a isca #${item.iscaId} pertencente a ${activeUnit?.name} está retida em seu pátio. Favor providenciar retorno imediato.`;
    
    onAddNotification(targetUnit, msg, 'alert');
    
    onSendRecado({
      fromUnit: activeUnit?.name || '',
      toUnit: targetUnit,
      author: currentUser,
      subject,
      text: msg,
      type: type === 'LOST' ? 'cobranca' : 'retorno',
      relatedProtocol: item.entry.protocol
    });

    alert(`COBRANÇA FORMALIZADA E ENVIADA PARA ${targetUnit.toUpperCase()}`);
  };

  const handlePostReturnChange = (item: any) => {
    if (!activeUnit) return;
    
    // Update the status of the isca to "ISCA DISPONIVEL" and set location to owner
    const entry = item.entry;
    const iscaIdx = entry.numIsca.indexOf(item.iscaId);
    
    if (iscaIdx !== -1) {
      const newStatuses = [...(entry.iscaStatuses || entry.numIsca.map(() => entry.status))];
      newStatuses[iscaIdx] = OperationStatus.ISCA_DISPONIVEL;
      
      onUpdateEntry(entry.id, {
        iscaStatuses: newStatuses,
        destino: activeUnit.name as City // Return to owner
      });

      alert(`ATIVO #${item.iscaId} REINTEGRADO AO ESTOQUE DE ${activeUnit.name}.`);
    }
  };

  if (!activeUnit) {
    return (
      <div className="space-y-12 animate-in fade-in duration-700 bg-red-950/5 p-12 rounded-[4rem] border border-red-500/10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-2xl relative">
            <div className="absolute inset-0 bg-red-500/10 animate-ping rounded-full opacity-20"></div>
            <AlertIcon className="w-12 h-12 text-red-500" />
          </div>
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Terminal de Cobranças</h2>
            <p className="text-[10px] text-red-500/50 font-black uppercase tracking-[0.5em] mt-3">Acesso restrito ao proprietário dos ativos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div 
            onClick={() => setShowCreateModal(true)}
            className="p-10 rounded-[3rem] border-2 border-dashed border-red-500/20 hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/10 cursor-pointer transition-all group flex flex-col items-center justify-center min-h-[220px] shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <PlusIcon className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Ativar Unidade</h3>
          </div>

          {unitTabs.map(unit => (
            <div 
              key={unit.id}
              onClick={() => setShowUnlockModal(unit)}
              className="coffee-panel p-10 cursor-pointer transition-all group relative overflow-hidden flex flex-col items-center justify-center min-h-[220px] border-red-500/10 hover:border-red-500/40 shadow-red-500/5"
            >
              <div className="absolute top-6 right-6">
                <LockIcon className="w-5 h-5 text-red-500/20" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-red-500/20 mb-6 group-hover:bg-red-500/10 group-hover:text-red-500 transition-all">
                <DatabaseIcon className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-widest text-center">{unit.name}</h3>
            </div>
          ))}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <form onSubmit={handleCreateUnit} className="w-full max-w-md coffee-panel p-12 rounded-[3rem] border border-red-500/20 relative">
              <button type="button" onClick={() => setShowCreateModal(false)} className="absolute top-8 right-8 text-white/20 hover:text-white"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-xl font-black text-red-500 uppercase tracking-[0.3em] mb-10 text-center">Registrar Auditoria</h2>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className={labelStyle}>Filial Proprietária</label>
                  <CityDropdown label="" value={newUnitName} placeholder="FILIAL..." onChange={v => setNewUnitName(v)} />
                </div>
                <div className="space-y-2">
                  <label className={labelStyle}>Senha de Acesso</label>
                  <input required type="password" className={inputStyle} value={newUnitPass} onChange={e => setNewUnitPass(e.target.value)} placeholder="••••••••" />
                </div>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest">Abrir Canal de Auditoria</button>
              </div>
            </form>
          </div>
        )}

        {showUnlockModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
            <form onSubmit={handleUnlock} className={`w-full max-w-sm coffee-panel p-12 rounded-[3rem] flex flex-col items-center border ${unlockError ? 'border-red-500 animate-shake' : 'border-red-500/20'}`}>
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-8"><KeyIcon className="w-10 h-10" /></div>
              <h2 className="text-lg font-black text-white uppercase tracking-widest mb-1">{showUnlockModal.name}</h2>
              <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-10 text-center">Autenticação para Cobrança</p>
              <div className="w-full space-y-6">
                <input autoFocus required type="password" className={`${inputStyle} text-center tracking-[0.5em]`} value={unlockPassword} onChange={(e) => setUnlockPassword(e.target.value)} placeholder="••••••••" />
                {unlockError && <p className="text-[10px] text-red-500 font-black uppercase text-center">Chave Inválida</p>}
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => {setShowUnlockModal(null); setUnlockPassword('');}} className="flex-1 py-4 bg-white/5 text-white/30 rounded-xl font-black uppercase text-[10px]">Cancelar</button>
                  <button type="submit" className="flex-[2] bg-red-600 text-white py-4 rounded-xl text-[10px] font-black uppercase">Desbloquear</button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 bg-black min-h-screen p-12 rounded-[4rem] relative overflow-hidden border border-red-500/20">
      {/* Background industrial scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(239,68,68,0.1)_1px,transparent_1px)] bg-[size:100%_4px] animate-pulse"></div>
      
      {/* Header Alarme */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-red-950/20 p-10 rounded-[3rem] border border-red-500/20 gap-8 relative z-10">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 bg-red-600 text-white rounded-[2rem] flex items-center justify-center font-black text-2xl shadow-[0_0_40px_rgba(220,38,38,0.4)] animate-pulse">
            {activeUnit.name.substring(0, 2)}
          </div>
          <div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Auditoria de Ativos: {activeUnit.name}</h3>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
              <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em]">Monitoramento de Débitos Patrimoniais Ativo</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveTab('billing')} 
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'billing' ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              <AlertIcon className="w-4 h-4" /> Cobranças
            </button>
            <button 
              onClick={() => setActiveTab('recados')} 
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'recados' ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              <MessageSquareIcon className="w-4 h-4" /> Caixa de Recados
            </button>
          </div>
          <button onClick={() => setActiveUnit(null)} className="px-8 py-4 bg-white/5 text-white/40 hover:bg-red-600 hover:text-white rounded-2xl text-[10px] font-black uppercase transition-all border border-white/10">Trocar de Terminal</button>
        </div>
      </div>

      {activeTab === 'billing' ? (
        <>
          {/* Gráfico de Radar de Débito Central */}
          <div className="relative flex justify-center py-20">
             <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <div className="w-[500px] h-[500px] border border-red-500/30 rounded-full animate-ping"></div>
                <div className="absolute w-[400px] h-[400px] border border-red-500/20 rounded-full"></div>
                <div className="absolute w-[300px] h-[300px] border border-red-500/10 rounded-full"></div>
             </div>
             
             <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-20 items-center max-w-5xl w-full">
                {/* Esquerda: Extravios */}
                <div className="bg-red-950/40 p-12 rounded-[4rem] border-2 border-red-500/30 shadow-[0_0_60px_rgba(239,68,68,0.1)] relative">
                   <div className="absolute -top-6 left-12 px-6 py-2 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-full shadow-lg">Extravios Críticos</div>
                   <div className="flex flex-col items-center text-center">
                      <span className="text-8xl font-black text-white italic tracking-tighter">{billingData.lost.length}</span>
                      <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] mt-4">Ativos Perdidos por Terceiros</p>
                      <p className="text-[9px] text-white/30 uppercase mt-2 max-w-[200px]">Iscas declaradas como extraviadas sob custódia de outras unidades.</p>
                   </div>
                </div>

                {/* Direita: Retenção */}
                <div className="bg-amber-950/40 p-12 rounded-[4rem] border-2 border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.1)] relative">
                   <div className="absolute -top-6 left-12 px-6 py-2 bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest rounded-full shadow-lg">Retenção de Ativos</div>
                   <div className="flex flex-col items-center text-center">
                      <span className="text-8xl font-black text-white italic tracking-tighter">{billingData.held.length}</span>
                      <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.4em] mt-4">Ativos Retidos em Filiais</p>
                      <p className="text-[9px] text-white/30 uppercase mt-2 max-w-[200px]">Iscas fisicamente no destino que aguardam retorno à base.</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Listagem de Cobrança - Estilo Monitor de Comando */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
            
            {/* Painel Extravios */}
            <div className="space-y-6">
               <h4 className="text-sm font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-3 ml-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  Relatório de Perdas Patrimoniais
               </h4>
               <div className="space-y-4">
                  {billingData.lost.map((item, i) => (
                    <div key={i} className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2.5rem] hover:bg-red-500/10 transition-all group">
                       <div className="flex justify-between items-start mb-6">
                          <div>
                             <span className="text-[8px] font-black text-white/40 uppercase block mb-1">ID do Ativo</span>
                             <span className="text-2xl font-black text-red-500 tracking-widest">#{item.iscaId}</span>
                          </div>
                          <button 
                            onClick={() => handleNotifyDebt(item, 'LOST')}
                            className="px-6 py-3 bg-red-600 text-white text-[9px] font-black uppercase rounded-xl hover:scale-105 transition-all shadow-lg shadow-red-600/20"
                          >
                            Cobrar Unidade
                          </button>
                       </div>
                       <div className="grid grid-cols-2 gap-4 pt-4 border-t border-red-500/10">
                          <div>
                             <span className="text-[8px] font-black text-white/30 uppercase block">Unidade Responsável</span>
                             <span className="text-xs font-black text-white uppercase">{item.entry.destino}</span>
                          </div>
                          <div>
                             <span className="text-[8px] font-black text-white/30 uppercase block">Data Extravio</span>
                             <span className="text-xs font-black text-white">{new Date(item.entry.timestamp).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                  ))}
                  {billingData.lost.length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
                       <p className="text-[10px] font-black uppercase tracking-[0.5em]">Sem perdas detectadas</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Painel Retenção */}
            <div className="space-y-6">
               <h4 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-3 ml-4">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                  Relatório de Retenção Indevida
               </h4>
               <div className="space-y-4">
                  {billingData.held.map((item, i) => (
                    <div key={i} className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-[2.5rem] hover:bg-amber-500/10 transition-all">
                       <div className="flex justify-between items-start mb-6">
                          <div>
                             <span className="text-[8px] font-black text-white/40 uppercase block mb-1">ID do Ativo</span>
                             <span className="text-2xl font-black text-amber-500 tracking-widest">#{item.iscaId}</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleNotifyDebt(item, 'HELD')}
                              className="px-6 py-3 bg-amber-600 text-white text-[9px] font-black uppercase rounded-xl hover:scale-105 transition-all shadow-lg shadow-amber-600/20"
                            >
                              Solicitar Retorno
                            </button>
                            <button 
                              onClick={() => handlePostReturnChange(item)}
                              className="px-6 py-3 bg-white/10 text-white text-[9px] font-black uppercase rounded-xl hover:bg-white/20 transition-all border border-white/10"
                            >
                              Mudança Pós Retorno
                            </button>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-500/10">
                          <div>
                             <span className="text-[8px] font-black text-white/30 uppercase block">Unidade Custodiante</span>
                             <span className="text-xs font-black text-white uppercase">{item.entry.destino}</span>
                          </div>
                          <div>
                             <span className="text-[8px] font-black text-white/30 uppercase block">Em Posse desde</span>
                             <span className="text-xs font-black text-white">{new Date(item.entry.timestamp).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                  ))}
                  {billingData.held.length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
                       <p className="text-[10px] font-black uppercase tracking-[0.5em]">Fluxo de ativos regularizado</p>
                    </div>
                  )}
               </div>
            </div>

          </div>
        </>
      ) : (
        <div className="relative z-10">
          <RecadosModule 
            recados={recados}
            currentUser={currentUser}
            currentUserUnit={currentUserUnit}
            onSendResponse={onSendResponse}
            onSendRecado={onSendRecado}
            unitTabs={unitTabs}
            onBackToMenu={onBackToMenu}
          />
        </div>
      )}

      {/* Footer Alarme */}
      <div className="mt-12 p-8 bg-red-600 text-white rounded-3xl flex items-center justify-center gap-6 relative z-10 animate-pulse">
         <AlertIcon className="w-8 h-8" />
         <span className="text-xs font-black uppercase tracking-[0.4em] text-center">Atenção: Iscas retidas por mais de 15 DIAS devem ser notificadas.</span>
      </div>
    </div>
  );
};

export default IscaBilling;

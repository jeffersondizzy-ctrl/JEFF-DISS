
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { LogisticsEntry, OperationStatus, UnitTab, City } from '../types';
import { 
  PlusIcon, 
  KeyIcon, 
  XMarkIcon, 
  DatabaseIcon, 
  SlidersHorizontalIcon,
  ChevronDownIcon
} from './icons';
import { CityDropdown } from './LogisticsForm';

interface DashboardStatsProps {
  entries: LogisticsEntry[];
  unitTabs: UnitTab[];
  onAddUnitTab: (unit: UnitTab) => void;
}

const inputStyle = "w-full bg-black/40 border border-roasted-gold/20 rounded-xl px-5 py-4 text-sm focus:border-roasted-gold outline-none transition-all placeholder:text-white/10 text-white font-bold uppercase tracking-wider";
const labelStyle = "text-[10px] font-black text-roasted-gold uppercase tracking-[0.2em] mb-2 block ml-1 opacity-70";

const DashboardStats: React.FC<DashboardStatsProps> = ({ entries, unitTabs, onAddUnitTab }) => {
  const [activeUnit, setActiveUnit] = useState<UnitTab | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState<UnitTab | null>(null);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitPass, setNewUnitPass] = useState('');
  const [unlockError, setUnlockError] = useState(false);

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

  const unitEntries = useMemo(() => {
    if (!activeUnit) return [];
    const unitName = activeUnit.name.toUpperCase();
    return entries.filter(e => 
      e.origem?.toUpperCase() === unitName || 
      e.destino?.toUpperCase() === unitName || 
      e.iscaPertencente?.some(city => city?.toUpperCase() === unitName)
    );
  }, [entries, activeUnit]);

  const stats = useMemo(() => {
    const total = unitEntries.length || 1;
    const available = unitEntries.filter(e => e.status === OperationStatus.ISCA_DISPONIVEL).length;
    const preparing = unitEntries.filter(e => e.status === OperationStatus.PREPARACAO).length;
    const alerts = unitEntries.filter(e => e.status === OperationStatus.EXTRAVIADA).length;
    const inTransit = unitEntries.filter(e => e.status === OperationStatus.ROTA_IDA || e.status === OperationStatus.ROTA_VOLTA).length;

    return {
      total,
      available,
      preparing,
      alerts,
      inTransit,
      getPercent: (val: number) => (val / total) * 100
    };
  }, [unitEntries]);

  const StatCard = ({ label, value, color, status, percent }: any) => (
    <div className="coffee-panel p-8 rounded-[2.5rem] border-l-8 border-current transition-all hover:scale-105" style={{ color: color }}>
      <span className="text-[10px] font-black uppercase tracking-widest block mb-2 opacity-50 text-white">
        {label}
      </span>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-5xl font-black text-white">{value}</span>
        <span className="text-[10px] font-bold uppercase opacity-60">{status}</span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-current transition-all duration-1000" 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );

  if (!activeUnit) {
    return (
      <div className="space-y-12 animate-in fade-in duration-700">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
          <div className="w-24 h-24 bg-roasted-gold/10 rounded-full flex items-center justify-center border border-roasted-gold/20 shadow-2xl">
            <SlidersHorizontalIcon className="w-12 h-12 text-roasted-gold" />
          </div>
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Estatísticas Operacionais</h2>
            <p className="text-[10px] text-roasted-gold/50 font-black uppercase tracking-[0.5em] mt-3">Métricas segmentadas por terminal industrial</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div 
            onClick={() => setShowCreateModal(true)}
            className="p-10 rounded-[3rem] border-2 border-dashed border-roasted-gold/20 hover:border-roasted-gold/60 bg-roasted-gold/5 hover:bg-roasted-gold/10 cursor-pointer transition-all group flex flex-col items-center justify-center min-h-[220px] shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-roasted-gold text-espresso-dark flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <PlusIcon className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-black text-roasted-gold uppercase tracking-widest">Nova Filial</h3>
            <p className="text-[9px] text-white/40 uppercase font-black mt-2">Ativar métricas para novo terminal</p>
          </div>

          {unitTabs.map(unit => (
            <div 
              key={unit.id}
              onClick={() => setShowUnlockModal(unit)}
              className="coffee-panel p-10 cursor-pointer transition-all group relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]"
            >
              <div className="absolute top-6 right-6">
                <KeyIcon className="w-5 h-5 text-roasted-gold/20" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mb-6 group-hover:bg-roasted-gold/10 group-hover:text-roasted-gold transition-all">
                <DatabaseIcon className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-widest text-center leading-tight">{unit.name}</h3>
              <p className="text-[10px] text-roasted-gold/40 uppercase font-black mt-2">Dados Protegidos</p>
            </div>
          ))}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <form onSubmit={handleCreateUnit} className="w-full max-w-md coffee-panel p-12 rounded-[3rem] border border-roasted-gold/20 relative">
              <button type="button" onClick={() => setShowCreateModal(false)} className="absolute top-8 right-8 text-white/20 hover:text-white"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-xl font-black text-roasted-gold uppercase tracking-[0.3em] mb-10 text-center">Registrar Unidade</h2>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className={labelStyle}>Selecione a Filial Oficial</label>
                  <CityDropdown label="" value={newUnitName} placeholder="LOCALIDADE..." onChange={v => setNewUnitName(v)} />
                </div>
                <div className="space-y-2">
                  <label className={labelStyle}>Senha de Acesso Única</label>
                  <input required type="password" className={inputStyle} value={newUnitPass} onChange={e => setNewUnitPass(e.target.value)} placeholder="••••••••" />
                </div>
                <button type="submit" className="w-full coffee-button py-5 text-xs">Ativar Terminal</button>
              </div>
            </form>
          </div>
        )}

        {showUnlockModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
            <form onSubmit={handleUnlock} className={`w-full max-w-sm coffee-panel p-12 rounded-[3rem] flex flex-col items-center border ${unlockError ? 'border-red-500 animate-shake' : 'border-roasted-gold/20'}`}>
              <div className="w-20 h-20 rounded-full bg-roasted-gold/10 flex items-center justify-center text-roasted-gold mb-8"><KeyIcon className="w-10 h-10" /></div>
              <h2 className="text-lg font-black text-white uppercase tracking-widest mb-1">{showUnlockModal.name}</h2>
              <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-10 text-center">Autenticação Requerida para Estatísticas</p>
              <div className="w-full space-y-6">
                <input autoFocus required type="password" className={`${inputStyle} text-center tracking-[0.5em]`} value={unlockPassword} onChange={(e) => setUnlockPassword(e.target.value)} placeholder="••••••••" />
                {unlockError && <p className="text-[10px] text-red-500 font-black uppercase text-center">Chave Inválida</p>}
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => {setShowUnlockModal(null); setUnlockPassword('');}} className="flex-1 py-4 bg-white/5 text-white/30 rounded-xl font-black uppercase text-[10px]">Cancelar</button>
                  <button type="submit" className="flex-[2] coffee-button py-4 text-[10px]">Desbloquear Dados</button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 p-8 rounded-[2.5rem] border border-roasted-gold/10 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-roasted-gold text-espresso-dark rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border-2 border-roasted-gold/20">
            {activeUnit.name.substring(0, 2)}
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest">{activeUnit.name}</h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[9px] text-roasted-gold/60 font-black uppercase tracking-widest">Painel Estatístico Ativo</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setActiveUnit(null)} 
          className="px-6 py-3 bg-white/5 text-white/40 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase transition-all"
        >
          Trocar de Unidade
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Iscas Disponíveis" 
          value={stats.available} 
          color="#64ffda" 
          status="Ativas" 
          percent={stats.getPercent(stats.available)}
        />
        <StatCard 
          label="Em Preparação" 
          value={stats.preparing} 
          color="#a855f7" 
          status="Carga" 
          percent={stats.getPercent(stats.preparing)}
        />
        <StatCard 
          label="Em Trânsito" 
          value={stats.inTransit} 
          color="#3b82f6" 
          status="Rota" 
          percent={stats.getPercent(stats.inTransit)}
        />
        <StatCard 
          label="Alertas Críticos" 
          value={stats.alerts} 
          color="#f43f5e" 
          status="Risco" 
          percent={stats.getPercent(stats.alerts)}
        />
      </div>

      <div className="coffee-panel p-10 rounded-[3rem]">
        <h3 className="text-sm font-black text-roasted-gold uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
          Análise de Distribuição Operacional - Terminal {activeUnit.name}
        </h3>
        <div className="space-y-6">
          {Object.values(OperationStatus).map(status => {
            const count = unitEntries.filter(e => e.status === status).length;
            const pct = stats.getPercent(count);
            return (count > 0 || unitEntries.length === 0) && (
              <div key={status} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                  <span>{status}</span>
                  <span>{count} Unidades ({pct.toFixed(1)}%)</span>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#1A0F0A] to-roasted-gold transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
          {unitEntries.length === 0 && (
            <p className="text-xs font-black text-white/20 uppercase text-center py-10">Sem movimentações registradas neste terminal</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;

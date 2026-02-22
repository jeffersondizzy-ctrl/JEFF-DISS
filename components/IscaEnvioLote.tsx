
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { LogisticsEntry, UnitTab, City, VehicleType, OperationStatus, LoadingPosition, CITIES } from '../types';
import { PlusIcon, TruckIcon, XMarkIcon, SearchIcon, ChevronDownIcon, SendIcon, SparklesIcon } from './icons';

interface IscaEnvioLoteProps {
  onAdd: (entry: Omit<LogisticsEntry, 'id' | 'timestamp' | 'protocol'>) => void;
  initialAuthor: string;
  entries: LogisticsEntry[];
  iscaControlEntries: LogisticsEntry[];
  activeUnit: UnitTab;
  onUpdateEntry: (id: string, updates: Partial<LogisticsEntry>) => void;
}

const inputStyle = "w-full bg-[#050a10] border border-[#fbbf24]/20 rounded-2xl px-5 py-3.5 text-sm focus:border-[#fbbf24] outline-none transition-all placeholder:text-white/10 text-white font-medium shadow-inner uppercase";
const labelStyle = "text-[9px] font-black text-[#fbbf24] uppercase tracking-widest mb-2 block ml-1 opacity-60";

const IscaEnvioLote: React.FC<IscaEnvioLoteProps> = ({ onAdd, initialAuthor, entries, iscaControlEntries, activeUnit, onUpdateEntry }) => {
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    motorista: '',
    placaCavalo: '',
    destino: '' as City,
    responsavel: initialAuthor.toUpperCase(),
    iscas: ['']
  });

  const handleAddIscaField = () => setFormData(p => ({ ...p, iscas: [...p.iscas, ''] }));
  const handleRemoveIscaField = (idx: number) => setFormData(p => ({ ...p, iscas: p.iscas.filter((_, i) => i !== idx) }));
  const handleUpdateIsca = (idx: number, val: string) => {
    const newList = [...formData.iscas];
    newList[idx] = val.toUpperCase();
    setFormData(p => ({ ...p, iscas: newList }));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const iscasFiltradas = formData.iscas.filter(i => i.trim() !== '');
    if (iscasFiltradas.length === 0) return alert("Adicione pelo menos uma isca.");
    if (!formData.destino) return alert("Selecione o destino.");

    onAdd({
      author: initialAuthor,
      responsavelPreAlerta: formData.responsavel,
      motorista: formData.motorista,
      placaCavalo: formData.placaCavalo,
      placaVeiculo: [],
      numIsca: iscasFiltradas,
      numNF: [],
      uma: [],
      codigoProduto: [],
      iscaPertencente: iscasFiltradas.map(() => activeUnit.name as City),
      origem: activeUnit.name as City,
      destino: formData.destino,
      tipoVeiculo: VehicleType.BAU,
      status: OperationStatus.VIA_CORREIO,
      observacoes: `ENVIO PELOS CORREIOS DE ${activeUnit.name} PARA ${formData.destino}`,
      embarqueIsca: [LoadingPosition.NAO_INFORMADO],
      embarqueObservacoes: ['ENVIO VIA CORREIO'],
      unitId: activeUnit.id,
      dataOperacao: new Date().toISOString().split('T')[0],
      horaOperacao: new Date().toTimeString().slice(0, 5)
    });

    setIsSending(false);
    setFormData({ motorista: '', placaCavalo: '', destino: '' as City, responsavel: initialAuthor.toUpperCase(), iscas: [''] });
  };

  const currentShipments = useMemo(() => {
    const all = [...entries, ...iscaControlEntries];
    return all.filter(e => 
      (e.status === OperationStatus.ROTA_IDA || e.status === OperationStatus.VIA_CORREIO) && 
      (e.destino.toUpperCase() === activeUnit.name.toUpperCase() || e.origem.toUpperCase() === activeUnit.name.toUpperCase())
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [entries, iscaControlEntries, activeUnit]);

  const handleConfirmReceipt = (entry: LogisticsEntry) => {
    if (window.confirm(`Confirmar o recebimento de ${entry.numIsca.length} iscas vindas de ${entry.origem}?`)) {
      onUpdateEntry(entry.id, { 
        status: OperationStatus.ISCA_DISPONIVEL,
        observacoes: `${entry.observacoes} | RECEBIDO EM ${activeUnit.name} POR ${initialAuthor.toUpperCase()}`,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-[#fbbf24] uppercase tracking-[0.3em]" title="FLUXO DE MOVIMENTAÇÃO DE ATIVOS ENTRE UNIDADES UTILIZANDO SERVIÇOS POSTAIS OU MALOTE.">Envio pelos correios</h2>
        <button 
          onClick={() => setIsSending(true)}
          className="px-6 py-3 bg-[#fbbf24] text-[#0a192f] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-[#fbbf24]44"
          title="INICIAR UM NOVO REGISTRO DE DESPACHO DE ISCAS PARA OUTRA UNIDADE."
        >
          <SendIcon className="w-4 h-4" />
          Novo Envio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentShipments.map(ship => {
          const isReceiver = ship.destino.toUpperCase() === activeUnit.name.toUpperCase();
          return (
            <div 
              key={ship.id} 
              className="bg-black/40 border border-[#fbbf24]/20 rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-[#fbbf24] transition-all"
              title={`LOTE DE ${ship.numIsca.length} ATIVOS. ORIGEM: ${ship.origem} | DESTINO: ${ship.destino}.`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#fbbf24]/5 rounded-full -mr-16 -mt-16 animate-pulse"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-[#fbbf24] uppercase tracking-widest block mb-1">Status de Envio</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-tighter italic">
                    {ship.origem} ➔ {ship.destino}
                  </h3>
                </div>
                <div 
                  className="w-10 h-10 bg-[#fbbf24]/10 rounded-xl flex items-center justify-center text-[#fbbf24] font-black border border-[#fbbf24]/20 shadow-inner"
                  title="QUANTIDADE TOTAL DE DISPOSITIVOS NESTE LOTE."
                >
                  {ship.numIsca.length}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[9px] font-black uppercase text-white/30 tracking-widest" title="NOME DO RESPONSÁVEL PELO TRANSPORTE FÍSICO.">
                   <span>Responsável</span>
                   <span className="text-white">{ship.motorista}</span>
                </div>
                <div className="flex justify-between text-[9px] font-black uppercase text-white/30 tracking-widest" title="NÚMERO DE OBJETO OU IDENTIFICAÇÃO DA PLACA.">
                   <span>Referência</span>
                   <span className="text-white font-mono">{ship.placaCavalo || 'N/A'}</span>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 max-h-24 overflow-y-auto custom-scrollbar shadow-inner" title="LISTAGEM COMPLETA DOS IDs DAS ISCAS NESTE LOTE.">
                  <span className="text-[8px] font-black text-white/10 uppercase tracking-widest block mb-2">Iscas no Envio</span>
                  <div className="flex flex-wrap gap-1.5">
                    {ship.numIsca.map((isca, i) => (
                      <span key={i} className="text-[8px] font-black text-[#fbbf24] bg-[#fbbf24]/5 px-2 py-0.5 rounded border border-[#fbbf24]/20" title={`ID INDIVIDUAL: #${isca}`}>#{isca}</span>
                    ))}
                  </div>
                </div>
              </div>

              {isReceiver ? (
                <button 
                  onClick={() => handleConfirmReceipt(ship)}
                  className="w-full py-4 bg-green-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-500/20"
                  title="CLIQUE PARA CONFIRMAR QUE O LOTE CHEGOU FISICAMENTE. AS ISCAS SERÃO MARCADAS COMO 'DISPONÍVEIS' NESTA UNIDADE."
                >
                  Confirmar Recebimento
                </button>
              ) : (
                <div 
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 cursor-help"
                  title="ESTE LOTE JÁ FOI DESPACHADO E ESTÁ AGUARDANDO CONFIRMAÇÃO DA UNIDADE DE DESTINO."
                >
                   <div className="w-2 h-2 rounded-full bg-[#fbbf24] animate-ping"></div>
                   <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Em Trânsito</span>
                </div>
              )}
            </div>
          );
        })}

        {currentShipments.length === 0 && (
          <div className="col-span-full py-32 text-center opacity-30 flex flex-col items-center">
            <SendIcon className="w-12 h-12 mb-4" />
            <p className="text-sm font-black uppercase tracking-[0.5em]">Sem envios ativos</p>
          </div>
        )}
      </div>

      {isSending && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#03070a]/90 backdrop-blur-xl animate-in fade-in duration-300">
          <form 
            onSubmit={handleSend}
            className="w-full max-w-2xl bg-[#0a192f] p-10 rounded-[3rem] border border-[#fbbf24]/30 relative shadow-[0_0_100px_#fbbf2411] max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <button type="button" onClick={() => setIsSending(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors" title="CANCELAR ENVIO">
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-[#fbbf24] text-[#0a192f] rounded-2xl flex items-center justify-center shadow-lg">
                <SendIcon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-[#fbbf24] uppercase tracking-[0.4em]">Configurar Envio pelos correios</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div title="NOME DA PESSOA QUE ESTÁ LEVANDO AS ISCAS OU O RESPONSÁVEL NO MALOTE.">
                <label className={labelStyle}>Responsável/Motorista</label>
                <input required className={inputStyle} value={formData.motorista} onChange={e => setFormData(p => ({ ...p, motorista: e.target.value.toUpperCase() }))} placeholder="NOME DO RESPONSÁVEL" />
              </div>
              <div title="IDENTIFICAÇÃO DO VEÍCULO OU NÚMERO DE RASTREIO DOS CORREIOS.">
                <label className={labelStyle}>Referência/Placa</label>
                <input className={inputStyle} value={formData.placaCavalo} onChange={e => setFormData(p => ({ ...p, placaCavalo: e.target.value.toUpperCase() }))} placeholder="IDENTIFICAÇÃO" />
              </div>
              <div title="PARA QUAL UNIDADE DO CAFÉ TRÊS CORAÇÕES AS ISCAS ESTÃO SENDO ENVIADAS.">
                <label className={labelStyle}>Destino do Envio</label>
                <select 
                  className={inputStyle} 
                  value={formData.destino} 
                  onChange={e => setFormData(p => ({ ...p, destino: e.target.value as City }))}
                >
                  <option value="">SELECIONE O DESTINO...</option>
                  {CITIES.map((c: string) => <option key={c} value={c} className="bg-[#0a192f]">{c}</option>)}
                </select>
              </div>
              <div title="NOME DO AGENTE QUE ESTÁ EFETUANDO O REGISTRO NO SISTEMA.">
                <label className={labelStyle}>Responsável pelo Registro</label>
                <input required className={inputStyle} value={formData.responsavel} onChange={e => setFormData(p => ({ ...p, responsavel: e.target.value.toUpperCase() }))} />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <label className={labelStyle}>Iscas para Envio</label>
                <button type="button" onClick={handleAddIscaField} className="px-4 py-1.5 bg-[#fbbf24]/10 text-[#fbbf24] rounded-lg text-[9px] font-black uppercase hover:bg-[#fbbf24] hover:text-[#0a192f] transition-all border border-[#fbbf24]/20 shadow-md" title="ADICIONAR MAIS UM CAMPO DE ISCA AO LOTE.">Adicionar Isca</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {formData.iscas.map((isca, idx) => (
                  <div key={idx} className="relative group" title={`DIGITE O ID DA ISCA ${idx + 1}.`}>
                    <input 
                      required 
                      className={`${inputStyle} pr-10`} 
                      value={isca} 
                      onChange={e => handleUpdateIsca(idx, e.target.value)} 
                      placeholder={`ISCA ${idx+1}`} 
                    />
                    {formData.iscas.length > 1 && (
                      <button type="button" onClick={() => handleRemoveIscaField(idx)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-red-500 transition-colors" title="REMOVER ESTA ISCA DO LOTE.">
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-[#fbbf24] text-[#0a192f] rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:scale-[1.01] active:scale-95 transition-all" title="SINCRONIZAR OS DADOS E DISPONIBILIZAR PARA A UNIDADE DE DESTINO.">
              Sincronizar e Iniciar Envio
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default IscaEnvioLote;

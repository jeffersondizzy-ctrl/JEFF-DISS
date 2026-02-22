
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { AppData, LogisticsEntry } from '../types';
import { DatabaseIcon, CloudIcon, ShareIcon, SparklesIcon, ChevronRightIcon } from './icons';

interface DataTransmissionProps {
  data: AppData;
}

const DataTransmission: React.FC<DataTransmissionProps> = ({ data }) => {
  const [transmitting, setTransmitting] = useState<'none' | 'logistics' | 'control'>('none');
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const simulateTransmission = (type: 'logistics' | 'control') => {
    setTransmitting(type);
    setProgress(0);
    setSuccess(false);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSuccess(true);
          setTimeout(() => {
            setTransmitting('none');
            setSuccess(false);
          }, 3000);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // Copiar dados para o clipboard (JSON formatado)
    const dataToTransmit = type === 'logistics' ? data.entries : data.iscaControlEntries;
    navigator.clipboard.writeText(JSON.stringify(dataToTransmit, null, 2))
      .then(() => console.log('Dados copiados para o clipboard'))
      .catch(err => console.error('Erro ao copiar dados', err));
  };

  const TransmissionCard = ({ 
    title, 
    count, 
    type, 
    icon: Icon, 
    description 
  }: { 
    title: string; 
    count: number; 
    type: 'logistics' | 'control'; 
    icon: any; 
    description: string;
  }) => (
    <div className={`cyber-glass p-10 rounded-[3rem] border border-[#64ffda]/10 relative overflow-hidden flex flex-col ${transmitting === type ? 'ring-2 ring-[#64ffda] shadow-[0_0_50px_rgba(100,255,218,0.1)]' : ''}`}>
      <div className="flex items-start justify-between mb-8">
        <div className="flex flex-col gap-2">
          <div className="w-14 h-14 bg-[#64ffda]/10 rounded-2xl flex items-center justify-center text-[#64ffda] border border-[#64ffda]/20 shadow-xl">
            <Icon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mt-4">{title}</h3>
          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">{description}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-[#64ffda] uppercase tracking-[0.3em] block mb-1">Registros Locais</span>
          <span className="text-4xl font-black text-white italic">{count}</span>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
          <div className="flex justify-between text-[10px] font-black uppercase text-white/20 mb-3 tracking-widest">
            <span>Integridade do Lote</span>
            <span>{count > 0 ? '100% OK' : 'SEM DADOS'}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full bg-[#64ffda] transition-all duration-1000 ${count > 0 ? 'w-full shadow-[0_0_10px_#64ffda]' : 'w-0'}`}></div>
          </div>
        </div>
      </div>

      <button 
        disabled={count === 0 || transmitting !== 'none'}
        onClick={() => simulateTransmission(type)}
        className={`mt-10 w-full py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-3 transition-all ${
          count === 0 
            ? 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5' 
            : transmitting === type 
              ? 'bg-[#64ffda]/20 text-[#64ffda] border border-[#64ffda]'
              : 'bg-[#64ffda] text-[#0a192f] hover:scale-[1.02] active:scale-95 shadow-xl shadow-[#64ffda]/10'
        }`}
      >
        {transmitting === type ? (
          <>
            <CloudIcon className="w-4 h-4 animate-bounce" />
            Transmitindo... {progress}%
          </>
        ) : success && transmitting === type ? (
          <>
            <SparklesIcon className="w-4 h-4" />
            Lote Sincronizado
          </>
        ) : (
          <>
            <ShareIcon className="w-4 h-4" />
            Enviar todos os dados
          </>
        )}
      </button>

      {transmitting === type && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
          <div className="h-full bg-[#64ffda] transition-all duration-200" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
        <div className="w-20 h-20 bg-[#64ffda]/10 rounded-full flex items-center justify-center border border-[#64ffda]/20 shadow-2xl relative">
          <DatabaseIcon className="w-10 h-10 text-[#64ffda]" />
          <div className="absolute inset-0 border border-[#64ffda]/30 rounded-full animate-ping opacity-20"></div>
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter metallic-text uppercase leading-none">Histórico de Transmissão Café Três Corações</h2>
        <p className="text-[10px] text-[#64ffda]/50 font-black uppercase tracking-[0.5em]">Consolidação e sincronização de dados logísticos e operacionais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TransmissionCard 
          title="Lote de Logística" 
          count={data.entries.length} 
          type="logistics" 
          icon={DatabaseIcon}
          description="Aba Adicionar (Protocolos Gerados)"
        />
        <TransmissionCard 
          title="Lote de Controle" 
          count={data.iscaControlEntries.length} 
          type="control" 
          icon={CloudIcon}
          description="Aba Controle de Isca (Operacional)"
        />
      </div>

      <div className="bg-[#64ffda]/5 border border-[#64ffda]/10 rounded-[3rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center text-[#64ffda]">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Sincronização Avançada</h4>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-tighter">Ao transmitir, os dados são convertidos em JSON e copiados para sua área de transferência para processamento externo.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black text-[#64ffda]/40 uppercase tracking-[0.4em]">Status da Rede:</span>
          <span className="px-4 py-2 bg-[#64ffda]/10 text-[#64ffda] text-[10px] font-black rounded-lg border border-[#64ffda]/20 animate-pulse">OPTIMIZED</span>
        </div>
      </div>
    </div>
  );
};

export default DataTransmission;

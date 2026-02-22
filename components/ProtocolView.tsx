
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { LogisticsEntry } from '../types';

interface ProtocolViewProps {
  entry: LogisticsEntry;
}

const ProtocolView: React.FC<ProtocolViewProps> = ({ entry }) => {
  // Formata as placas de baú/carreta conforme solicitado: PLACA1/PLACA2
  const formatPlacasBau = (placas: string[]) => {
    return placas.filter(p => p.trim() !== '').join('/') || 'NÃO INFORMADO';
  };

  return (
    <div className="bg-white text-[#001529] font-sans relative overflow-hidden">
      {/* Cabeçalho Compacto */}
      <div className="bg-[#001529] text-white p-6 grid grid-cols-1 md:grid-cols-3 items-center border-b-4 border-[#00d2ff] gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tighter uppercase">Protocolo de Carga</h1>
          <p className="text-[#00d2ff] font-bold tracking-widest text-[8px] uppercase opacity-70">Segurança & GR - Café Três Corações</p>
        </div>
        <div className="text-center">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 block">Identificador</span>
          <span className="text-2xl font-black text-[#00d2ff] tracking-tighter leading-none">#P{entry.protocol}</span>
        </div>
        <div className="hidden md:block"></div>
      </div>

      <div className="p-8 space-y-6">
        {/* Bloco Principal: Pessoal e Rota */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Coluna Pessoal (4/12) */}
          <div className="md:col-span-4 space-y-4 border-r border-gray-100 pr-6">
            <section>
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Motorista</label>
              <p className="text-base font-black uppercase text-[#001529]">{entry.motorista}</p>
            </section>
            
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
              <section>
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Resp. Pré Alerta</label>
                <p className="text-[10px] font-bold uppercase text-gray-600">{entry.responsavelPreAlerta || 'SISTEMA'}</p>
              </section>
              <section>
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Agente de Risco</label>
                <p className="text-[10px] font-bold uppercase text-gray-600">{entry.author}</p>
              </section>
            </div>

            <section className="pt-2 border-t border-gray-50">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Registro Operacional</label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-800">{new Date(entry.timestamp).toLocaleDateString()}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="text-[10px] font-black text-gray-800">{new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </section>
          </div>

          {/* Coluna Logística e Placas (8/12) */}
          <div className="md:col-span-8 flex flex-col justify-between">
            {/* DESTINO E ORIGEM COMPACTOS */}
            <div className="grid grid-cols-2 gap-4 mb-4">
               <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <label className="text-[8px] font-black text-gray-400 uppercase block mb-1">Origem</label>
                  <p className="text-xs font-black uppercase">{entry.origem}</p>
               </div>
               <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <label className="text-[8px] font-black text-blue-400 uppercase block mb-1">Destino Final</label>
                  <p className="text-xs font-black uppercase text-blue-900">{entry.destino}</p>
               </div>
            </div>

            {/* DESTAQUE AMPLIADO DE PLACAS */}
            <div className="bg-[#001529] text-white p-5 rounded-2xl relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00d2ff]/10 rounded-full -mr-12 -mt-12"></div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-1">
                  <label className="text-[7px] font-black text-[#00d2ff] uppercase tracking-[0.3em] block mb-1 opacity-60">Cavalo</label>
                  <p className="text-2xl font-black font-mono tracking-tighter">{entry.placaCavalo}</p>
                </div>
                <div className="md:col-span-2 border-l border-white/10 pl-6">
                  <label className="text-[7px] font-black text-[#00d2ff] uppercase tracking-[0.3em] block mb-1 opacity-60">Bau / Carreta(s)</label>
                  {/* AUMENTO DA INFORMAÇÃO CONFORME SOLICITADO */}
                  <p className="text-3xl font-black font-mono tracking-tight leading-none break-all">
                    {formatPlacasBau(entry.placaVeiculo)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unidades de Embarque e Iscas (Geral) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entry.numIsca.map((iscaId, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="w-10 h-10 bg-[#001529] text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">#{idx+1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black text-[#00d2ff] uppercase tracking-widest">ID {iscaId}</span>
                  <span className="text-[8px] font-black bg-white px-2 py-0.5 rounded border text-gray-400 uppercase">{entry.iscaPertencente[idx]}</span>
                </div>
                <p className="text-[10px] font-bold text-gray-700 uppercase truncate">Posição: {entry.embarqueIsca[idx]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé Técnico de Dados Adicionais */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          <div className="text-center">
            <label className="text-[7px] font-black text-gray-400 uppercase block">Notas Fiscais</label>
            <p className="text-[9px] font-black text-gray-600 truncate">{entry.numNF.join(', ') || 'N/A'}</p>
          </div>
          <div className="text-center border-l border-gray-100">
            <label className="text-[7px] font-black text-gray-400 uppercase block">UMA</label>
            <p className="text-[9px] font-black text-gray-600 truncate">{entry.uma.join(', ') || 'N/A'}</p>
          </div>
          <div className="text-center border-l border-gray-100">
            <label className="text-[7px] font-black text-gray-400 uppercase block">Cód. Produto</label>
            <p className="text-[9px] font-black text-gray-600 truncate">{entry.codigoProduto.join(', ') || 'N/A'}</p>
          </div>
        </div>

        {/* Observações Minimizadas */}
        {entry.observacoes && (
          <section className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
            <label className="text-[8px] font-black text-yellow-600 uppercase tracking-widest block mb-1">Observações Gerais</label>
            <p className="text-[10px] text-gray-600 italic leading-relaxed">
              {entry.observacoes}
            </p>
          </section>
        )}
      </div>

      <div className="bg-gray-50 px-8 py-3 flex justify-between items-center border-t border-gray-100">
        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">Platinum Monitor v5.0</span>
        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${entry.status === 'No Destino' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          Status: {entry.status}
        </div>
      </div>
    </div>
  );
};

export default ProtocolView;

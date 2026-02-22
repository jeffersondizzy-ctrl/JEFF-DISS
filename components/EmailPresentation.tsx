
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { LogisticsEntry } from '../types';
import { MailIcon, SearchIcon, SparklesIcon, ShareIcon } from './icons';

interface EmailPresentationProps {
  entries: LogisticsEntry[];
}

const EmailPresentation: React.FC<EmailPresentationProps> = ({ entries }) => {
  const [protocolId, setProtocolId] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<LogisticsEntry | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = entries.find(ent => ent.protocol === parseInt(protocolId));
    setSelectedEntry(found || null);
    if (!found) alert("Protocolo não localizado.");
  };

  const generateEmailBody = (entry: LogisticsEntry) => {
    return `
REDE DE SEGURANÇA - CAFÉ TRÊS CORAÇÕES
PROTOCOLO OFICIAL: #${entry.protocol}
--------------------------------------------------

IDENTIFICAÇÃO OPERACIONAL:
Motorista: ${entry.motorista}
Agente de Monitoramento: ${entry.author}
Data/Hora: ${new Date(entry.timestamp).toLocaleString()}

DETALHES DO VEÍCULO E CARGA:
Placa Cavalo: ${entry.placaCavalo}
Placa(s) Baú: ${entry.placaVeiculo.join(', ')}
Tipo de Veículo: ${entry.tipoVeiculo}
Status Atual: ${entry.status}

DISPOSITIVOS DE ISCA (TELEMETRIA):
${entry.numIsca.map((isc, idx) => `Isca ${idx + 1}: #${isc} (Destino: ${entry.iscaPertencente[idx]})`).join('\n')}

ROTA E LOGÍSTICA:
Origem: ${entry.origem}
Destino Final: ${entry.destino}

OBSERVAÇÕES TÉCNICAS:
${entry.observacoes || 'Nenhuma observação adicional.'}

--------------------------------------------------
DOCUMENTO GERADO VIA SISTEMA PRÉ ALERTA GR
© 2026 CAFÉ TRÊS CORAÇÕES - MONITORAMENTO PLATINUM
    `.trim();
  };

  const handleCopy = () => {
    if (!selectedEntry) return;
    const body = generateEmailBody(selectedEntry);
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMail = () => {
    if (!selectedEntry) return;
    const subject = encodeURIComponent(`[PRÉ ALERTA GR] Protocolo #${selectedEntry.protocol} - ${selectedEntry.motorista} (${selectedEntry.placaCavalo})`);
    const body = encodeURIComponent(generateEmailBody(selectedEntry));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 max-w-5xl mx-auto">
      <div className="flex flex-col items-center text-center space-y-4 mb-10">
        <div className="w-20 h-20 bg-[#64ffda]/10 rounded-full flex items-center justify-center border border-[#64ffda]/20 shadow-2xl">
          <MailIcon className="w-10 h-10 text-[#64ffda]" />
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter metallic-text uppercase leading-none">Central de Comunicação</h2>
        <p className="text-[10px] text-[#64ffda]/50 font-black uppercase tracking-[0.5em]">Geração de comunicados oficiais por protocolo</p>
      </div>

      <div className="cyber-glass p-10 rounded-[3rem] border border-[#64ffda]/10 mb-8 max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <input 
              type="number" 
              value={protocolId}
              onChange={e => setProtocolId(e.target.value)}
              placeholder="Nº DO PROTOCOLO..." 
              className="w-full bg-[#050a10] border border-[#64ffda]/20 rounded-2xl px-6 py-4 text-sm font-black text-[#64ffda] outline-none focus:border-[#64ffda] transition-all"
            />
          </div>
          <button type="submit" className="px-6 bg-[#64ffda] text-[#0a192f] rounded-2xl font-black hover:scale-105 active:scale-95 transition-all">
            <SearchIcon className="w-5 h-5" />
          </button>
        </form>
      </div>

      {selectedEntry && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-700">
          {/* Preview do E-mail */}
          <div className="cyber-glass p-10 rounded-[3rem] border border-[#64ffda]/10 bg-black/40">
            <div className="mb-6 pb-4 border-b border-white/5">
              <span className="text-[10px] font-black text-[#64ffda]/40 uppercase tracking-widest block mb-2">Assunto do E-mail</span>
              <p className="text-xs font-bold text-white">
                [PRÉ ALERTA GR] Protocolo #{selectedEntry.protocol} - {selectedEntry.motorista} ({selectedEntry.placaCavalo})
              </p>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-black text-[#64ffda]/40 uppercase tracking-widest block mb-2">Corpo da Mensagem</span>
              <pre className="text-[11px] leading-relaxed text-white/70 font-mono whitespace-pre-wrap bg-black/60 p-6 rounded-2xl border border-white/5 h-[400px] overflow-y-auto custom-scrollbar">
                {generateEmailBody(selectedEntry)}
              </pre>
            </div>
          </div>

          {/* Ações e Apresentação */}
          <div className="flex flex-col gap-6">
            <div className="cyber-glass p-8 rounded-[3rem] border border-[#64ffda]/20 bg-[#64ffda]/5 flex-1">
              <h3 className="text-lg font-black text-[#64ffda] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <SparklesIcon className="w-5 h-5" />
                Apresentação Gerada
              </h3>
              <div className="space-y-6">
                <p className="text-sm text-white/60 leading-relaxed italic">
                  O protocolo do motorista <span className="text-white font-bold">{selectedEntry.motorista}</span> foi processado e formatado para comunicação externa. 
                  Todos os dados de telemetria e posicionamento de isca foram consolidados.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <span className="text-[9px] font-black text-[#64ffda]/50 uppercase block">Status Transmissão</span>
                    <span className="text-xs font-black text-white">READY TO SEND</span>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <span className="text-[9px] font-black text-[#64ffda]/50 uppercase block">Codificação</span>
                    <span className="text-xs font-black text-white">UTF-8 / SECURE</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                <button 
                  onClick={handleCopy}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <ShareIcon className="w-4 h-4" />
                  {copied ? 'Conteúdo Copiado!' : 'Copiar Corpo do E-mail'}
                </button>
                <button 
                  onClick={handleOpenMail}
                  className="w-full py-5 bg-[#64ffda] text-[#0a192f] rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#64ffda]/10"
                >
                  <MailIcon className="w-4 h-4" />
                  Abrir no Outlook / Gmail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailPresentation;

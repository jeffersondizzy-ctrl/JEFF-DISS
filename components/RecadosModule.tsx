
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { Recado, UnitTab } from '../types';
import { MailIcon, SendIcon, MessageSquareIcon, ChevronDownIcon, XMarkIcon, SearchIcon, ClipboardIcon, ArrowRightIcon } from './icons';

interface RecadosModuleProps {
  recados: Recado[];
  currentUser: string;
  currentUserUnit: string;
  onSendResponse: (recadoId: string, response: string) => void;
  onSendRecado: (recado: Omit<Recado, 'id' | 'timestamp' | 'status'>) => void;
  unitTabs: UnitTab[];
  onBackToMenu: () => void;
}

const RecadosModule: React.FC<RecadosModuleProps> = ({ 
  recados, 
  currentUser, 
  currentUserUnit, 
  onSendResponse, 
  onSendRecado,
  unitTabs,
  onBackToMenu
}) => {
  const [filter, setFilter] = useState<'all' | 'received' | 'sent'>('received');
  const [selectedRecado, setSelectedRecado] = useState<Recado | null>(null);
  const [responseText, setResponseText] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  
  // New Recado State
  const [newToUnit, setNewToUnit] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newText, setNewText] = useState('');

  const filteredRecados = useMemo(() => {
    let list = recados;
    if (filter === 'received') list = recados.filter(r => r.toUnit === currentUserUnit);
    if (filter === 'sent') list = recados.filter(r => r.fromUnit === currentUserUnit);
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [recados, filter, currentUserUnit]);

  const handleResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecado || !responseText.trim()) return;
    onSendResponse(selectedRecado.id, responseText);
    setResponseText('');
    setSelectedRecado(null);
  };

  const handleNewRecado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToUnit || !newSubject || !newText) return;
    
    onSendRecado({
      fromUnit: currentUserUnit,
      toUnit: newToUnit,
      author: currentUser,
      subject: newSubject.toUpperCase(),
      text: newText,
      type: 'cobranca'
    });

    setNewToUnit('');
    setNewSubject('');
    setNewText('');
    setShowNewModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-red-950/20 p-8 rounded-[2.5rem] border border-red-500/20">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <MailIcon className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">Caixa de Recados</h2>
            <p className="text-[10px] text-red-500/50 font-black uppercase tracking-[0.5em] mt-2">Comunicação Interna e Cobranças</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setFilter('received')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${filter === 'received' ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>Recebidos</button>
            <button onClick={() => setFilter('sent')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${filter === 'sent' ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>Enviados</button>
            <button onClick={() => setFilter('all')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${filter === 'all' ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>Todos</button>
          </div>
          <button onClick={() => setShowNewModal(true)} className="bg-red-600 hover:bg-red-500 text-white px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20">Novo Recado</button>
          <button onClick={onBackToMenu} className="px-6 py-2 bg-white/5 text-white/40 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center gap-2">
            <ArrowRightIcon className="w-4 h-4 rotate-180" /> Menu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List */}
        <div className="lg:col-span-5 space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
          {filteredRecados.map(rec => (
            <div 
              key={rec.id} 
              onClick={() => setSelectedRecado(rec)}
              className={`coffee-panel p-6 cursor-pointer border transition-all ${selectedRecado?.id === rec.id ? 'border-red-500 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-white/5 hover:border-white/20'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${rec.status === 'pending' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                  {rec.status === 'pending' ? 'Pendente' : 'Respondido'}
                </span>
                <span className="text-[8px] text-white/20 font-black uppercase">{new Date(rec.timestamp).toLocaleDateString()}</span>
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">{rec.subject}</h3>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-red-500/60 font-black uppercase">
                  {rec.fromUnit} → {rec.toUnit}
                </p>
                {rec.relatedProtocol && (
                  <span className="text-[8px] font-mono text-white/20">#P{rec.relatedProtocol}</span>
                )}
              </div>
            </div>
          ))}
          {filteredRecados.length === 0 && (
            <div className="py-20 text-center opacity-20">
              <MailIcon className="w-12 h-12 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Nenhum recado encontrado</p>
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-7">
          {selectedRecado ? (
            <div className="coffee-panel p-10 border border-red-500/20 h-full flex flex-col bg-red-950/5">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">{selectedRecado.subject}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{selectedRecado.fromUnit}</span>
                    <span className="text-white/20">→</span>
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{selectedRecado.toUnit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-white/40 uppercase">{new Date(selectedRecado.timestamp).toLocaleString()}</p>
                  <p className="text-[8px] text-white/20 uppercase font-black mt-1">Autor: {selectedRecado.author}</p>
                </div>
              </div>

              <div className="flex-1 bg-black/40 rounded-3xl p-8 border border-white/5 mb-8">
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{selectedRecado.text}</p>
              </div>

              {selectedRecado.status === 'responded' ? (
                <div className="bg-green-500/5 border border-green-500/20 rounded-3xl p-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Resposta da Unidade</span>
                    <span className="text-[8px] text-white/20 uppercase font-black">{new Date(selectedRecado.respondedAt!).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-white/60 italic">"{selectedRecado.response}"</p>
                  <p className="text-[8px] text-white/20 uppercase font-black mt-4 text-right">— {selectedRecado.respondedBy}</p>
                </div>
              ) : selectedRecado.toUnit === currentUserUnit ? (
                <form onSubmit={handleResponse} className="space-y-4">
                  <textarea 
                    required
                    className="w-full bg-black/60 border border-red-500/20 rounded-2xl p-6 text-sm text-white outline-none focus:border-red-500 h-32 resize-none uppercase"
                    placeholder="DIGITE SUA RESPOSTA PARA A UNIDADE..."
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                  />
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-3 shadow-lg shadow-red-600/20">
                    <SendIcon className="w-4 h-4" /> ENVIAR RESPOSTA
                  </button>
                </form>
              ) : (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-3xl">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Aguardando resposta da unidade de destino</p>
                </div>
              )}
            </div>
          ) : (
            <div className="coffee-panel h-full flex flex-col items-center justify-center opacity-20 border border-dashed border-white/10">
              <MessageSquareIcon className="w-16 h-16 mb-6" />
              <p className="text-sm font-black uppercase tracking-[0.5em]">Selecione um recado para visualizar</p>
            </div>
          )}
        </div>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
          <form onSubmit={handleNewRecado} className="w-full max-w-xl coffee-panel p-12 border border-red-500/20 relative bg-red-950/10">
            <button type="button" onClick={() => setShowNewModal(false)} className="absolute top-8 right-8 text-white/20 hover:text-white">
              <XMarkIcon className="w-8 h-8" />
            </button>
            <h2 className="text-xl font-black text-red-500 uppercase tracking-[0.3em] mb-10 text-center">Novo Recado / Cobrança</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Para Unidade</label>
                <select 
                  required
                  className="w-full bg-black/40 border border-red-500/20 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-red-500 uppercase font-bold"
                  value={newToUnit}
                  onChange={e => setNewToUnit(e.target.value)}
                >
                  <option value="">SELECIONE A UNIDADE...</option>
                  {unitTabs.filter(u => u.name !== currentUserUnit).map(u => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Assunto</label>
                <input 
                  required
                  className="w-full bg-black/40 border border-red-500/20 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-red-500 uppercase font-bold"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="EX: COBRANÇA DE ISCA EXTRAVIADA"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Mensagem</label>
                <textarea 
                  required
                  className="w-full bg-black/40 border border-red-500/20 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-red-500 h-32 resize-none uppercase font-bold"
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  placeholder="DESCREVA O MOTIVO DA COBRANÇA OU SOLICITAÇÃO..."
                />
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white py-5 rounded-xl text-xs flex items-center justify-center gap-4 shadow-lg shadow-red-600/20">
                <SendIcon className="w-4 h-4" /> ENVIAR RECADO
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RecadosModule;

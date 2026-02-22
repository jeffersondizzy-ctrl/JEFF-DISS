
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChatMessage, City, CITIES, UserAccount } from '../types';
import { SendIcon, GlobeIcon, DatabaseIcon, UserIcon, SearchIcon, XMarkIcon, ChevronRightIcon } from './icons';

interface ChatModuleProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, channel: 'global' | 'unit' | 'private', recipient?: string) => void;
  currentUser: string;
  currentUserUnit: string;
  allUsers: UserAccount[];
}

const ChatModule: React.FC<ChatModuleProps> = ({ messages, onSendMessage, currentUser, currentUserUnit, allUsers }) => {
  const [activeChannel, setActiveChannel] = useState<'global' | 'unit' | 'private'>('global');
  const [targetUnit, setTargetUnit] = useState<string>(currentUserUnit);
  const [text, setText] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeChannel, selectedContact, targetUnit]);

  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      if (activeChannel === 'global') return msg.channel === 'global';
      if (activeChannel === 'unit') {
        // Mensagens do canal da unidade: ou a unidade é a autora, ou a unidade é a destinatária
        return msg.channel === 'unit' && (msg.authorUnit === targetUnit || msg.recipient === targetUnit);
      }
      if (activeChannel === 'private' && selectedContact) {
        return msg.channel === 'private' && 
               ((msg.author === currentUser && msg.recipient === selectedContact) ||
                (msg.author === selectedContact && msg.recipient === currentUser));
      }
      return false;
    });
  }, [messages, activeChannel, selectedContact, currentUser, currentUserUnit, targetUnit]);

  const contacts = useMemo(() => {
    // Retorna todos os usuários exceto o atual e o admin
    return allUsers.filter(u => u.username !== currentUser && u.username.toLowerCase() !== 'admin');
  }, [allUsers, currentUser]);

  const filteredCities = useMemo(() => {
    return CITIES.filter(city => city.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    if (activeChannel === 'private' && !selectedContact) return;
    
    // Se estiver em um canal de unidade, o recipient é a unidade alvo
    const recipient = activeChannel === 'private' ? selectedContact : (activeChannel === 'unit' ? targetUnit : undefined);
    
    onSendMessage(text, activeChannel, recipient || undefined);
    setText('');
  };

  const selectUnitChannel = (unit: string) => {
    setTargetUnit(unit);
    setActiveChannel('unit');
    setIsSearching(false);
  };

  return (
    <div className="flex h-[650px] bg-[#0a192f]/60 rounded-[3rem] border border-[#64ffda]/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
      {/* Sidebar de Canais */}
      <div className="w-24 md:w-72 border-r border-[#64ffda]/10 bg-black/40 flex flex-col relative">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="hidden md:block text-[10px] font-black text-roasted-gold uppercase tracking-[0.3em]">Comunicações</h3>
          <button 
            onClick={() => setIsSearching(!isSearching)}
            className="p-2 rounded-lg bg-[#64ffda]/10 text-[#64ffda] hover:bg-[#64ffda]/20 transition-all"
            title="Pesquisar Filial"
          >
            {isSearching ? <XMarkIcon className="w-4 h-4" /> : <SearchIcon className="w-4 h-4" />}
          </button>
        </div>

        {/* Interface de Busca de Filiais */}
        {isSearching && (
          <div className="absolute top-[73px] left-0 right-0 bottom-0 z-20 bg-[#0a192f] animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="p-4 border-b border-white/5">
              <input 
                autoFocus
                type="text"
                placeholder="PROCURAR UNIDADE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-[#64ffda]/20 rounded-xl px-4 py-3 text-[10px] font-black text-white outline-none focus:border-[#64ffda] uppercase"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredCities.map(city => (
                <button 
                  key={city}
                  onClick={() => selectUnitChannel(city)}
                  className="w-full flex items-center justify-between p-4 rounded-xl text-left text-white/40 hover:bg-[#64ffda]/10 hover:text-white transition-all group"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest truncate">{city}</span>
                  <ChevronRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <label className="hidden md:block text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-3 ml-2">Canais Públicos</label>
            <button 
              onClick={() => { setActiveChannel('global'); setIsSearching(false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeChannel === 'global' ? 'bg-[#64ffda]/10 text-[#64ffda] border border-[#64ffda]/20' : 'text-white/30 hover:bg-white/5'}`}
            >
              <GlobeIcon className="w-5 h-5 shrink-0" />
              <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">Canal Global</span>
            </button>
            
            <button 
              onClick={() => { selectUnitChannel(currentUserUnit); setIsSearching(false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeChannel === 'unit' && targetUnit === currentUserUnit ? 'bg-[#64ffda]/10 text-[#64ffda] border border-[#64ffda]/20' : 'text-white/30 hover:bg-white/5'}`}
            >
              <DatabaseIcon className="w-5 h-5 shrink-0" />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-widest truncate">Minha Unidade</span>
                <span className="text-[7px] opacity-40 uppercase truncate">{currentUserUnit}</span>
              </div>
            </button>
          </div>

          {activeChannel === 'unit' && targetUnit !== currentUserUnit && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <label className="hidden md:block text-[8px] font-black text-roasted-gold uppercase tracking-[0.3em] mb-3 ml-2">Terminal Consultando</label>
              <button 
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-roasted-gold/10 text-roasted-gold border border-roasted-gold/20"
              >
                <DatabaseIcon className="w-5 h-5 shrink-0" />
                <span className="hidden md:block text-[10px] font-black uppercase tracking-widest truncate">{targetUnit}</span>
              </button>
            </div>
          )}

          <div className="pt-6 border-t border-white/5">
            <label className="hidden md:block text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 ml-2">Comunicação Direta</label>
            <div className="space-y-2">
              {contacts.map(contact => (
                <button 
                  key={contact.username}
                  onClick={() => { setActiveChannel('private'); setSelectedContact(contact.username); setIsSearching(false); }}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${selectedContact === contact.username && activeChannel === 'private' ? 'bg-roasted-gold/10 text-roasted-gold' : 'text-white/30 hover:bg-white/5'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black shrink-0">
                    {contact.profilePic ? (
                      <img src={contact.profilePic} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      contact.username[0]
                    )}
                  </div>
                  <div className="hidden md:flex flex-col text-left overflow-hidden">
                    <span className="text-[9px] font-black uppercase tracking-widest truncate">{contact.username}</span>
                    <span className="text-[7px] text-white/20 uppercase truncate">{contact.role || 'Agente'}</span>
                  </div>
                </button>
              ))}
              {contacts.length === 0 && (
                <p className="hidden md:block text-[8px] text-white/10 uppercase text-center py-6 italic">Nenhum agente ativo</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Área do Chat */}
      <div className="flex-1 flex flex-col bg-black/20 relative">
        <div className="p-8 border-b border-[#64ffda]/10 flex justify-between items-center bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#64ffda]/10 text-[#64ffda]">
              {activeChannel === 'global' ? <GlobeIcon className="w-5 h-5" /> : 
               activeChannel === 'unit' ? <DatabaseIcon className="w-5 h-5" /> : 
               <UserIcon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                {activeChannel === 'global' ? 'Rede Café Três Corações (Brasil)' : 
                 activeChannel === 'unit' ? `Sala de Operações: ${targetUnit}` : 
                 `Criptografia Direta: ${selectedContact}`}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Canal de Comando Ativo</span>
              </div>
            </div>
          </div>
          {activeChannel === 'unit' && targetUnit !== currentUserUnit && (
             <button 
              onClick={() => selectUnitChannel(currentUserUnit)}
              className="text-[9px] font-black text-white/30 hover:text-white uppercase border border-white/10 px-4 py-2 rounded-lg transition-all"
             >
              Voltar para Minha Unidade
             </button>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          {filteredMessages.map((msg, idx) => (
            <div key={msg.id} className={`flex flex-col ${msg.author === currentUser ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-4`} style={{ animationDelay: `${idx * 20}ms` }}>
              <div className="flex items-center gap-3 mb-2 px-1">
                <span className="text-[10px] font-black text-[#64ffda] uppercase tracking-widest">{msg.author}</span>
                <span className="text-[8px] text-white/20 font-black uppercase px-2 py-0.5 bg-white/5 rounded-full border border-white/5">{msg.authorUnit}</span>
              </div>
              <div className={`max-w-[75%] px-6 py-4 rounded-[1.5rem] text-[13px] font-medium shadow-2xl border ${
                msg.author === currentUser ? 
                'bg-gradient-to-br from-[#64ffda]/20 to-[#64ffda]/5 text-white border-[#64ffda]/30 rounded-tr-none' : 
                'bg-white/5 text-white/90 border-white/5 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
              <span className="text-[8px] text-white/10 mt-2 uppercase font-black tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
          {filteredMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <SendIcon className="w-10 h-10" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.6em]">Inicie uma transmissão segura</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-8 bg-black/40 border-t border-white/5 flex gap-4 backdrop-blur-xl">
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={activeChannel === 'private' && !selectedContact}
            placeholder={activeChannel === 'private' && !selectedContact ? "SELECIONE UM AGENTE NA SIDEBAR..." : `MENSAGEM PARA ${activeChannel === 'global' ? 'GLOBAL' : targetUnit.toUpperCase()}...`}
            className="flex-1 bg-black/40 border border-[#64ffda]/20 rounded-2xl px-8 py-5 text-sm text-white outline-none focus:border-[#64ffda] transition-all disabled:opacity-20 placeholder:text-white/10 font-medium"
          />
          <button 
            type="submit" 
            disabled={(activeChannel === 'private' && !selectedContact) || !text.trim()}
            className="w-16 h-16 bg-[#64ffda] text-[#0a192f] rounded-2xl flex items-center justify-center hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-[#64ffda]/20 disabled:opacity-20 disabled:scale-100"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModule;


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChatMessage, City, CITIES, UserAccount } from '../types';
import { SendIcon, GlobeIcon, DatabaseIcon, UserIcon, SearchIcon, XMarkIcon, ChevronRightIcon } from './icons';
import { supabase } from '../supabaseClient';

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
  const [showSidebar, setShowSidebar] = useState(false);
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Realtime subscription for messages
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', table: 'mensagens' },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setRealtimeMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', table: 'mensagens' },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage;
          setRealtimeMessages(prev => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', table: 'mensagens' },
        (payload) => {
          const deletedId = payload.old.id;
          setRealtimeMessages(prev => prev.filter(m => m.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Merge props messages with realtime messages
  const allMessages = useMemo(() => {
    const combined = [...messages, ...realtimeMessages];
    // Remove duplicates by ID and sort by timestamp
    const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
    return unique.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, realtimeMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages, activeChannel, selectedContact, targetUnit]);

  const filteredMessages = useMemo(() => {
    return allMessages.filter(msg => {
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
    <div className="flex flex-col md:flex-row h-[80vh] md:h-[650px] bg-[#0a192f]/60 rounded-2xl md:rounded-[3rem] border border-[#64ffda]/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 relative">
      {/* Mobile Header Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 bg-black/60 border-b border-[#64ffda]/10 z-30">
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="flex items-center gap-2 text-[#64ffda] font-black text-[10px] uppercase tracking-widest"
          >
            <div className="w-8 h-8 rounded-lg bg-[#64ffda]/10 flex items-center justify-center">
              <SearchIcon className="w-4 h-4" />
            </div>
          </button>
        </div>
        <div className="text-center flex-1">
          <h3 className="text-[10px] font-black text-white uppercase truncate px-2">
            {activeChannel === 'global' ? 'Global' : activeChannel === 'unit' ? targetUnit : selectedContact}
          </h3>
        </div>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('back-to-menu'))}
          className="text-white/40 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
        >
          Sair
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            <XMarkIcon className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Sidebar de Canais */}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} absolute md:relative inset-0 md:inset-auto z-40 w-full md:w-72 border-r border-[#64ffda]/10 bg-[#0a192f] md:bg-black/40 flex flex-col transition-transform duration-300`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-roasted-gold uppercase tracking-[0.3em]">Comunicações</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsSearching(!isSearching)}
              className="p-3 md:p-2 rounded-lg bg-[#64ffda]/10 text-[#64ffda] hover:bg-[#64ffda]/20 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Pesquisar Filial"
            >
              {isSearching ? <XMarkIcon className="w-5 h-5 md:w-4 md:h-4" /> : <SearchIcon className="w-5 h-5 md:w-4 md:h-4" />}
            </button>
            <button 
              onClick={() => setShowSidebar(false)}
              className="md:hidden p-3 rounded-lg bg-white/5 text-white/40 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
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
                className="w-full bg-black/40 border border-[#64ffda]/20 rounded-xl px-4 py-4 text-[12px] md:text-[10px] font-black text-white outline-none focus:border-[#64ffda] uppercase"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredCities.map(city => (
                <button 
                  key={city}
                  onClick={() => { selectUnitChannel(city); setShowSidebar(false); }}
                  className="w-full flex items-center justify-between p-5 md:p-4 rounded-xl text-left text-white/40 hover:bg-[#64ffda]/10 hover:text-white transition-all group min-h-[50px]"
                >
                  <span className="text-[11px] md:text-[10px] font-black uppercase tracking-widest truncate">{city}</span>
                  <ChevronRightIcon className="w-4 h-4 md:w-3 md:h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-3 ml-2 block">Canais Públicos</label>
            <button 
              onClick={() => { setActiveChannel('global'); setIsSearching(false); setShowSidebar(false); }}
              className={`w-full flex items-center gap-4 p-5 md:p-4 rounded-2xl transition-all min-h-[60px] ${activeChannel === 'global' ? 'bg-[#64ffda]/10 text-[#64ffda] border border-[#64ffda]/20' : 'text-white/30 hover:bg-white/5'}`}
            >
              <GlobeIcon className="w-6 h-6 md:w-5 md:h-5 shrink-0" />
              <span className="text-[11px] md:text-[10px] font-black uppercase tracking-widest">Canal Global</span>
            </button>
            
            <button 
              onClick={() => { selectUnitChannel(currentUserUnit); setIsSearching(false); setShowSidebar(false); }}
              className={`w-full flex items-center gap-4 p-5 md:p-4 rounded-2xl transition-all min-h-[60px] ${activeChannel === 'unit' && targetUnit === currentUserUnit ? 'bg-[#64ffda]/10 text-[#64ffda] border border-[#64ffda]/20' : 'text-white/30 hover:bg-white/5'}`}
            >
              <DatabaseIcon className="w-6 h-6 md:w-5 md:h-5 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[11px] md:text-[10px] font-black uppercase tracking-widest truncate">Minha Unidade</span>
                <span className="text-[8px] md:text-[7px] opacity-40 uppercase truncate">{currentUserUnit}</span>
              </div>
            </button>
          </div>

          {activeChannel === 'unit' && targetUnit !== currentUserUnit && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <label className="text-[8px] font-black text-roasted-gold uppercase tracking-[0.3em] mb-3 ml-2 block">Terminal Consultando</label>
              <button 
                className="w-full flex items-center gap-4 p-5 md:p-4 rounded-2xl bg-roasted-gold/10 text-roasted-gold border border-roasted-gold/20 min-h-[60px]"
              >
                <DatabaseIcon className="w-6 h-6 md:w-5 md:h-5 shrink-0" />
                <span className="text-[11px] md:text-[10px] font-black uppercase tracking-widest truncate">{targetUnit}</span>
              </button>
            </div>
          )}

          <div className="pt-6 border-t border-white/5">
            <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 ml-2 block">Comunicação Direta</label>
            <div className="space-y-2">
              {contacts.map(contact => (
                <button 
                  key={contact.username}
                  onClick={() => { setActiveChannel('private'); setSelectedContact(contact.username); setIsSearching(false); setShowSidebar(false); }}
                  className={`w-full flex items-center gap-4 p-4 md:p-3 rounded-xl transition-all min-h-[60px] ${selectedContact === contact.username && activeChannel === 'private' ? 'bg-roasted-gold/10 text-roasted-gold' : 'text-white/30 hover:bg-white/5'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black shrink-0">
                    {contact.profilePic ? (
                      <img src={contact.profilePic} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      contact.username[0]
                    )}
                  </div>
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[10px] md:text-[9px] font-black uppercase tracking-widest truncate">{contact.username}</span>
                    <span className="text-[8px] md:text-[7px] text-white/20 uppercase truncate">{contact.role || 'Agente'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Área do Chat */}
      <div className="flex-1 flex flex-col bg-black/20 relative min-h-0">
        <div className="p-4 md:p-8 border-b border-[#64ffda]/10 flex justify-between items-center bg-black/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 rounded-xl bg-[#64ffda]/10 text-[#64ffda]">
              {activeChannel === 'global' ? <GlobeIcon className="w-4 h-4 md:w-5 md:h-5" /> : 
               activeChannel === 'unit' ? <DatabaseIcon className="w-4 h-4 md:w-5 md:h-5" /> : 
               <UserIcon className="w-4 h-4 md:w-5 md:h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-[11px] md:text-sm font-black text-white uppercase tracking-widest truncate max-w-[200px] md:max-w-none">
                {activeChannel === 'global' ? 'Rede Café Três Corações (Brasil)' : 
                 activeChannel === 'unit' ? `Sala: ${targetUnit}` : 
                 `Privado: ${selectedContact}`}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[7px] md:text-[8px] font-black text-white/30 uppercase tracking-widest">Ativo</span>
              </div>
            </div>
          </div>
          {activeChannel === 'unit' && targetUnit !== currentUserUnit && (
             <button 
              onClick={() => selectUnitChannel(currentUserUnit)}
              className="hidden md:block text-[9px] font-black text-white/30 hover:text-white uppercase border border-white/10 px-4 py-2 rounded-lg transition-all"
             >
              Voltar
             </button>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-8 custom-scrollbar">
          {filteredMessages.map((msg, idx) => (
            <div key={msg.id} className={`flex flex-col ${msg.author === currentUser ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-4`} style={{ animationDelay: `${idx * 20}ms` }}>
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2 px-1">
                <span className="text-[9px] md:text-[10px] font-black text-[#64ffda] uppercase tracking-widest">{msg.author}</span>
                <span className="text-[7px] md:text-[8px] text-white/20 font-black uppercase px-2 py-0.5 bg-white/5 rounded-full border border-white/5">{msg.authorUnit}</span>
              </div>
              <div className={`max-w-[85%] md:max-w-[75%] px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-[1.5rem] text-[12px] md:text-[13px] font-medium shadow-2xl border ${
                msg.author === currentUser ? 
                'bg-gradient-to-br from-[#64ffda]/20 to-[#64ffda]/5 text-white border-[#64ffda]/30 rounded-tr-none' : 
                'bg-white/5 text-white/90 border-white/5 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
              <span className="text-[7px] md:text-[8px] text-white/10 mt-1.5 md:mt-2 uppercase font-black tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
          {filteredMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/5 flex items-center justify-center mb-4 md:mb-6">
                <SendIcon className="w-6 h-6 md:w-10 md:h-10" />
              </div>
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-center">Inicie uma transmissão segura</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 md:p-8 bg-black/40 border-t border-white/5 flex gap-2 md:gap-4 backdrop-blur-xl shrink-0">
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={activeChannel === 'private' && !selectedContact}
            placeholder={activeChannel === 'private' && !selectedContact ? "SELECIONE UM AGENTE..." : `MENSAGEM...`}
            className="flex-1 bg-black/40 border border-[#64ffda]/20 rounded-xl md:rounded-2xl px-5 md:px-8 py-4 md:py-5 text-sm text-white outline-none focus:border-[#64ffda] transition-all disabled:opacity-20 placeholder:text-white/10 font-medium min-h-[50px]"
          />
          <button 
            type="submit" 
            disabled={(activeChannel === 'private' && !selectedContact) || !text.trim()}
            className="w-14 h-14 md:w-16 md:h-16 bg-[#64ffda] text-[#0a192f] rounded-xl md:rounded-2xl flex items-center justify-center hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-[#64ffda]/20 disabled:opacity-20 disabled:scale-100 shrink-0"
          >
            <SendIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModule;

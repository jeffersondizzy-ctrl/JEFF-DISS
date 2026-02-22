
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { Announcement, UserAccount } from '../types';
import { MailIcon, PlusIcon, XMarkIcon, UserIcon, SearchIcon, SendIcon } from './icons';

interface AnnouncementsModuleProps {
  announcements: Announcement[];
  users: UserAccount[];
  currentUser: string;
  currentUserUnit: string;
  onAddAnnouncement: (announcement: Omit<Announcement, 'id' | 'timestamp'>) => void;
}

const inputStyle = "w-full bg-black/40 border border-roasted-gold/20 rounded-xl px-5 py-4 text-sm focus:border-roasted-gold outline-none transition-all placeholder:text-white/10 text-white font-bold uppercase tracking-wider";
const labelStyle = "text-[10px] font-black text-roasted-gold uppercase tracking-[0.2em] mb-2 block ml-1 opacity-70";

const AnnouncementsModule: React.FC<AnnouncementsModuleProps> = ({ 
  announcements, 
  users, 
  currentUser, 
  currentUserUnit,
  onAddAnnouncement 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return [];
    return users.filter(u => 
      u.username.toUpperCase().includes(userSearch.toUpperCase()) || 
      u.fullName?.toUpperCase().includes(userSearch.toUpperCase())
    ).filter(u => !selectedUsers.includes(u.username));
  }, [users, userSearch, selectedUsers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !text || selectedUsers.length === 0) {
      alert("PREENCHA ASSUNTO, TEXTO E MARQUE PELO MENOS UM DESTINATÁRIO.");
      return;
    }

    onAddAnnouncement({
      author: currentUser,
      authorUnit: currentUserUnit,
      subject: subject.toUpperCase(),
      text,
      taggedUsers: selectedUsers
    });

    setSubject('');
    setText('');
    setSelectedUsers([]);
    setShowModal(false);
  };

  const toggleUser = (username: string) => {
    setSelectedUsers(prev => 
      prev.includes(username) ? prev.filter(u => u !== username) : [...prev, username]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-black/40 p-8 rounded-[2.5rem] border border-roasted-gold/10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-roasted-gold/10 rounded-full flex items-center justify-center border border-roasted-gold/20">
            <MailIcon className="w-8 h-8 text-roasted-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">Comunicados</h2>
            <p className="text-[10px] text-roasted-gold/50 font-black uppercase tracking-[0.5em] mt-2">Divulgação de Informações e Alertas</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="coffee-button px-8 py-4 text-[10px] flex items-center gap-3"
        >
          <PlusIcon className="w-4 h-4" /> NOVO COMUNICADO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {announcements.map((ann) => (
          <div key={ann.id} className="coffee-panel p-8 border border-white/5 hover:border-roasted-gold/30 transition-all flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">
                  {new Date(ann.timestamp).toLocaleString()}
                </span>
                <div className="px-2 py-1 bg-roasted-gold/10 border border-roasted-gold/20 rounded text-[7px] font-black text-roasted-gold uppercase">
                  {ann.authorUnit}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-base font-black text-white uppercase tracking-tight">{ann.subject}</h3>
                <p className="text-[11px] text-white/60 leading-relaxed line-clamp-4">{ann.text}</p>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <UserIcon className="w-3 h-3 text-roasted-gold/40" />
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Destinatários:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ann.taggedUsers.map(user => (
                    <span key={user} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[7px] font-black text-white/40 uppercase">
                      @{user}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-roasted-gold/10 flex items-center justify-center text-roasted-gold font-black text-xs">
                {ann.author.substring(0, 1)}
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase">{ann.author}</p>
                <p className="text-[8px] text-white/30 uppercase font-black">Autor do Comunicado</p>
              </div>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="col-span-full py-40 text-center opacity-20">
            <MailIcon className="w-16 h-16 mx-auto mb-6" />
            <p className="text-sm font-black uppercase tracking-[0.5em]">Nenhum comunicado divulgado até o momento</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="w-full max-w-2xl coffee-panel p-12 border border-roasted-gold/20 relative">
            <button 
              type="button" 
              onClick={() => setShowModal(false)} 
              className="absolute top-8 right-8 text-white/20 hover:text-white"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            
            <h2 className="text-xl font-black text-roasted-gold uppercase tracking-[0.3em] mb-10 text-center">Novo Comunicado</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className={labelStyle}>Assunto do Comunicado</label>
                  <input 
                    required 
                    className={inputStyle} 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)} 
                    placeholder="EX: MANUTENÇÃO DE SISTEMA..." 
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelStyle}>Conteúdo da Mensagem</label>
                  <textarea 
                    required 
                    className={`${inputStyle} h-48 resize-none py-4`} 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    placeholder="DESCREVA O COMUNICADO AQUI..." 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className={labelStyle}>Marcar Usuários (Para)</label>
                  <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="text" 
                      className={`${inputStyle} pl-12 py-3`} 
                      value={userSearch} 
                      onChange={e => setUserSearch(e.target.value)} 
                      placeholder="PROCURAR AGENTE..." 
                    />
                  </div>
                  
                  {filteredUsers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-[#120A07] border border-roasted-gold/20 rounded-xl max-h-40 overflow-y-auto shadow-2xl custom-scrollbar">
                      {filteredUsers.map(u => (
                        <div 
                          key={u.username} 
                          onClick={() => toggleUser(u.username)}
                          className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                        >
                          <p className="text-[10px] font-black text-white uppercase">{u.username}</p>
                          <p className="text-[8px] text-white/30 uppercase">{u.fullName || 'SEM NOME'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className={labelStyle}>Destinatários Selecionados</label>
                  <div className="bg-black/40 border border-white/5 rounded-xl p-4 min-h-[120px] flex flex-wrap gap-2 content-start">
                    {selectedUsers.map(username => (
                      <div key={username} className="flex items-center gap-2 bg-roasted-gold/10 border border-roasted-gold/20 px-3 py-1.5 rounded-lg">
                        <span className="text-[9px] font-black text-roasted-gold uppercase">@{username}</span>
                        <button type="button" onClick={() => toggleUser(username)} className="text-roasted-gold/40 hover:text-roasted-gold">
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {selectedUsers.length === 0 && (
                      <span className="text-[10px] text-white/10 font-black uppercase italic">Nenhum usuário marcado...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full coffee-button py-5 text-xs flex items-center justify-center gap-4">
              <SendIcon className="w-4 h-4" /> DIVULGAR COMUNICADO
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsModule;

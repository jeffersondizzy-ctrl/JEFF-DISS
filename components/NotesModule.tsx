
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { UserNote } from '../types';
import { NoteIcon, PlusIcon, TrashIcon, SparklesIcon, XMarkIcon } from './icons';

interface NotesModuleProps {
  currentUser: string;
}

const STORAGE_NOTES_PREFIX = 'pre_alerta_gr_notes_v1_';

const NotesModule: React.FC<NotesModuleProps> = ({ currentUser }) => {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use ReturnType<typeof setTimeout> to avoid Namespace 'global.NodeJS' has no exported member 'Timeout' error
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem(`${STORAGE_NOTES_PREFIX}${currentUser.toUpperCase()}`);
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Error loading notes", e);
      }
    }
  }, [currentUser]);

  const saveToStorage = (updatedNotes: UserNote[]) => {
    localStorage.setItem(`${STORAGE_NOTES_PREFIX}${currentUser.toUpperCase()}`, JSON.stringify(updatedNotes));
    setIsSaving(false);
  };

  const handleUpdateNoteText = (id: string, text: string) => {
    const now = new Date().toISOString();
    const updatedNotes = notes.map(n => n.id === id ? { ...n, text, lastUpdated: now } : n);
    setNotes(updatedNotes);
    
    // Auto-save with debounce
    setIsSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage(updatedNotes);
    }, 1500);
  };

  const createNote = () => {
    const now = new Date().toISOString();
    const newNote: UserNote = {
      id: crypto.randomUUID(),
      text: '',
      timestamp: now,
      lastUpdated: now
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setActiveNoteId(newNote.id);
    saveToStorage(updatedNotes);
  };

  const deleteNote = (id: string) => {
    if (window.confirm("Deseja excluir esta anotação permanentemente?")) {
      const updatedNotes = notes.filter(n => n.id !== id);
      setNotes(updatedNotes);
      if (activeNoteId === id) setActiveNoteId(null);
      saveToStorage(updatedNotes);
    }
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  return (
    <div className="flex h-[700px] bg-black/20 rounded-[3rem] border border-roasted-gold/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-700">
      {/* Sidebar List */}
      <div className="w-80 border-r border-white/5 bg-black/40 flex flex-col">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-black text-roasted-gold uppercase tracking-[0.3em]">Bloco de Notas</h3>
            <p className="text-[8px] text-white/20 uppercase font-black tracking-widest mt-1">Dados Sigilosos: {currentUser}</p>
          </div>
          <button 
            onClick={createNote}
            className="w-10 h-10 bg-roasted-gold text-espresso-dark rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-roasted-gold/20"
            title="Nova Anotação"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {notes.map(note => (
            <div 
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`p-5 rounded-2xl cursor-pointer border transition-all group relative ${
                activeNoteId === note.id 
                  ? 'bg-roasted-gold/10 border-roasted-gold/40' 
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">
                  {new Date(note.lastUpdated).toLocaleDateString()}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                  className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity"
                >
                  <TrashIcon className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
              <p className="text-[11px] text-white/80 font-medium line-clamp-2 leading-relaxed">
                {note.text || <span className="italic opacity-30 tracking-widest">Anotação vazia...</span>}
              </p>
              <span className="text-[7px] font-black text-white/10 uppercase tracking-widest mt-2 block">
                Atualizado: {new Date(note.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-6">
              <NoteIcon className="w-10 h-10 mb-4" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em]">Nenhuma anotação pessoal registrada.</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-black/10 relative">
        {activeNote ? (
          <>
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-roasted-gold/10 rounded-2xl flex items-center justify-center text-roasted-gold border border-roasted-gold/20 shadow-xl">
                  <NoteIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Editor de Notas</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                      Criado em: {new Date(activeNote.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {isSaving && (
                  <div className="flex items-center gap-2 animate-in fade-in">
                    <div className="w-1.5 h-1.5 bg-roasted-gold rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-black text-roasted-gold uppercase tracking-[0.2em]">Salvando...</span>
                  </div>
                )}
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                   <SparklesIcon className="w-3 h-3 text-roasted-gold" />
                   <span className="text-[8px] font-black text-white/40 uppercase tracking-widest italic">Criptografia Local Ativa</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-10 flex flex-col">
              <textarea 
                value={activeNote.text}
                onChange={(e) => handleUpdateNoteText(activeNote.id, e.target.value)}
                placeholder="Comece a escrever suas anotações estratégicas aqui..."
                className="flex-1 bg-transparent border-none outline-none resize-none text-white/90 text-sm leading-relaxed font-medium placeholder:text-white/5 custom-scrollbar"
                autoFocus
              />
            </div>

            <div className="p-6 bg-black/20 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-white/10 uppercase tracking-[0.4em]">
               <span>SISTEMA DE ANOTAÇÕES INDIVIDUAIS</span>
               <span className="text-white/30 italic">Última Modificação: {new Date(activeNote.lastUpdated).toLocaleString()}</span>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-20 animate-pulse">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10 shadow-2xl">
               <NoteIcon className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-lg font-black text-white/20 uppercase tracking-[0.5em]">Selecione ou Crie uma Nota</h3>
            <p className="max-w-xs text-[9px] text-white/10 uppercase font-black leading-relaxed mt-4">
              Suas anotações são armazenadas localmente no seu dispositivo e vinculadas exclusivamente ao seu perfil de acesso.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesModule;

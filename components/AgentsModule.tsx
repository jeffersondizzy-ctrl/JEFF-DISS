
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useMemo } from 'react';
import { UserAccount } from '../types';
import { UserIcon, DatabaseIcon, SparklesIcon, StarIcon, MessageCircleIcon, XMarkIcon, SendIcon, UsersIcon } from './icons';

const STORAGE_USERS_KEY = 'pre_alerta_gr_agent_registry_v2';
const STORAGE_REVIEWS_KEY = 'pre_alerta_gr_agent_reviews_v1';

interface AgentReview {
  id: string;
  fromUser: string;
  toUser: string;
  rating: number;
  comment: string;
  emoji: string;
  timestamp: string;
}

interface AgentsModuleProps {
  currentUser: string;
  agents: UserAccount[];
  reviews: AgentReview[];
  onUpdateReviews: (reviews: AgentReview[]) => void;
}

const EMOJI_OPTIONS = [
  { char: '🚀', label: 'Eficiência' },
  { char: '🛡️', label: 'Segurança' },
  { char: '🤝', label: 'Colaboração' },
  { char: '💎', label: 'Excelência' },
  { char: '☕', label: 'Foco' }
];

const AgentsModule: React.FC<AgentsModuleProps> = ({ currentUser, agents, reviews, onUpdateReviews }) => {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<string | null>(null);
  const [selectedAgentForReviews, setSelectedAgentForReviews] = useState<string | null>(null);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💎');

  const filteredAgents = useMemo(() => {
    return agents.filter(u => u.username.toUpperCase() !== 'ADMIN');
  }, [agents]);

  const saveReview = () => {
    if (!isRatingModalOpen) return;
    
    const newReview: AgentReview = {
      id: crypto.randomUUID(),
      fromUser: currentUser,
      toUser: isRatingModalOpen,
      rating,
      comment,
      emoji: selectedEmoji,
      timestamp: new Date().toISOString()
    };

    const updatedReviews = [...reviews, newReview];
    onUpdateReviews(updatedReviews);
    
    // Reset and close
    setIsRatingModalOpen(null);
    setRating(5);
    setComment('');
    setSelectedEmoji('💎');
    alert("Avaliação transmitida com sucesso!");
  };

  const getAgentStats = (username: string) => {
    const agentReviews = reviews.filter(r => r.toUser === username);
    const avgRating = agentReviews.length > 0 
      ? agentReviews.reduce((acc, r) => acc + r.rating, 0) / agentReviews.length 
      : 0;
    
    // Platinum Score: Nota baseada em média + volume de feedback (0-1000)
    const score = Math.min(1000, Math.round((avgRating * 160) + (agentReviews.length * 20)));
    
    return { avgRating, count: agentReviews.length, score };
  };

  const StarRating = ({ value, onChange, size = "w-4 h-4", interactive = false }: { value: number, onChange?: (v: number) => void, size?: string, interactive?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={`transition-all duration-300 ${interactive ? 'hover:scale-125 active:scale-90' : ''}`}
        >
          <StarIcon 
            className={`${size} ${star <= value ? 'fill-roasted-gold text-roasted-gold filter drop-shadow-[0_0_5px_rgba(192,149,92,0.6)]' : 'text-white/10'}`} 
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
        <div className="w-20 h-20 bg-roasted-gold/10 rounded-full flex items-center justify-center border border-roasted-gold/20 shadow-2xl relative">
          <div className="absolute inset-0 border border-roasted-gold/30 rounded-full animate-ping opacity-20"></div>
          <UsersIcon className="w-10 h-10 text-roasted-gold" />
        </div>
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">Corpo de Agentes</h2>
          <p className="text-[9px] text-roasted-gold/50 font-black uppercase tracking-[0.5em] mt-3">Feedback e Reconhecimento entre Pares</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredAgents.map((agent, idx) => {
          const stats = getAgentStats(agent.username);
          return (
            <div 
              key={agent.username}
              className="coffee-panel group relative overflow-hidden flex flex-col items-center p-10 transition-all duration-500 hover:border-roasted-gold/40 hover:-translate-y-1 animate-in slide-in-from-bottom-8"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Score Badge */}
              <div className="absolute top-6 left-6 flex flex-col items-start">
                 <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Platinum Score</span>
                 <div className="bg-black/60 border border-roasted-gold/30 px-3 py-1 rounded-lg">
                    <span className="text-sm font-black text-roasted-gold italic tracking-tighter">{stats.score}</span>
                 </div>
              </div>

              {/* Profile Image */}
              <div className="relative mb-8">
                <div className="w-32 h-32 rounded-full border-2 border-roasted-gold/20 p-1.5 transition-transform duration-700 group-hover:scale-105 group-hover:border-roasted-gold/60">
                  <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center shadow-2xl">
                    {agent.profilePic ? (
                      <img src={agent.profilePic} className="w-full h-full object-cover" alt={agent.username} />
                    ) : (
                      <UserIcon className="w-12 h-12 text-white/5" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-roasted-gold text-espresso-dark w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border-4 border-espresso-dark">
                  <span className="text-lg">💎</span>
                </div>
              </div>

              {/* Info */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {agent.fullName || agent.username}
                </h3>
                <div className="flex flex-col items-center gap-2">
                   <span className="text-[10px] font-black text-roasted-gold/60 uppercase tracking-widest bg-roasted-gold/5 px-4 py-1 rounded-full border border-roasted-gold/10">
                    {agent.role || 'AGENTE DE RISCO'}
                   </span>
                   <StarRating value={Math.round(stats.avgRating)} />
                   <button 
                    onClick={() => setSelectedAgentForReviews(agent.username)}
                    className="text-[8px] font-black text-white/40 uppercase tracking-widest hover:text-roasted-gold transition-colors"
                   >
                     {stats.count} AVALIAÇÕES RECEBIDAS
                   </button>
                </div>
              </div>

              {/* Units */}
              <div className="mt-8 w-full">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <DatabaseIcon className="w-3 h-3 text-roasted-gold/40" />
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Filiais de Atuação</span>
                  <div className="flex-1 h-[1px] bg-white/5"></div>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {agent.units.map(unit => (
                    <span key={unit} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[8px] font-black text-white/60 uppercase tracking-widest">
                      {unit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-10 grid grid-cols-2 gap-4 w-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <button 
                  onClick={() => setIsRatingModalOpen(agent.username)}
                  className="bg-roasted-gold text-espresso-dark py-3 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl shadow-roasted-gold/10"
                >
                  <StarIcon className="w-3.5 h-3.5 fill-current" /> AVALIAR
                </button>
                <button 
                  onClick={() => setSelectedAgentForReviews(agent.username)}
                  className="bg-white/5 text-white/60 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                >
                  <MessageCircleIcon className="w-3.5 h-3.5" /> MURAL
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Avaliação */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-lg coffee-panel p-12 relative border-roasted-gold/30">
              <button onClick={() => setIsRatingModalOpen(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                <XMarkIcon className="w-8 h-8" />
              </button>
              
              <div className="text-center mb-10">
                <h3 className="text-xl font-black text-roasted-gold uppercase tracking-[0.3em] mb-2">Avaliar Agente</h3>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest italic">A @{isRatingModalOpen} receberá este feedback</p>
              </div>

              <div className="space-y-10">
                <div className="flex flex-col items-center gap-4">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">Nível de Performance</label>
                  <StarRating value={rating} onChange={setRating} size="w-10 h-10" interactive />
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] block text-center">Reação Rápida</label>
                  <div className="flex justify-center gap-3">
                    {EMOJI_OPTIONS.map(opt => (
                      <button 
                        key={opt.char}
                        type="button"
                        onClick={() => setSelectedEmoji(opt.char)}
                        className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${selectedEmoji === opt.char ? 'bg-roasted-gold text-espresso-dark scale-110 shadow-xl' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                      >
                        <span className="text-xl mb-1">{opt.char}</span>
                        <span className="text-[6px] font-black uppercase">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] block">Mensagem Técnica</label>
                   <textarea 
                    value={comment}
                    onChange={e => setComment(e.target.value.toUpperCase())}
                    placeholder="DESCREVA A ATUAÇÃO DO COLEGA..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-xs text-white outline-none focus:border-roasted-gold transition-all h-32 resize-none uppercase"
                   />
                </div>

                <button 
                  onClick={saveReview}
                  className="w-full py-6 bg-roasted-gold text-espresso-dark rounded-2xl font-black uppercase tracking-[0.5em] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-roasted-gold/20 flex items-center justify-center gap-4"
                >
                  <SendIcon className="w-5 h-5" /> TRANSMITIR FEEDBACK
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Mural de Feedbacks */}
      {selectedAgentForReviews && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-2xl coffee-panel h-[80vh] flex flex-col border-roasted-gold/20">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/40">
                <div>
                   <h3 className="text-xl font-black text-white uppercase tracking-widest">Mural de Reconhecimento</h3>
                   <p className="text-[10px] text-roasted-gold uppercase font-black tracking-widest mt-1">Histórico de @{selectedAgentForReviews}</p>
                </div>
                <button onClick={() => setSelectedAgentForReviews(null)} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                {reviews.filter(r => r.toUser === selectedAgentForReviews).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(r => (
                  <div key={r.id} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-roasted-gold/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000"></div>
                     
                     <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="flex items-center gap-4">
                           <div className="text-3xl">{r.emoji}</div>
                           <div>
                              <StarRating value={r.rating} size="w-3 h-3" />
                              <span className="text-[9px] font-black text-white/30 uppercase mt-1 block">POR: @{r.fromUser}</span>
                           </div>
                        </div>
                        <span className="text-[8px] font-black text-white/10 uppercase">{new Date(r.timestamp).toLocaleDateString()}</span>
                     </div>

                     <p className="text-sm font-medium text-white/70 italic leading-relaxed relative z-10">"{r.comment || 'SEM COMENTÁRIO TÉCNICO REGISTRADO.'}"</p>
                  </div>
                ))}

                {reviews.filter(r => r.toUser === selectedAgentForReviews).length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-20">
                     <MessageCircleIcon className="w-16 h-16 mb-6" />
                     <p className="text-xs font-black uppercase tracking-[0.5em]">Este agente ainda não recebeu feedbacks na rede</p>
                  </div>
                )}
              </div>

              <div className="p-8 bg-black/60 border-t border-white/5 text-center">
                 <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">PLATINUM NETWORK • MONITORAMENTO DE PERFORMANCE</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AgentsModule;

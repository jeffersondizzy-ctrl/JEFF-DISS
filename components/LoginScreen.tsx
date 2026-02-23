
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import Logo3D from './Logo3D';
import { KeyIcon, PlusIcon, XMarkIcon, DatabaseIcon, ChevronRightIcon } from './icons';
import { City, UserAccount } from '../types';
import { CityDropdown } from './LogisticsForm';

interface LoginScreenProps {
  onLogin: (user: string, unit: string, pass: string) => void;
  allUsers: UserAccount[];
  onSignup: (newUser: UserAccount) => void;
  loginError?: string;
  isDataLoaded?: boolean;
}

const MASTER_SECURITY_KEY = 'Gerenciamento*@2026';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, allUsers, onSignup, loginError, isDataLoaded }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [login, setLogin] = useState('');
  const [signupUnits, setSignupUnits] = useState<City[]>(['' as City]);
  const [password, setPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [visuals, setVisuals] = useState<{grains: any[], clouds: any[]}>({grains: [], clouds: []});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loginError) {
      setError(loginError);
      setLoading(false);
    } else {
      // If loginError is cleared, it means a new attempt started or was reset
      // We don't necessarily want to set loading to false here because handleLogin sets it to true
    }
  }, [loginError]);

  useEffect(() => {
    const grains = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      bottom: '-5%',
      delay: Math.random() * 20 + 's',
      duration: 15 + Math.random() * 15 + 's',
      scale: 0.4 + Math.random() * 0.6
    }));

    const clouds = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: 10 + Math.random() * 80 + '%',
      bottom: 10 + Math.random() * 20 + '%',
      delay: Math.random() * 10 + 's',
      size: 150 + Math.random() * 150 + 'px'
    }));

    setVisuals({ grains, clouds });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    onLogin(login, signupUnits[0] || ('' as City), password);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validUnits = signupUnits.filter(u => (u as string) !== '');
    if (validUnits.length === 0) {
      setError('ERRO: SELECIONE AO MENOS UMA UNIDADE');
      setLoading(false);
      return;
    }

    const nameRegex = /^[a-zA-ZÀ-ÿ]+$/;
    if (!nameRegex.test(login)) {
      setError('ERRO: USE APENAS SEU NOME (SEM NÚMEROS OU CÓDIGOS)');
      setLoading(false);
      return;
    }

    if (masterKey !== MASTER_SECURITY_KEY) {
      setError('ERRO: CREDENCIAL DE SEGURANÇA INVÁLIDA');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const normalizedUsername = login.toUpperCase().trim();
      
      if (allUsers.some(u => u.username.toUpperCase() === normalizedUsername)) {
        setError('ERRO: ESTE AGENTE JÁ ESTÁ CADASTRADO');
        setLoading(false);
        return;
      }

      const newUser: UserAccount = { 
        username: normalizedUsername, 
        units: validUnits,
        personalPassword: password 
      };
      
      onSignup(newUser);
      
      setLoading(false);
      setActiveTab('login');
      setLogin('');
      setPassword('');
      setMasterKey('');
      setSignupUnits(['' as City]);
      alert("ALISTAMENTO CONCLUÍDO. AGENTE VINCULADO ÀS UNIDADES SELECIONADAS.");
    }, 1000);
  };

  const addUnitField = () => setSignupUnits([...signupUnits, '' as City]);
  const removeUnitField = (index: number) => {
    if (signupUnits.length > 1) {
      setSignupUnits(signupUnits.filter((_, i) => i !== index));
    }
  };
  const updateUnitField = (index: number, val: City) => {
    const newList = [...signupUnits];
    newList[index] = val;
    setSignupUnits(newList);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#120A07] relative overflow-hidden px-4 py-10">
      {/* Real-time Clock */}
      <div className="absolute top-6 right-6 z-30 text-right hidden md:block">
        <div className="text-roasted-gold font-black text-xl tracking-tighter leading-none drop-shadow-[0_0_10px_rgba(192,149,92,0.3)]">
          {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mt-2 flex items-center justify-end gap-2">
          <span className="w-6 h-[1px] bg-roasted-gold/20"></span>
          {currentTime.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase()} {currentTime.toLocaleDateString('pt-BR')}
          {!isDataLoaded && (
            <div className="ml-2 w-2 h-2 bg-roasted-gold rounded-full animate-pulse" title="Sincronizando dados..."></div>
          )}
        </div>
      </div>

      {/* Mobile Clock */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 md:hidden text-center">
        <div className="text-roasted-gold font-black text-base tracking-tighter">
          {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-white/30 text-[8px] font-bold uppercase tracking-widest">
          {currentTime.toLocaleDateString('pt-BR')}
        </div>
      </div>
      {visuals.grains.map(g => (
        <div key={`grain-${g.id}`} className="floating-grain" style={{ left: g.left, bottom: g.bottom, animation: `grain-float ${g.duration} infinite linear`, animationDelay: g.delay, transform: `scale(${g.scale})` }} />
      ))}
      {visuals.clouds.map(c => (
        <div key={`aroma-${c.id}`} className="aroma-cloud" style={{ left: c.left, bottom: c.bottom, width: c.size, height: c.size, animationDelay: c.delay }} />
      ))}

      <div className="z-20 flex flex-col items-center mb-6 text-center animate-in fade-in duration-700">
        <div className="relative mb-4 p-4 bg-black/40 rounded-full border border-roasted-gold/20 shadow-xl">
          <Logo3D className="w-16 h-16" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white mb-1 brand-text">
          PRÉ ALERTA GR
        </h1>
        <p className="text-[9px] font-black text-roasted-gold/60 uppercase tracking-[0.4em]">
          CAFÉ TRÊS CORAÇÕES
        </p>
      </div>

      <div className="flex p-1 bg-black/60 backdrop-blur-xl rounded-2xl mb-6 w-full max-w-[380px] z-10 border border-white/5 shadow-2xl">
        <button onClick={() => { setActiveTab('login'); setError(''); }} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 ${activeTab === 'login' ? 'bg-roasted-gold text-espresso-dark shadow-xl scale-105' : 'text-white/30 hover:text-white'}`}>
          <KeyIcon className="w-3 h-3" /> LOGIN
        </button>
        <button onClick={() => { setActiveTab('signup'); setError(''); }} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 ${activeTab === 'signup' ? 'bg-roasted-gold text-espresso-dark shadow-xl scale-105' : 'text-white/30 hover:text-white'}`}>
          <PlusIcon className="w-3 h-3" /> CADASTRO
        </button>
      </div>
      
      <div className="w-full max-w-[380px] z-10">
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="coffee-panel p-8 flex flex-col items-center animate-in slide-in-from-left-4 fade-in duration-500 rounded-[2.5rem] border-roasted-gold/20 shadow-2xl">
            <div className="w-full space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">Acesso Seguro</h2>
                <div className="h-0.5 w-8 bg-roasted-gold/40 mx-auto mt-2"></div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-roasted-gold uppercase tracking-[0.3em] ml-1 opacity-60">ID do Agente</label>
                <input required type="text" placeholder="SEU NOME" value={login} onChange={e => setLogin(e.target.value)} className="w-full coffee-input outline-none !py-3 !text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-roasted-gold uppercase tracking-[0.3em] ml-1 opacity-60">Senha Individual</label>
                <input required type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full coffee-input outline-none !py-3 !text-xs" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full coffee-button py-4 mt-8 text-[10px] active:scale-95 transition-all">
              {loading ? "VERIFICANDO..." : "ACESSAR"}
            </button>
            {error && <div className="mt-5 text-[8px] text-red-500 font-black uppercase tracking-widest text-center animate-shake">{error}</div>}
          </form>
        ) : (
          <form onSubmit={handleSignup} className="coffee-panel p-8 flex flex-col items-center animate-in slide-in-from-right-4 fade-in duration-500 rounded-[2.5rem] border-roasted-gold/20 shadow-2xl !overflow-visible max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="w-full space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">Novo Registro</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[8px] font-black text-roasted-gold uppercase tracking-[0.3em] opacity-60">Filiais de Atuação</label>
                   <button 
                    type="button" 
                    onClick={addUnitField}
                    className="w-6 h-6 rounded-lg bg-roasted-gold text-espresso-dark flex items-center justify-center hover:scale-110 active:scale-90 transition-all"
                   >
                     <PlusIcon className="w-3 h-3" />
                   </button>
                </div>
                
                <div className="space-y-4 pr-1 overflow-visible">
                  {signupUnits.map((u, idx) => (
                    <div key={idx} className="flex gap-2 animate-in slide-in-from-right-2 overflow-visible">
                      <div className="flex-1">
                        <CityDropdown label="" value={u} placeholder={`UNIDADE ${idx + 1}...`} onChange={v => updateUnitField(idx, v)} />
                      </div>
                      {signupUnits.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeUnitField(idx)}
                          className="w-10 h-10 mt-0.5 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-4">
                <label className="text-[8px] font-black text-roasted-gold uppercase tracking-[0.3em] ml-1 opacity-60">NOME DO AGENTE</label>
                <input required type="text" placeholder="EX: JEFFERSON" value={login} onChange={e => setLogin(e.target.value)} className="w-full coffee-input outline-none !py-3 !text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-roasted-gold uppercase tracking-[0.3em] ml-1 opacity-60">Credencial GR</label>
                <input required type="password" placeholder="CHAVE MESTRA" value={masterKey} onChange={e => setMasterKey(e.target.value)} className="w-full coffee-input outline-none !py-3 !text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-[#64ffda] uppercase tracking-[0.3em] ml-1 opacity-60">Criar Senha</label>
                <input required type="password" placeholder="SENHA PESSOAL" value={password} onChange={e => setPassword(e.target.value)} className="w-full coffee-input outline-none !py-3 !text-xs focus:!border-[#64ffda]" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full coffee-button py-4 mt-8 text-[10px] !bg-white/5 !text-roasted-gold border border-roasted-gold/30">
              {loading ? "PROCESSANDO..." : "CONCLUIR"}
            </button>
            {error && <div className="mt-5 text-[8px] text-red-500 font-black uppercase tracking-widest text-center">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;

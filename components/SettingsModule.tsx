
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, City, CITIES, USER_ROLES, UserRole, UnitTab } from '../types';
import { UserIcon, LockIcon, TrashIcon, EditIcon, PlusIcon, XMarkIcon, DatabaseIcon, SparklesIcon, ChevronDownIcon } from './icons';
import { CityDropdown } from './LogisticsForm';

interface SettingsModuleProps {
  currentUser: string;
  onUpdateCurrentUser: (updates: Partial<UserAccount>) => void;
  unitTabs: UnitTab[];
  onUpdateUnitTab: (id: string, updates: Partial<UnitTab>) => void;
  onDeleteUnitTab: (id: string) => void;
  allUsers: UserAccount[];
  onUpdateAllUsers: (users: UserAccount[]) => void;
  onProfileSave: (updates: Partial<UserAccount>) => void;
  onDeleteUser: (username: string) => void;
  onSaveEditedUser: (username: string, updates: Partial<UserAccount>) => void;
}

const MASTER_SECURITY_KEY = 'Gerenciamento*@2026';

const inputStyle = "w-full bg-black/40 border border-roasted-gold/20 rounded-xl px-5 py-4 text-sm focus:border-roasted-gold outline-none transition-all placeholder:text-white/10 text-white font-bold uppercase tracking-wider";
const labelStyle = "text-[10px] font-black text-roasted-gold uppercase tracking-[0.2em] mb-2 block ml-1 opacity-70";

const SettingsModule: React.FC<SettingsModuleProps> = ({ 
  currentUser, 
  onUpdateCurrentUser, 
  unitTabs, 
  onUpdateUnitTab, 
  onDeleteUnitTab, 
  allUsers, 
  onUpdateAllUsers,
  onProfileSave,
  onDeleteUser,
  onSaveEditedUser
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'admin'>('profile');
  const [adminAuth, setAdminAuth] = useState(false);
  const [masterKey, setMasterKey] = useState('');
  
  // Perfil state
  const [profileData, setProfileData] = useState<Partial<UserAccount>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin edit state
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [originalUsername, setOriginalUsername] = useState<string>('');
  const [editingUnit, setEditingUnit] = useState<UnitTab | null>(null);
  const [adminSubTab, setAdminSubTab] = useState<'users' | 'units'>('users');

  useEffect(() => {
    const current = allUsers.find((u: any) => u.username.toUpperCase() === currentUser.toUpperCase());
    if (current) setProfileData(current);
  }, [currentUser, allUsers]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileSave(profileData);
    alert("PERFIL ATUALIZADO COM SUCESSO.");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, profilePic: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterKey === MASTER_SECURITY_KEY) {
      setAdminAuth(true);
      setMasterKey('');
    } else {
      alert("CHAVE MESTRA INCORRETA.");
    }
  };

  const deleteUser = (username: string) => {
    if (username.toUpperCase() === currentUser.toUpperCase()) {
       alert("ERRO: VOCÊ NÃO PODE EXCLUIR SUA PRÓPRIA CONTA OPERACIONAL.");
       return;
    }
    if (window.confirm(`DESEJA REALMENTE EXCLUIR O AGENTE ${username}? ESTA AÇÃO É IRREVERSÍVEL.`)) {
      onDeleteUser(username);
    }
  };

  const startEditUser = (user: UserAccount) => {
    setEditingUser({ ...user });
    setOriginalUsername(user.username);
  };

  const saveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onSaveEditedUser(originalUsername, editingUser);
    setEditingUser(null);
    setOriginalUsername('');
    alert("DADOS DO AGENTE ATUALIZADOS.");
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      <div className="flex gap-4 p-1 bg-black/40 rounded-2xl mb-8 w-fit border border-white/5">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${activeTab === 'profile' ? 'bg-roasted-gold text-espresso-dark shadow-xl' : 'text-white/30 hover:text-white'}`}
        >
          <UserIcon className="w-4 h-4" /> MEU PERFIL
        </button>
        <button 
          onClick={() => setActiveTab('admin')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${activeTab === 'admin' ? 'bg-roasted-gold text-espresso-dark shadow-xl' : 'text-white/30 hover:text-white'}`}
        >
          <LockIcon className="w-4 h-4" /> ADMINISTRAÇÃO
        </button>
      </div>

      <div className="flex-1">
        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-12 gap-12 bg-black/20 p-12 rounded-[3rem] border border-white/5">
             <div className="md:col-span-4 flex flex-col items-center border-r border-white/5 pr-12">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <div className="w-48 h-48 rounded-full border-4 border-roasted-gold/20 overflow-hidden bg-black flex items-center justify-center transition-all group-hover:border-roasted-gold/60 shadow-2xl">
                      {profileData.profilePic ? (
                        <img src={profileData.profilePic} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-16 h-16 text-white/10" />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                         <PlusIcon className="w-8 h-8 text-white mb-2" />
                         <span className="text-[8px] font-black text-white uppercase tracking-widest">Alterar Foto</span>
                      </div>
                   </div>
                   <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </div>
                <h3 className="mt-8 text-xl font-black text-white uppercase tracking-tighter">{currentUser}</h3>
                <p className="text-[10px] text-roasted-gold font-black uppercase tracking-widest mt-1">
                  {profileData.role || 'Agente de Risco'} Ativo
                </p>
             </div>

             <div className="md:col-span-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className={labelStyle}>Nome Completo</label>
                      <input 
                        type="text" 
                        value={profileData.fullName || ''} 
                        onChange={e => setProfileData(p => ({ ...p, fullName: e.target.value.toUpperCase() }))}
                        className={inputStyle} 
                        placeholder="NOME COMPLETO DO AGENTE" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className={labelStyle}>Data de Nascimento</label>
                      <input 
                        type="date" 
                        value={profileData.birthDate || ''} 
                        onChange={e => setProfileData(p => ({ ...p, birthDate: e.target.value }))}
                        className={`${inputStyle} text-white/60`} 
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className={labelStyle}>Sua Função Operacional</label>
                      <div className="relative">
                        <select 
                          value={profileData.role || ''} 
                          onChange={e => setProfileData(p => ({ ...p, role: e.target.value as UserRole }))}
                          className={`${inputStyle} appearance-none cursor-pointer pr-12`}
                        >
                          <option value="" disabled className="bg-[#120A07]">SELECIONE SUA FUNÇÃO...</option>
                          {USER_ROLES.map(role => (
                            <option key={role} value={role} className="bg-[#120A07]">{role.toUpperCase()}</option>
                          ))}
                        </select>
                        <ChevronDownIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-roasted-gold/40 pointer-events-none" />
                      </div>
                   </div>
                </div>

                <button type="submit" className="w-full md:w-fit px-12 py-5 coffee-button text-[10px]">SALVAR ALTERAÇÕES</button>
             </div>
          </form>
        ) : !adminAuth ? (
          <div className="flex flex-col items-center justify-center py-20 bg-black/20 rounded-[3rem] border border-red-500/10">
             <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20 text-red-500">
                <LockIcon className="w-10 h-10" />
             </div>
             <h2 className="text-xl font-black text-white uppercase tracking-[0.4em] mb-2">Somente Pessoal Autorizado</h2>
             <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-10">Requer autenticação de nível Gerencial</p>
             <form onSubmit={handleAdminAuth} className="w-full max-w-sm flex flex-col gap-4">
                <input 
                  autoFocus
                  type="password" 
                  value={masterKey}
                  onChange={e => setMasterKey(e.target.value)}
                  className={`${inputStyle} text-center tracking-[0.5em] focus:border-red-500`} 
                  placeholder="••••••••" 
                />
                <button type="submit" className="w-full py-4 bg-red-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all rounded-xl">Desbloquear Painel</button>
             </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
             <div className="flex justify-between items-center bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
                <div className="flex gap-4">
                   <button 
                     onClick={() => setAdminSubTab('users')}
                     className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${adminSubTab === 'users' ? 'bg-red-500 text-white' : 'text-red-500/40 hover:text-red-500'}`}
                   >
                     Usuários
                   </button>
                   <button 
                     onClick={() => setAdminSubTab('units')}
                     className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${adminSubTab === 'units' ? 'bg-red-500 text-white' : 'text-red-500/40 hover:text-red-500'}`}
                   >
                     Filiais
                   </button>
                </div>
                <button onClick={() => setAdminAuth(false)} className="px-4 py-2 bg-black/40 text-white/40 hover:text-white rounded-lg text-[9px] font-black uppercase transition-all">Encerrar Sessão Admin</button>
             </div>

             {adminSubTab === 'users' ? (
               <div className="bg-black/40 rounded-[2.5rem] border border-white/5 overflow-hidden">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-white/5 text-[10px] font-black text-roasted-gold uppercase tracking-widest">
                           <th className="px-8 py-5">Agente</th>
                           <th className="px-8 py-5">Função</th>
                           <th className="px-8 py-5">Filiais</th>
                           <th className="px-8 py-5 text-right">Ações</th>
                     </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {allUsers.filter(u => u.username.toUpperCase() !== 'ADMIN').map(u => (
                           <tr key={u.username} className="hover:bg-white/5 transition-colors">
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-roasted-gold/10 border border-roasted-gold/20 flex items-center justify-center text-roasted-gold font-black text-[10px] uppercase overflow-hidden">
                                       {u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" /> : u.username[0]}
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-xs font-black text-white uppercase">{u.username}</span>
                                       <span className="text-[8px] text-white/30 uppercase">{u.fullName || 'SEM NOME COMPLETO'}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <span className="text-[10px] font-black text-roasted-gold uppercase">{u.role || 'AGENTE DE RISCO'}</span>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex flex-wrap gap-1">
                                    {u.units.map(unit => (
                                       <span key={unit} className="text-[8px] font-black bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/60">{unit}</span>
                                    ))}
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <div className="flex justify-end gap-3">
                                    <button onClick={() => startEditUser(u)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-all"><EditIcon className="w-4 h-4" /></button>
                                    <button onClick={() => deleteUser(u.username)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"><TrashIcon className="w-4 h-4" /></button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
             ) : (
               <div className="bg-black/40 rounded-[2.5rem] border border-white/5 overflow-hidden">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-white/5 text-[10px] font-black text-roasted-gold uppercase tracking-widest">
                           <th className="px-8 py-5">Filial</th>
                           <th className="px-8 py-5">Senha</th>
                           <th className="px-8 py-5">Ativada em</th>
                           <th className="px-8 py-5 text-right">Ações</th>
                     </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {unitTabs.map(unit => (
                           <tr key={unit.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-8 py-5">
                                 <span className="text-xs font-black text-white uppercase">{unit.name}</span>
                              </td>
                              <td className="px-8 py-5">
                                 <span className="text-[10px] font-black text-roasted-gold font-mono tracking-widest">{unit.password}</span>
                              </td>
                              <td className="px-8 py-5">
                                 <span className="text-[8px] text-white/30 uppercase">{new Date(unit.createdAt).toLocaleDateString()}</span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <div className="flex justify-end gap-3">
                                    <button onClick={() => setEditingUnit({ ...unit })} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-all"><EditIcon className="w-4 h-4" /></button>
                                    <button onClick={() => {
                                      if (window.confirm(`DESEJA REALMENTE EXCLUIR O TERMINAL DA FILIAL ${unit.name}?`)) {
                                        onDeleteUnitTab(unit.id);
                                      }
                                    }} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"><TrashIcon className="w-4 h-4" /></button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
             )}
          </div>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <form onSubmit={saveEditedUser} className="w-full max-w-lg bg-[#0a192f] p-12 rounded-[3.5rem] border border-roasted-gold/20 relative shadow-[0_0_100px_rgba(192,149,92,0.1)] !overflow-visible">
              <button type="button" onClick={() => setEditingUser(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-xl font-black text-roasted-gold uppercase tracking-[0.3em] mb-10 text-center">Editar Agente: {editingUser.username}</h2>
              <div className="space-y-8 overflow-visible max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                 <div className="space-y-2">
                    <label className={labelStyle}>Username de Acesso</label>
                    <input 
                      className={inputStyle} 
                      value={editingUser.username} 
                      onChange={e => setEditingUser({ ...editingUser, username: e.target.value.toUpperCase() })} 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className={labelStyle}>Nome Completo</label>
                    <input 
                      className={inputStyle} 
                      value={editingUser.fullName || ''} 
                      onChange={e => setEditingUser({ ...editingUser, fullName: e.target.value.toUpperCase() })} 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className={labelStyle}>Função Operacional</label>
                    <div className="relative">
                      <select 
                        value={editingUser.role || ''} 
                        onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                        className={`${inputStyle} appearance-none cursor-pointer pr-12`}
                      >
                        <option value="" disabled className="bg-[#120A07]">SELECIONE...</option>
                        {USER_ROLES.map(role => (
                          <option key={role} value={role} className="bg-[#120A07]">{role.toUpperCase()}</option>
                        ))}
                      </select>
                      <ChevronDownIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-roasted-gold/40 pointer-events-none" />
                    </div>
                 </div>
                 <div className="space-y-4 overflow-visible">
                    <label className={labelStyle}>Unidades Vinculadas</label>
                    <div className="space-y-4 overflow-visible">
                       {editingUser.units.map((unit, idx) => (
                          <div key={idx} className="flex gap-2 overflow-visible">
                             <div className="flex-1">
                                <CityDropdown 
                                  label="" 
                                  value={unit as City} 
                                  placeholder="SELECIONE..." 
                                  onChange={v => {
                                     const newUnits = [...editingUser.units];
                                     newUnits[idx] = v;
                                     setEditingUser({ ...editingUser, units: newUnits });
                                  }} 
                                />
                             </div>
                             {editingUser.units.length > 1 && (
                                <button type="button" onClick={() => {
                                   const newUnits = editingUser.units.filter((_, i) => i !== idx);
                                   setEditingUser({ ...editingUser, units: newUnits });
                                }} className="w-10 h-10 mt-0.5 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center"><XMarkIcon className="w-4 h-4" /></button>
                             )}
                          </div>
                       ))}
                    </div>
                    <button type="button" onClick={() => setEditingUser({ ...editingUser, units: [...editingUser.units, '' as City] })} className="w-full py-3 bg-white/5 border border-dashed border-white/20 rounded-xl text-[10px] font-black text-white/40 uppercase hover:bg-white/10 transition-all">+ Adicionar Unidade</button>
                 </div>
                 <div className="space-y-2">
                    <label className={labelStyle}>Redefinir Senha Pessoal</label>
                    <input 
                      type="text" 
                      className={inputStyle} 
                      value={editingUser.personalPassword} 
                      onChange={e => setEditingUser({ ...editingUser, personalPassword: e.target.value })} 
                    />
                 </div>
                 <button type="submit" className="w-full coffee-button py-5 text-xs">Atualizar Credenciais</button>
              </div>
           </form>
        </div>
      )}
      {editingUnit && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <form onSubmit={(e) => {
             e.preventDefault();
             onUpdateUnitTab(editingUnit.id, editingUnit);
             setEditingUnit(null);
             alert("DADOS DA FILIAL ATUALIZADOS.");
           }} className="w-full max-w-lg bg-[#0a192f] p-12 rounded-[3.5rem] border border-roasted-gold/20 relative shadow-[0_0_100px_rgba(192,149,92,0.1)]">
              <button type="button" onClick={() => setEditingUnit(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-xl font-black text-roasted-gold uppercase tracking-[0.3em] mb-10 text-center">Editar Filial: {editingUnit.name}</h2>
              <div className="space-y-8">
                 <div className="space-y-2">
                    <label className={labelStyle}>Nome da Filial</label>
                    <CityDropdown 
                      label="" 
                      value={editingUnit.name as City} 
                      placeholder="SELECIONE..." 
                      onChange={v => setEditingUnit({ ...editingUnit, name: v })} 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className={labelStyle}>Senha de Acesso</label>
                    <input 
                      type="text" 
                      className={inputStyle} 
                      value={editingUnit.password} 
                      onChange={e => setEditingUnit({ ...editingUnit, password: e.target.value })} 
                    />
                 </div>
                 <button type="submit" className="w-full coffee-button py-5 text-xs">Salvar Alterações</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default SettingsModule;

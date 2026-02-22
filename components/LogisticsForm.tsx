
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { LogisticsEntry, VehicleType, OperationStatus, CITIES, City, LoadingPosition } from '../types';
import { PlusIcon, XMarkIcon, ChevronDownIcon, SearchIcon } from './icons';

const inputStyle = "w-full bg-[#050a10] border border-[#64ffda]/20 rounded-xl px-5 py-3.5 text-sm focus:border-[#64ffda] outline-none transition-all placeholder:text-white/10 text-white font-medium shadow-inner uppercase";
const labelStyle = "text-[9px] font-black text-[#64ffda] uppercase tracking-widest mb-2 block ml-1 opacity-60";

// Exported to be shared with IscaControl
export const CityDropdown = ({ label, value, onChange, placeholder, options = CITIES }: { label: string, value: string, onChange: (v: City) => void, placeholder: string, options?: readonly string[] | string[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = options.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative overflow-visible" ref={containerRef}>
      {label && <label className={labelStyle}>{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputStyle} flex items-center justify-between text-left group`}
      >
        <span className={value ? "text-white" : "text-white/10"}>
          {value || placeholder}
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-[#64ffda]/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a192f] border border-[#64ffda]/40 rounded-2xl overflow-hidden z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-3xl min-w-[220px]">
          <div className="p-3 border-b border-white/5 bg-black/20">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64ffda]/40" />
              <input 
                autoFocus
                type="text"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-[10px] font-black text-white outline-none focus:border-[#64ffda]/40 uppercase"
                placeholder="BUSCAR FILIAL..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar py-1">
            {filteredCities.length > 0 ? (
              filteredCities.map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    onChange(city as City);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-left transition-colors flex items-center justify-between group ${value === city ? 'bg-[#64ffda]/10 text-[#64ffda]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                >
                  {city}
                  {value === city && <div className="w-1 h-1 rounded-full bg-[#64ffda] shadow-[0_0_8px_#64ffda]"></div>}
                </button>
              ))
            ) : (
              <div className="px-5 py-4 text-[10px] font-black text-white/20 uppercase text-center">Nenhuma filial encontrada</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const DynamicField = ({ 
  label, 
  field, 
  values, 
  placeholder, 
  uppercase = true, 
  onUpdate, 
  onAdd, 
  onRemove
}: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center pr-2">
      <label className={labelStyle}>{label}</label>
      <div className="flex gap-2">
         <button type="button" onClick={() => onAdd(field)} className="w-6 h-6 rounded-lg bg-[#64ffda]/20 text-[#64ffda] flex items-center justify-center hover:bg-[#64ffda]/40 transition-all active:scale-90" title="Adicionar novo">+</button>
      </div>
    </div>
    <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
      {values.map((val: string, idx: number) => (
        <div key={`${field}-${idx}`} className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
          <input 
            required={idx === 0}
            className={inputStyle} 
            value={val} 
            onChange={e => onUpdate(field, idx, uppercase ? e.target.value.toUpperCase() : e.target.value)} 
            placeholder={`${placeholder} ${idx + 1}`}
          />
          {values.length > 1 && (
            <button type="button" onClick={() => onRemove(field, idx)} className="shrink-0 w-12 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center transition-colors">
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

const TruckVisualization = ({ selected, onSelect, label }: { selected: LoadingPosition, onSelect: (p: LoadingPosition) => void, label?: string }) => {
  return (
    <div className="relative w-full max-w-[300px] aspect-[4/3] bg-[#0a192f] border-4 border-white/20 rounded-lg p-2 flex flex-col items-center justify-center overflow-hidden mx-auto shadow-2xl">
      <div className="absolute top-2 text-[8px] font-black uppercase text-white/20 tracking-widest">{label || 'Posicionamento da Isca'}</div>
      
      <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-2 relative z-10">
        <button 
          type="button"
          onClick={() => onSelect(LoadingPosition.SUPERIOR_ESQUERDO)}
          className={`border-2 border-dashed rounded-md flex items-center justify-center transition-all ${selected === LoadingPosition.SUPERIOR_ESQUERDO ? 'bg-[#64ffda] border-[#64ffda] text-[#0a192f]' : 'border-white/10 hover:border-white/30 text-white/10'}`}
        >
          <span className="text-[10px] font-black uppercase text-center px-1">Sup.<br/>Esq.</span>
        </button>
        
        <button 
          type="button"
          onClick={() => onSelect(LoadingPosition.SUPERIOR_DIREITO)}
          className={`border-2 border-dashed rounded-md flex items-center justify-center transition-all ${selected === LoadingPosition.SUPERIOR_DIREITO ? 'bg-[#64ffda] border-[#64ffda] text-[#0a192f]' : 'border-white/10 hover:border-white/30 text-white/10'}`}
        >
          <span className="text-[10px] font-black uppercase text-center px-1">Sup.<br/>Dir.</span>
        </button>

        <div className="grid grid-cols-1 grid-rows-2 gap-1">
          <button 
            type="button"
            onClick={() => onSelect(LoadingPosition.PALETIZADA)}
            className={`border-2 border-dashed rounded-md flex items-center justify-center transition-all ${selected === LoadingPosition.PALETIZADA ? 'bg-[#64ffda] border-[#64ffda] text-[#0a192f]' : 'border-white/10 hover:border-white/30 text-white/10'}`}
          >
            <span className="text-[8px] font-black uppercase text-center">Paletizada</span>
          </button>
          <button 
            type="button"
            onClick={() => onSelect(LoadingPosition.BATIDA)}
            className={`border-2 border-dashed rounded-md flex items-center justify-center transition-all ${selected === LoadingPosition.BATIDA ? 'bg-[#64ffda] border-[#64ffda] text-[#0a192f]' : 'border-white/10 hover:border-white/30 text-white/10'}`}
          >
            <span className="text-[8px] font-black uppercase text-center">Batida</span>
          </button>
        </div>

        <button 
          type="button"
          onClick={() => onSelect(LoadingPosition.OUTROS)}
          className={`border-2 border-dashed rounded-md flex items-center justify-center transition-all ${selected === LoadingPosition.OUTROS ? 'bg-[#64ffda] border-[#64ffda] text-[#0a192f]' : 'border-white/10 hover:border-white/30 text-white/10'}`}
        >
          <span className="text-[10px] font-black uppercase text-center px-1">Outros</span>
        </button>
      </div>

      <div className="absolute -bottom-2 flex gap-12">
        <div className="w-8 h-4 bg-gray-900 rounded-b-md"></div>
        <div className="w-8 h-4 bg-gray-900 rounded-b-md"></div>
      </div>
    </div>
  );
};

interface LogisticsFormProps {
  onAdd: (entry: Omit<LogisticsEntry, 'id' | 'timestamp' | 'protocol'>) => void;
  initialAuthor: string;
  entries: LogisticsEntry[];
  iscaControlEntries: LogisticsEntry[];
  userUnits?: string[];
  users: UserAccount[];
}

const LogisticsForm: React.FC<LogisticsFormProps> = ({ onAdd, initialAuthor, entries, iscaControlEntries, userUnits = [], users }) => {
  const [formData, setFormData] = useState({
    author: initialAuthor ? initialAuthor.toUpperCase() : '',
    responsavelPreAlerta: initialAuthor ? initialAuthor.toUpperCase() : 'SISTEMA',
    motorista: '',
    placaCavalo: '',
    placaVeiculo: [''],
    numIsca: [''],
    numNF: [''],
    uma: [''],
    codigoProduto: [''],
    iscaPertencente: [''] as any[],
    origem: '' as any,
    destino: '' as any,
    tipoVeiculo: VehicleType.BAU,
    status: OperationStatus.ROTA_IDA, 
    observacoes: '',
    embarqueIsca: [LoadingPosition.NAO_INFORMADO],
    embarqueObservations: [''],
    taggedUsers: [] as string[]
  });

  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = users.filter(u => 
    (u.username.toUpperCase().includes(userSearch.toUpperCase()) || 
    u.fullName?.toUpperCase().includes(userSearch.toUpperCase())) &&
    !formData.taggedUsers.includes(u.username)
  ).slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação de Propriedade de Isca Única
    const allExisting = [...entries, ...iscaControlEntries];
    for (let i = 0; i < formData.numIsca.length; i++) {
      const iscaId = formData.numIsca[i].trim().toUpperCase();
      const owner = formData.iscaPertencente[i];
      
      if (iscaId && owner) {
        const conflict = allExisting.find(entry => {
          const idx = entry.numIsca.findIndex(id => id.toUpperCase() === iscaId);
          return idx !== -1 && entry.iscaPertencente[idx] !== owner;
        });

        if (conflict) {
          const conflictIdx = conflict.numIsca.findIndex(id => id.toUpperCase() === iscaId);
          const originalOwner = conflict.iscaPertencente[conflictIdx];
          alert(`ERRO DE SEGURANÇA: A ISCA #${iscaId} JÁ PERTENCE À UNIDADE ${originalOwner.toUpperCase()}. NÃO É PERMITIDO ATRIBUIR O MESMO NÚMERO A ${owner.toUpperCase()}.`);
          return;
        }
      }
    }

    onAdd({
      ...formData,
      placaVeiculo: formData.placaVeiculo.filter(v => v.trim() !== ''),
      numIsca: formData.numIsca.filter(v => v.trim() !== ''),
      numNF: formData.numNF.filter(v => v.trim() !== ''),
      uma: formData.uma.filter(v => v.trim() !== ''),
      codigoProduto: formData.codigoProduto.filter(v => v.trim() !== ''),
      embarqueObservacoes: formData.embarqueObservations
    } as any);
    
    setFormData(prev => ({ 
      ...prev, 
      motorista: '', 
      placaCavalo: '', 
      placaVeiculo: [''], 
      numIsca: [''], 
      numNF: [''], 
      uma: [''],
      codigoProduto: [''],
      observacoes: '',
      iscaPertencente: [''],
      origem: '',
      destino: '',
      status: OperationStatus.ROTA_IDA, 
      embarqueIsca: [LoadingPosition.NAO_INFORMADO],
      embarqueObservations: [''],
      taggedUsers: []
    }));
  };

  const handleAddField = (field: 'placaVeiculo' | 'numIsca' | 'numNF' | 'uma' | 'codigoProduto') => {
    setFormData(prev => {
      const updates: any = { [field]: [...(prev as any)[field], ''] };
      
      if (field === 'numIsca') {
        updates.iscaPertencente = [...prev.iscaPertencente, ''];
        updates.embarqueIsca = [...prev.embarqueIsca, LoadingPosition.NAO_INFORMADO];
        updates.embarqueObservations = [...prev.embarqueObservations, ''];
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleRemoveField = (field: 'placaVeiculo' | 'numIsca' | 'numNF' | 'uma' | 'codigoProduto', index: number) => {
    setFormData(prev => {
      if ((prev as any)[field].length === 1) return { ...prev, [field]: [''] };
      
      const newList = [...(prev as any)[field]];
      newList.splice(index, 1);
      
      const updates: any = { [field]: newList };
      
      if (field === 'numIsca') {
        const newIscaPertencente = [...prev.iscaPertencente];
        const newEmbarqueIsca = [...prev.embarqueIsca];
        const newEmbarqueObs = [...prev.embarqueObservations];
        
        newIscaPertencente.splice(index, 1);
        newEmbarqueIsca.splice(index, 1);
        newEmbarqueObs.splice(index, 1);
        
        updates.iscaPertencente = newIscaPertencente;
        updates.embarqueIsca = newEmbarqueIsca;
        updates.embarqueObservations = newEmbarqueObs;
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleUpdateField = (field: 'placaVeiculo' | 'numIsca' | 'numNF' | 'uma' | 'codigoProduto', index: number, value: string) => {
    setFormData(prev => {
      const newList = [...(prev as any)[field]];
      newList[index] = value.toUpperCase();
      return { ...prev, [field]: newList };
    });
  };

  const updateIscaPertencente = (idx: number, city: City) => {
    setFormData(prev => {
      const newList = [...prev.iscaPertencente];
      newList[idx] = city;
      return { ...prev, iscaPertencente: newList };
    });
  };

  const updateEmbarqueIsca = (idx: number, pos: LoadingPosition) => {
    setFormData(prev => {
      const newList = [...prev.embarqueIsca];
      newList[idx] = pos;
      return { ...prev, embarqueIsca: newList };
    });
  };

  const updateEmbarqueObs = (idx: number, obs: string) => {
    setFormData(prev => {
      const newList = [...prev.embarqueObservations];
      newList[idx] = obs.toUpperCase();
      return { ...prev, embarqueObservations: newList };
    });
  };

  const sortedVehicles = [...Object.values(VehicleType)].sort((a, b) => a.localeCompare(b));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      {/* Seção 01: Identificação Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={labelStyle}>Motorista</label>
          <input required className={inputStyle} value={formData.motorista} onChange={e => setFormData(p => ({ ...p, motorista: e.target.value.toUpperCase() }))} placeholder="NOME DO CONDUTOR" />
        </div>
        <div>
          <label className={labelStyle}>Placa Cavalo</label>
          <input required className={inputStyle} value={formData.placaCavalo} onChange={e => setFormData(p => ({ ...p, placaCavalo: e.target.value.toUpperCase() }))} placeholder="AAA0000" />
        </div>
        <div className="relative">
          <label className={labelStyle}>Para (Marcar Agentes)</label>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64ffda]/40" />
            <input 
              type="text" 
              className={`${inputStyle} pl-12`} 
              value={userSearch} 
              onChange={e => setUserSearch(e.target.value)} 
              placeholder="BUSCAR AGENTE..." 
            />
          </div>
          
          {userSearch && filteredUsers.length > 0 && (
            <div className="absolute z-[110] w-full mt-1 bg-[#0a192f] border border-[#64ffda]/40 rounded-xl overflow-hidden shadow-2xl">
              {filteredUsers.map(u => (
                <button
                  key={u.username}
                  type="button"
                  onClick={() => {
                    setFormData(p => ({ ...p, taggedUsers: [...p.taggedUsers, u.username] }));
                    setUserSearch('');
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-[#64ffda]/10 border-b border-white/5 last:border-0 transition-colors"
                >
                  <p className="text-[10px] font-black text-white uppercase">{u.username}</p>
                  <p className="text-[8px] text-white/40 uppercase">{u.fullName || 'SEM NOME'}</p>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {formData.taggedUsers.map(username => (
              <div key={username} className="flex items-center gap-2 bg-[#64ffda]/10 border border-[#64ffda]/20 px-3 py-1 rounded-lg">
                <span className="text-[9px] font-black text-[#64ffda] uppercase">@{username}</span>
                <button 
                  type="button" 
                  onClick={() => setFormData(p => ({ ...p, taggedUsers: p.taggedUsers.filter(u => u !== username) }))}
                  className="text-[#64ffda]/40 hover:text-[#64ffda]"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seção 02: Dados da Carga e Dispositivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <DynamicField 
            label="Bau / Carreta (Placas)" 
            field="placaVeiculo" 
            values={formData.placaVeiculo}
            placeholder="PLACA" 
            uppercase={true}
            onUpdate={handleUpdateField}
            onAdd={handleAddField}
            onRemove={handleRemoveField}
          />

          <div className="grid grid-cols-2 gap-4">
             <DynamicField 
              label="UMA" 
              field="uma" 
              values={formData.uma}
              placeholder="Nº UMA"
              onUpdate={handleUpdateField}
              onAdd={handleAddField}
              onRemove={handleRemoveField}
             />
             <DynamicField 
              label="Código do Produto" 
              field="codigoProduto" 
              values={formData.codigoProduto}
              placeholder="CÓD. SKU"
              onUpdate={handleUpdateField}
              onAdd={handleAddField}
              onRemove={handleRemoveField}
             />
          </div>
        </div>

        <div className="space-y-6">
          <DynamicField 
            label="Nº da(s) Isca(s)" 
            field="numIsca" 
            values={formData.numIsca}
            placeholder="ISCA ID"
            onUpdate={handleUpdateField}
            onAdd={handleAddField}
            onRemove={handleRemoveField}
          />
          <DynamicField 
            label="Notas Fiscais" 
            field="numNF" 
            values={formData.numNF}
            placeholder="Nº NF"
            onUpdate={handleUpdateField}
            onAdd={handleAddField}
            onRemove={handleRemoveField}
          />
        </div>
      </div>

      {/* Seção 03: Rota e Logística */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#64ffda]/5 p-8 rounded-[2.5rem] border border-[#64ffda]/10">
        <div>
          {/* LOCAL DE ORIGEM RESTRITO ÀS UNIDADES DO USUÁRIO */}
          <CityDropdown 
            label="Local de Origem"
            value={formData.origem}
            placeholder="SUA UNIDADE..."
            options={userUnits.length > 0 ? userUnits : CITIES}
            onChange={v => setFormData(p => ({ ...p, origem: v }))}
          />
        </div>
        <div>
          {/* LOCAL DE DESTINO MANTÉM TODAS AS CIDADES */}
          <CityDropdown 
            label="Local de Destino"
            value={formData.destino}
            placeholder="SELECIONE O DESTINO..."
            onChange={v => setFormData(p => ({ ...p, destino: v }))}
          />
        </div>
        <div>
          <label className={labelStyle}>Tipo de Veículo</label>
          <div className="flex bg-[#050a10] border border-[#64ffda]/20 rounded-2xl p-1">
            {sortedVehicles.map(v => (
              <button key={v} type="button" onClick={() => setFormData(p => ({ ...p, tipoVeiculo: v }))} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${formData.tipoVeiculo === v ? 'bg-[#64ffda] text-[#0a192f]' : 'text-white/20 hover:text-white/40'}`}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Seção 04: Relato Geral */}
      <div>
        <label className={labelStyle}>Relato Técnico de Observações Gerais</label>
        <textarea className={`${inputStyle} h-28 resize-none uppercase`} value={formData.observacoes} onChange={e => setFormData(p => ({ ...p, observacoes: e.target.value.toUpperCase() }))} placeholder="DETALHES ADICIONAIS DA CARGA, OCORRÊNCIAS, ETC..." />
      </div>

      {/* Seção 05: Embarque de Iscas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {formData.numIsca.map((iscaId, idx) => (
          <div key={`embarque-${idx}`} className="bg-[#64ffda]/5 border border-[#64ffda]/10 rounded-[2.5rem] p-6 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-black text-[#64ffda] uppercase tracking-widest">Embarque de Isca {idx + 1} {iscaId ? `(#${iscaId})` : ''}</h3>
            </div>
            <CityDropdown 
              label={`Dona da Isca ${idx + 1}`}
              value={formData.iscaPertencente[idx]}
              placeholder="FILIAL PROPRIETÁRIA..."
              onChange={v => updateIscaPertencente(idx, v)}
            />
            <TruckVisualization label={`Posição Isca ${idx + 1}`} selected={formData.embarqueIsca[idx]} onSelect={(pos) => updateEmbarqueIsca(idx, pos)} />
            <textarea 
              className={`${inputStyle} h-16 resize-none uppercase`} 
              value={formData.embarqueObservations[idx]} 
              onChange={e => updateEmbarqueObs(idx, e.target.value.toUpperCase())} 
              placeholder={`Observações do embarque isca ${idx + 1}...`} 
            />
          </div>
        ))}
      </div>

      <div className="pt-4">
        <button type="submit" className="w-full bg-[#64ffda] text-[#0a192f] font-black py-5 rounded-3xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm shadow-xl shadow-[#64ffda]/10">
          <PlusIcon className="w-5 h-5" />
          Gerar Protocolo
        </button>
      </div>
    </form>
  );
};

export default LogisticsForm;

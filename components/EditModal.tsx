
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { LogisticsEntry, OperationStatus, VehicleType, LoadingPosition, City } from '../types';
import { XMarkIcon, ChevronDownIcon } from './icons';

interface EditModalProps {
  entry: LogisticsEntry;
  onClose: () => void;
  onSave: (updates: Partial<LogisticsEntry>) => void;
}

const inputStyle = "w-full bg-[#050a10] border border-[#64ffda]/20 rounded-xl px-4 py-3 text-xs focus:border-[#64ffda] outline-none text-white uppercase";
const labelStyle = "text-[8px] font-black text-[#64ffda] uppercase tracking-widest mb-1.5 block opacity-60";

const EditModal: React.FC<EditModalProps> = ({ entry, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    motorista: entry.motorista,
    placaCavalo: entry.placaCavalo,
    status: entry.status,
    observacoes: entry.observacoes,
    numIsca: entry.numIsca.join(' | '),
    placaVeiculo: entry.placaVeiculo.join(' | '),
    numNF: entry.numNF.join(' | ')
  });

  const handleSave = () => {
    onSave({
      motorista: formData.motorista.toUpperCase(),
      placaCavalo: formData.placaCavalo.toUpperCase(),
      status: formData.status,
      observacoes: formData.observacoes.toUpperCase(),
      numIsca: formData.numIsca.split(/[|;]/).map(s => s.trim().toUpperCase()).filter(s => s !== ""),
      placaVeiculo: formData.placaVeiculo.split(/[|;]/).map(s => s.trim().toUpperCase()).filter(s => s !== ""),
      numNF: formData.numNF.split(/[|;]/).map(s => s.trim().toUpperCase()).filter(s => s !== "")
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#03070a]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl cyber-glass p-10 rounded-[3rem] border border-[#64ffda]/30 relative shadow-[0_0_100px_rgba(100,255,218,0.1)]">
        <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="mb-8">
          <h2 className="text-xl font-black text-[#64ffda] uppercase tracking-[0.3em]">Editor de Registro</h2>
          <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">
            {entry.protocol ? `Protocolo Platinum #P${entry.protocol}` : 'Registro Operacional Interno'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="col-span-2">
            <label className={labelStyle}>Nome do Motorista</label>
            <input className={inputStyle} value={formData.motorista} onChange={e => setFormData(p => ({ ...p, motorista: e.target.value }))} />
          </div>
          
          <div>
            <label className={labelStyle}>Placa Cavalo</label>
            <input className={inputStyle} value={formData.placaCavalo} onChange={e => setFormData(p => ({ ...p, placaCavalo: e.target.value }))} />
          </div>

          <div>
            <label className={labelStyle}>Status Operacional</label>
            <select 
              className={inputStyle} 
              value={formData.status} 
              onChange={e => setFormData(p => ({ ...p, status: e.target.value as OperationStatus }))}
            >
              {Object.values(OperationStatus).map(s => (
                <option key={s} value={s} className="bg-[#0a192f]">{s}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className={labelStyle}>Isca ID(s) (Use | para múltiplos)</label>
            <input className={inputStyle} value={formData.numIsca} onChange={e => setFormData(p => ({ ...p, numIsca: e.target.value }))} />
          </div>

          <div className="col-span-1">
            <label className={labelStyle}>Baú / Carreta (Placas)</label>
            <input className={inputStyle} value={formData.placaVeiculo} onChange={e => setFormData(p => ({ ...p, placaVeiculo: e.target.value }))} />
          </div>

          <div className="col-span-1">
            <label className={labelStyle}>Notas Fiscais</label>
            <input className={inputStyle} value={formData.numNF} onChange={e => setFormData(p => ({ ...p, numNF: e.target.value }))} />
          </div>

          <div className="col-span-2">
            <label className={labelStyle}>Observações Operacionais</label>
            <textarea className={`${inputStyle} h-24 resize-none`} value={formData.observacoes} onChange={e => setFormData(p => ({ ...p, observacoes: e.target.value }))} />
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 bg-white/5 text-white/40 rounded-2xl font-black uppercase text-[10px] hover:bg-white/10 transition-all border border-white/5">Descartar</button>
          <button onClick={handleSave} className="flex-[2] py-4 bg-[#64ffda] text-[#0a192f] rounded-2xl font-black uppercase text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#64ffda]/10">Salvar Alterações</button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { LogisticsEntry } from '../types';

interface NationalMapProps {
  entries: LogisticsEntry[];
}

const NationalMap: React.FC<NationalMapProps> = ({ entries }) => {
  // Google Maps Iframe para visualização moderna. 
  // Nota: Usamos o modo Embed com filtro CSS para manter a estética Platinum (Dark/Teal)
  // O link foca no Brasil centralizado com zoom de altitude média.
  
  return (
    <div className="relative w-full h-full bg-[#0d0705] rounded-[2rem] border border-[#64ffda]/10 overflow-hidden shadow-2xl">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(1.2) contrast(1.2)' }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps/embed/v1/place?key=REPLACE_WITH_YOUR_API_KEY_IF_NEEDED&q=Brazil&center=-14.235, -51.925&zoom=4&maptype=satellite"
        title="Google Maps Cobertura Nacional"
      ></iframe>

      {/* Camada de Overlay de Dados Ativos */}
      <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="coffee-glass border border-[#64ffda]/20 p-4 rounded-2xl backdrop-blur-md">
            <span className="text-[10px] font-black gold-text uppercase tracking-widest block mb-1">Status de Varredura</span>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#64ffda] rounded-full animate-pulse"></div>
              <span className="text-xs font-black text-white">{entries.length} Pontos Sincronizados</span>
            </div>
          </div>
          
          <div className="coffee-glass border border-[#64ffda]/20 p-4 rounded-2xl backdrop-blur-md text-right">
            <span className="text-[10px] font-black gold-text uppercase tracking-widest block mb-1">Carga Global</span>
            <span className="text-sm font-black text-white italic">OPERANDO 100%</span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="coffee-glass border border-[#64ffda]/30 px-8 py-3 rounded-full flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#64ffda] rounded-full"></div>
              <span className="text-[9px] font-black text-[#64ffda] uppercase">Rastreamento IA Ativo</span>
            </div>
            <div className="w-[1px] h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span className="text-[9px] font-black text-blue-400 uppercase">Filtro de Altitude</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NationalMap;

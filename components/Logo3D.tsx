
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface Logo3DProps {
  className?: string;
}

const Logo3D: React.FC<Logo3DProps> = ({ className = "w-12 h-12" }) => {
  return (
    <div className={`${className} relative group perspective-1000 select-none`}>
      {/* Brilho de Fundo (Aura de Aroma) */}
      <div className="absolute inset-0 bg-[#C0955C]/20 blur-3xl rounded-full scale-150 animate-pulse group-hover:bg-[#C0955C]/40 transition-all duration-700"></div>
      
      {/* Container Principal Animado */}
      <div className="relative w-full h-full animate-float-gentle transition-transform duration-700 group-hover:scale-110">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]">
          <defs>
            <linearGradient id="coffeeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#C0955C', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#1A0F0A', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#8B6B43', stopOpacity: 1 }} />
            </linearGradient>
            
            <linearGradient id="metalRing" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.2 }} />
              <stop offset="50%" style={{ stopColor: '#C0955C', stopOpacity: 0.5 }} />
              <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.1 }} />
            </linearGradient>

            <filter id="glowCoffee">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Anéis Industriais Externos (Engrenagens) */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="url(#metalRing)" strokeWidth="0.5" strokeDasharray="10 5" className="animate-[spin_20s_linear_infinite]" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#C0955C" strokeWidth="0.2" opacity="0.3" className="animate-[spin_15s_linear_infinite_reverse]" />

          {/* Escudo Hexagonal Industrial */}
          <path 
            d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" 
            fill="rgba(26, 15, 10, 0.9)" 
            stroke="#C0955C" 
            strokeWidth="1.5"
            className="transition-all duration-500 group-hover:stroke-white"
          />

          {/* Silhueta Estilizada do Grão de Café Central */}
          <g transform="translate(32, 28) scale(0.7)" filter="url(#glowCoffee)">
            {/* Metade Esquerda do Grão */}
            <path 
              d="M25 0 C10 0 0 15 0 35 C0 55 10 70 25 70 C28 70 30 65 30 55 C30 45 25 35 25 35 S30 25 30 15 C30 5 28 0 25 0Z" 
              fill="url(#coffeeGrad)"
            />
            {/* Metade Direita do Grão (com o número 3 sutil) */}
            <path 
              d="M27 0 C42 0 52 15 52 35 C52 55 42 70 27 70 C24 70 22 65 22 55 C22 45 27 35 27 35 S22 25 22 15 C22 5 24 0 27 0Z" 
              fill="url(#coffeeGrad)"
            />
            {/* Divisória S (Curva do Grão) */}
            <path 
              d="M25 2 C25 2 35 25 25 35 S15 65 25 68" 
              fill="none" 
              stroke="#120A07" 
              strokeWidth="2" 
              strokeLinecap="round" 
              opacity="0.8"
            />
          </g>

          {/* Marcação Técnica "3C" em vez de "GR" */}
          <text 
            x="50" 
            y="65" 
            textAnchor="middle" 
            fill="#C0955C" 
            fontSize="10" 
            fontWeight="900" 
            fontFamily="Quantico, sans-serif"
            className="tracking-[0.2em] opacity-80"
          >
            3C-IND
          </text>

          {/* Varredura de Laser (Scanner de Qualidade) */}
          <line x1="15" y1="50" x2="85" y2="50" stroke="#C0955C" strokeWidth="0.5" opacity="0.4">
            <animate attributeName="y1" values="25;75;25" dur="4s" repeatCount="indefinite" />
            <animate attributeName="y2" values="25;75;25" dur="4s" repeatCount="indefinite" />
          </line>
        </svg>

        {/* Órbita de Partículas */}
        <div className="absolute inset-0 border border-[#C0955C]/10 rounded-full scale-110 border-dashed animate-[spin_30s_linear_infinite]"></div>
      </div>
    </div>
  );
};

export default Logo3D;


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from '@google/genai';
import { LogisticsEntry } from '../types';

export const analyzeLogisticsData = async (entries: LogisticsEntry[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const summary = entries.slice(-10).map(e => 
    `- Destino: ${e.destino}, Status: ${e.status}, Obs: ${e.observacoes}`
  ).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise as seguintes movimentações logísticas e forneça um breve insight estratégico (máximo 3 frases) sobre riscos ou eficiência: \n${summary}`,
    config: {
      systemInstruction: "Você é um analista de gerenciamento de risco logístico (GR). Seja conciso e profissional.",
    }
  });

  return response.text || "Sem insights no momento.";
};

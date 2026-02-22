
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Video } from '@google/genai';

export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export enum VehicleType {
  BAU = 'Baú',
  RODOTREM = 'Rodotrem',
}

export enum OperationStatus {
  EXTRAVIADA = 'ISCA EXTRAVIADA',
  ISCA_DISPONIVEL = 'ISCA DISPONIVEL',
  NO_DESTINO = 'ISCA RESGATADA',
  PREPARACAO = 'PREPARAÇÃO',
  ROTA_IDA = 'ROTA IDA',
  ROTA_VOLTA = 'ROTA VOLTA',
  VIA_CORREIO = 'VIA CORREIO',
  ISCA_CONGELADA = 'ISCA CONGELADA',
  COM_DEFEITO = 'COM DEFEITO',
}

export enum LoadingPosition {
  PALETIZADA = 'Paletizada (1º Palete Esq)',
  BATIDA = 'Batida (Chão Esq)',
  SUPERIOR_DIREITO = 'Superior Direito',
  SUPERIOR_ESQUERDO = 'Superior Esquerdo',
  OUTROS = 'Outros',
  NAO_INFORMADO = 'Não Informado'
}

export const CITIES = [
  'Araçariguama-SP',
  'Ariquemes-RO',
  'Bebedouro-SP',
  'Brasília-DF',
  'Campo Grande-MS',
  'Cuiabá-MT',
  'Eusébio-CE',
  'Exportação',
  'Governador Celso Ramos-SC',
  'Guarulhos-SP',
  'Londrina-PR',
  'Manaus-AM',
  'Montes Claros-MG',
  'Mossoró-RN',
  'Natal-RN',
  'Pinhais-PR',
  'Porto Velho-RO',
  'Recife-PE',
  'Rio de Janeiro-RJ',
  'Salvador-BA',
  'Santa Luzia-MG',
  'Sumaré-SP',
  'Vespasiano-MG',
  'Viana-ES'
] as const;

export type City = typeof CITIES[number];

export const USER_ROLES = [
  'Agente de Risco',
  'Analista',
  'Supervisor',
  'Coordenador',
  'Gerente',
  'Assistente'
] as const;

export type UserRole = typeof USER_ROLES[number];

export interface UnitTab {
  id: string;
  name: string;
  password: string;
  createdAt: string;
}

export interface LogisticsEntry {
  id: string;
  protocol?: number; 
  timestamp: string;
  author: string;
  responsavelPreAlerta: string;
  motorista: string;
  placaCavalo: string;
  placaVeiculo: string[]; 
  numIsca: string[];
  numNF: string[];
  uma: string[];
  codigoProduto: string[];
  iscaPertencente: City[]; 
  iscaStatuses?: OperationStatus[]; // Adicionado para controle individual
  origem: City;
  destino: City;
  tipoVeiculo: VehicleType;
  status: OperationStatus;
  observacoes: string;
  embarqueIsca: LoadingPosition[]; 
  embarqueObservacoes: string[]; 
  dataOperacao?: string;
  horaOperacao?: string;
  unitId?: string; 
  readByUnits?: string[];
  taggedUsers?: string[];
}

export interface Announcement {
  id: string;
  author: string;
  authorUnit: string;
  subject: string;
  text: string;
  timestamp: string;
  taggedUsers: string[];
}

export interface Recado {
  id: string;
  fromUnit: string;
  toUnit: string;
  author: string;
  subject: string;
  text: string;
  timestamp: string;
  status: 'pending' | 'responded';
  type: 'cobranca' | 'retorno' | 'resposta';
  relatedProtocol?: number;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
}

export interface ChatMessage {
  id: string;
  author: string;
  authorUnit: string;
  text: string;
  timestamp: string;
  channel: 'global' | 'unit' | 'private';
  recipient?: string; 
}

export interface Notification {
  id: string;
  unit: string;
  text: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'alert' | 'success';
}

export interface UserNote {
  id: string;
  text: string;
  timestamp: string;
  lastUpdated: string;
}

export interface CriticalAlert {
  id: string;
  type: 'EXTRAVIADA' | 'WARNING';
  message: string;
  location: string;
  protocolId?: number;
  isRead: boolean;
  timestamp: string;
}

export interface UserAccount {
  username: string;
  units: string[]; 
  personalPassword: string;
  fullName?: string;
  birthDate?: string;
  yearsGR?: number;
  profilePic?: string; 
  role?: UserRole;
}

export interface AppData {
  entries: LogisticsEntry[]; 
  iscaControlEntries: LogisticsEntry[]; 
  messages: ChatMessage[];
  notifications: Notification[];
  unitTabs: UnitTab[]; 
  lastAuthor: string;
  nextProtocol: number;
  announcements: Announcement[];
  recados: Recado[];
}

export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
}

export enum Resolution {
  P720 = '720p',
  P1080 = '1080p',
  P4K = '4K',
}

export enum VeoModel {
  VEO = 'veo-3.1-generate-preview',
  VEO_FAST = 'veo-3.1-fast-generate-preview',
}

export enum GenerationMode {
  TEXT_TO_VIDEO = 'TEXT_TO_VIDEO',
  FRAMES_TO_VIDEO = 'FRAMES_TO_VIDEO',
  REFERENCES_TO_VIDEO = 'REFERENCES_TO_VIDEO',
  EXTEND_VIDEO = 'EXTEND_VIDEO',
}

export interface ImageFile {
  file: File;
  base64: string;
}

export interface VideoFile {
  file: File;
  base64: string;
}

export interface GenerateVideoParams {
  prompt: string;
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  mode: GenerationMode;
  startFrame: ImageFile | null;
  endFrame: ImageFile | null;
  referenceImages: ImageFile[];
  styleImage: ImageFile | null;
  inputVideo: VideoFile | null;
  inputVideoObject: Video | null;
  isLooping: boolean;
}

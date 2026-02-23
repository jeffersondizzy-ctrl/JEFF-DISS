
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { AppState, LogisticsEntry, AppData, OperationStatus, ChatMessage, CriticalAlert, UnitTab, Notification, UserAccount, VehicleType, LoadingPosition } from './types';
import LogisticsForm from './components/LogisticsForm';
import HistoryTable from './components/HistoryTable';
import DashboardStats from './components/DashboardStats';
import ProtocolView from './components/ProtocolView';
import LoginScreen from './components/LoginScreen';
import NationalMap from './components/NationalMap';
import IscaHistory from './components/IscaHistory';
import IscaControl from './components/IscaControl';
import ChatModule from './components/ChatModule';
import AlertSystem from './components/AlertSystem';
import Logo3D from './components/Logo3D';
import FounderSection from './components/FounderSection';
import ProtocolSearch from './components/ProtocolSearch';
import DataTransmission from './components/DataTransmission';
import EmailPresentation from './components/EmailPresentation';
import IscaBilling from './components/IscaBilling';
import EditModal from './components/EditModal';
import PreAlertsView from './components/PreAlertsView';
import SettingsModule from './components/SettingsModule';
import NotesModule from './components/NotesModule';
import AgentsModule from './components/AgentsModule';
import OnlineUsers from './components/OnlineUsers';
import BirthdayModal from './components/BirthdayModal';
import AnnouncementsModule from './components/AnnouncementsModule';
import RecadosModule from './components/RecadosModule';
import { 
  XMarkIcon, 
  PlusIcon, 
  RectangleStackIcon, 
  SlidersHorizontalIcon,
  MessageSquareIcon,
  AwardIcon,
  SparklesIcon,
  DatabaseIcon,
  MailIcon,
  AlertIcon,
  ArrowRightIcon,
  LogOutIcon,
  ClipboardIcon,
  BellIcon,
  SearchIcon,
  GlobeIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  NoteIcon
} from './components/icons';

import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  where
} from 'firebase/firestore';

const STORAGE_KEY = 'pre_alerta_gr_v5_platinum';
const STORAGE_USERS_KEY = 'pre_alerta_gr_agent_registry_v2';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [currentUserUnit, setCurrentUserUnit] = useState('');
  const [userProfile, setUserProfile] = useState<Partial<UserAccount>>({});
  const [birthdayCelebrant, setBirthdayCelebrant] = useState<UserAccount | null>(null);
  const [expandedSection, setExpandedSection] = useState<'none' | 'new' | 'stats' | 'history' | 'isca_control' | 'iscas' | 'map' | 'chat' | 'founder' | 'search' | 'transmission' | 'email' | 'billing' | 'pre_alerts' | 'settings' | 'notes' | 'agents' | 'announcements' | 'recados' | 'logout'>('none');
  const [showNotifications, setShowNotifications] = useState(false);
  const [data, setData] = useState<AppData>({ 
    entries: [], 
    iscaControlEntries: [], 
    messages: [], 
    notifications: [],
    unitTabs: [],
    lastAuthor: '', 
    nextProtocol: 1,
    announcements: [],
    recados: [],
    users: [],
    reviews: []
  });
  const [selectedEntry, setSelectedEntry] = useState<LogisticsEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<LogisticsEntry | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for entries
    const qEntries = query(collection(db, 'entries'), orderBy('timestamp', 'desc'));
    const unsubEntries = onSnapshot(qEntries, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LogisticsEntry));
      setData(prev => ({ ...prev, entries }));
    });

    // Listen for iscaControlEntries
    const qIscaControl = query(collection(db, 'iscaControlEntries'), orderBy('timestamp', 'desc'));
    const unsubIscaControl = onSnapshot(qIscaControl, (snapshot) => {
      const iscaControlEntries = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LogisticsEntry));
      setData(prev => ({ ...prev, iscaControlEntries }));
    });

    // Listen for messages
    const qMessages = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ChatMessage));
      setData(prev => ({ ...prev, messages }));
    });

    // Listen for notifications
    const qNotifications = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'));
    const unsubNotifications = onSnapshot(qNotifications, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Notification));
      setData(prev => ({ ...prev, notifications }));
    });

    // Listen for unitTabs
    const qUnitTabs = query(collection(db, 'unitTabs'), orderBy('name', 'asc'));
    const unsubUnitTabs = onSnapshot(qUnitTabs, (snapshot) => {
      const unitTabs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UnitTab));
      setData(prev => ({ ...prev, unitTabs }));
    });

    // Listen for announcements
    const qAnnouncements = query(collection(db, 'announcements'), orderBy('timestamp', 'desc'));
    const unsubAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      const announcements = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      setData(prev => ({ ...prev, announcements }));
    });

    // Listen for recados
    const qRecados = query(collection(db, 'recados'), orderBy('timestamp', 'desc'));
    const unsubRecados = onSnapshot(qRecados, (snapshot) => {
      const recados = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      setData(prev => ({ ...prev, recados }));
    });

    // Listen for users
    const qUsers = query(collection(db, 'users'), orderBy('username', 'asc'));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UserAccount));
      setData(prev => ({ ...prev, users }));
    });

    // Listen for reviews
    const qReviews = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'));
    const unsubReviews = onSnapshot(qReviews, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      setData(prev => ({ ...prev, reviews }));
    });

    // Listen for nextProtocol (stored in a settings doc)
    const unsubSettings = onSnapshot(doc(db, 'settings', 'counters'), (doc) => {
      if (doc.exists()) {
        setData(prev => ({ ...prev, nextProtocol: doc.data().nextProtocol || 1 }));
      }
    });

    return () => {
      unsubEntries();
      unsubIscaControl();
      unsubMessages();
      unsubNotifications();
      unsubUnitTabs();
      unsubAnnouncements();
      unsubRecados();
      unsubUsers();
      unsubReviews();
      unsubSettings();
    };
  }, []);

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('active_session_user');
    const sessionUnit = sessionStorage.getItem('active_session_unit');
    
    let currentData: AppData = { 
      entries: [], 
      iscaControlEntries: [], 
      messages: [], 
      notifications: [],
      unitTabs: [],
      lastAuthor: '', 
      nextProtocol: 1,
      announcements: [],
      recados: []
    };

    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        currentData = {
          ...parsed,
          entries: parsed.entries || [],
          iscaControlEntries: parsed.iscaControlEntries || [],
          messages: parsed.messages || [],
          notifications: parsed.notifications || [],
          unitTabs: parsed.unitTabs || [],
          announcements: parsed.announcements || [],
          recados: parsed.recados || []
        };
      } catch (e) { console.error(e); }
    }

    if (currentData.entries.length === 0) {
      const demoEntry: LogisticsEntry = {
        id: 'demo-protocol-platinum',
        protocol: 1000,
        timestamp: new Date().toISOString(),
        author: 'SISTEMA',
        responsavelPreAlerta: 'DEMONSTRAÇÃO',
        motorista: 'JOSE ALVES (CONDUTOR EXEMPLO)',
        placaCavalo: 'BRA2E26',
        placaVeiculo: ['BAU-3C00'],
        numIsca: ['R100002345', 'R100000879'],
        numNF: ['455601'],
        uma: ['UMA-332'],
        codigoProduto: ['SKU-1022'],
        iscaPertencente: ['Araçariguama-SP', 'Araçariguama-SP'],
        iscaStatuses: [OperationStatus.ROTA_IDA, OperationStatus.ROTA_IDA],
        origem: 'Santa Luzia-MG',
        destino: 'Guarulhos-SP',
        tipoVeiculo: VehicleType.BAU,
        status: OperationStatus.ROTA_IDA,
        observacoes: 'PROTOCOLO DE DEMONSTRAÇÃO GERADO PARA VALIDAÇÃO DE FLUXO SANTA LUZIA -> GUARULHOS.',
        embarqueIsca: [LoadingPosition.SUPERIOR_DIREITO, LoadingPosition.SUPERIOR_ESQUERDO],
        embarqueObservacoes: ['EMBARQUE OK', 'EMBARQUE OK'],
        unitId: 'demo-unit'
      };
      currentData.entries = [demoEntry];
      currentData.nextProtocol = 1001;
      
      if (currentData.unitTabs.length === 0) {
        currentData.unitTabs = [
          { id: 'unit-slz', name: 'Santa Luzia-MG', password: '123', createdAt: new Date().toISOString() },
          { id: 'unit-gru', name: 'Guarulhos-SP', password: '123', createdAt: new Date().toISOString() },
          { id: 'unit-arc', name: 'Araçariguama-SP', password: '123', createdAt: new Date().toISOString() }
        ];
      }
    }

    setData(currentData);

    if (sessionUser && sessionUnit) {
      setCurrentUser(sessionUser);
      setCurrentUserUnit(sessionUnit);
      setIsAuthenticated(true);
      
      const usersSaved = localStorage.getItem(STORAGE_USERS_KEY);
      if (usersSaved) {
        const list = JSON.parse(usersSaved);
        const current = list.find((u: any) => u.username.toUpperCase() === sessionUser.toUpperCase());
        if (current) {
          setUserProfile(current);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUserUnit) {
      // Initialize socket connection
      const socket = io();
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('join_unit', currentUserUnit);
        if (userProfile.units) {
          userProfile.units.forEach((u: string) => socket.emit('join_unit', u));
        }
      });

      socket.on('receive_message', (message: ChatMessage) => {
        setData(prev => {
          // Avoid duplicate messages if they already exist in local state
          if (prev.messages.some(m => m.id === message.id)) return prev;
          return {
            ...prev,
            messages: [...prev.messages, message]
          };
        });
      });

      socket.on('receive_notification', (notification: Notification) => {
        setData(prev => {
          if (prev.notifications.some(n => n.id === notification.id)) return prev;
          return {
            ...prev,
            notifications: [notification, ...prev.notifications]
          };
        });
      });

      socket.on('receive_announcement', (announcement: Announcement) => {
        setData(prev => {
          if (prev.announcements.some(a => a.id === announcement.id)) return prev;
          return {
            ...prev,
            announcements: [announcement, ...prev.announcements]
          };
        });
      });

      socket.on('receive_recado', (recado: Recado) => {
        setData(prev => {
          if (prev.recados.some(r => r.id === recado.id)) return prev;
          return {
            ...prev,
            recados: [recado, ...prev.recados]
          };
        });
      });

      socket.on('receive_recado_response', (data: any) => {
        setData(prev => ({
          ...prev,
          recados: prev.recados.map(r => r.id === data.recadoId ? {
            ...r,
            status: 'responded',
            response: data.response,
            respondedBy: data.respondedBy,
            respondedAt: data.respondedAt
          } : r)
        }));
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [isAuthenticated, currentUserUnit, userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Cleanup notifications older than 24 hours
  useEffect(() => {
    const cleanup = () => {
      const now = new Date().getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      setData(prev => {
        const filtered = prev.notifications.filter(n => {
          const timestamp = new Date(n.timestamp).getTime();
          return (now - timestamp) < twentyFourHours;
        });
        
        if (filtered.length !== prev.notifications.length) {
          return { ...prev, notifications: filtered };
        }
        return prev;
      });
    };

    cleanup();
    const interval = setInterval(cleanup, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (user: string, unit: string) => {
    setCurrentUser(user.toUpperCase());
    setCurrentUserUnit(unit);
    setIsAuthenticated(true);
    sessionStorage.setItem('active_session_user', user.toUpperCase());
    sessionStorage.setItem('active_session_unit', unit);
    
    const current = data.users.find((u: any) => u.username.toUpperCase() === user.toUpperCase());
    if (current) {
      setUserProfile(current);
      // Join all user units in socket
      if (socketRef.current && current.units) {
        current.units.forEach((u: string) => socketRef.current?.emit('join_unit', u));
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setCurrentUserUnit('');
    setUserProfile({});
    sessionStorage.removeItem('active_session_user');
    sessionStorage.removeItem('active_session_unit');
    setExpandedSection('none');
  };

  const addNotification = async (unit: string, text: string, type: 'info' | 'alert' | 'success' = 'info') => {
    const newNotif = {
      unit,
      text,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };

    try {
      await addDoc(collection(db, 'notifications'), newNotif);
    } catch (e) {
      console.error("Error adding notification: ", e);
    }

    if (socketRef.current) {
      socketRef.current.emit('send_notification', { ...newNotif, id: 'temp' });
    }
  };

  const handleAddProtocol = async (entry: Omit<LogisticsEntry, 'id' | 'timestamp' | 'protocol'>) => {
    const protocol = data.nextProtocol;
    const newEntry = {
      ...entry,
      protocol: protocol,
      timestamp: new Date().toISOString(),
      iscaStatuses: entry.numIsca.map(() => entry.status)
    };

    try {
      await addDoc(collection(db, 'entries'), newEntry);
      await setDoc(doc(db, 'settings', 'counters'), { nextProtocol: protocol + 1 }, { merge: true });
      
      addNotification(entry.origem, `Protocolo #P${protocol} registrado com sucesso para ${entry.destino}.`, 'success');
      addNotification(entry.destino, `Novo Pré-Alerta recebido (#P${protocol}) vindo de ${entry.origem}.`, 'info');
      entry.iscaPertencente.forEach(owner => {
        addNotification(owner, `Suas iscas do protocolo #P${protocol} estão em rota para ${entry.destino}.`, 'success');
      });

      if (entry.taggedUsers) {
        entry.taggedUsers.forEach(username => {
          const taggedUser = data.users.find((u: any) => u.username.toUpperCase() === username.toUpperCase());
          if (taggedUser && taggedUser.units) {
            taggedUser.units.forEach((u: string) => {
              addNotification(u, `Você foi marcado no Pré-Alerta #P${protocol} por ${entry.author}.`, 'info');
            });
          }
        });
      }
    } catch (e) {
      console.error("Error adding protocol: ", e);
    }

    setExpandedSection('pre_alerts');
  };

  const handleSendRecado = async (recado: Omit<Recado, 'id' | 'timestamp' | 'status'>) => {
    const newRecado = {
      ...recado,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    try {
      await addDoc(collection(db, 'recados'), newRecado);
      addNotification(recado.toUnit, `Novo recado de ${recado.fromUnit}: ${recado.subject}`, 'info');
    } catch (e) {
      console.error("Error sending recado: ", e);
    }
  };

  const handleSendRecadoResponse = async (recadoId: string, response: string) => {
    const now = new Date().toISOString();
    const recado = data.recados.find(r => r.id === recadoId);
    if (!recado) return;

    try {
      await updateDoc(doc(db, 'recados', recadoId), {
        status: 'responded',
        response,
        respondedBy: currentUser,
        respondedAt: now
      });
      addNotification(recado.fromUnit, `Resposta recebida de ${recado.toUnit} para o recado: ${recado.subject}`, 'success');
    } catch (e) {
      console.error("Error responding to recado: ", e);
    }
  };

  const handleAddAnnouncement = async (ann: Omit<Announcement, 'id' | 'timestamp'>) => {
    const newAnn = {
      ...ann,
      timestamp: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'announcements'), newAnn);
      
      ann.taggedUsers.forEach(username => {
        const taggedUser = data.users.find((u: any) => u.username.toUpperCase() === username.toUpperCase());
        if (taggedUser && taggedUser.units) {
          taggedUser.units.forEach((u: string) => {
            addNotification(u, `Novo comunicado: "${ann.subject}" - Você foi marcado por ${ann.author}.`, 'info');
          });
        }
      });
    } catch (e) {
      console.error("Error adding announcement: ", e);
    }
  };

  const handleAddIscaControl = async (entry: Omit<LogisticsEntry, 'id' | 'timestamp' | 'protocol'>) => {
    const newEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      iscaStatuses: entry.numIsca.map(() => entry.status)
    };

    try {
      await addDoc(collection(db, 'iscaControlEntries'), newEntry);
      addNotification(entry.origem, `Registro de Controle de Isca efetuado para o motorista ${entry.motorista}.`, 'info');
      setExpandedSection('isca_control');
    } catch (e) {
      console.error("Error adding isca control: ", e);
    }
  };

  const handleSelectEntry = (entry: LogisticsEntry) => {
    setSelectedEntry(entry);
    if (!entry.readByUnits?.includes(currentUserUnit)) {
      handleUpdateEntry(entry.id, { 
        readByUnits: [...(entry.readByUnits || []), currentUserUnit] 
      });
    }
  };

  const handleUpdateEntry = async (id: string, updates: Partial<LogisticsEntry>) => {
    const allEntries = [...data.entries, ...data.iscaControlEntries];
    const entry = allEntries.find(e => e.id === id);
    const isControl = data.iscaControlEntries.some(e => e.id === id);
    const collectionName = isControl ? 'iscaControlEntries' : 'entries';

    try {
      if (entry) {
        if (updates.iscaStatuses) {
          const oldStatuses = entry.iscaStatuses || entry.numIsca.map(() => entry.status);
          updates.iscaStatuses.forEach((newS, idx) => {
            if (newS !== oldStatuses[idx]) {
              const iscaId = entry.numIsca[idx];
              const msg = newS === OperationStatus.NO_DESTINO 
                ? `🚨 ALERTA DE RESGATE: A Isca #${iscaId} foi resgatada em ${entry.destino}. Processo realizado com sucesso.`
                : `⚠️ ALERTA DE EXTRAVIO: Atenção! Isca #${iscaId} marcada como EXTRAVIADA em ${entry.destino}. Iniciar protocolos de busca.`;
              
              const type = newS === OperationStatus.NO_DESTINO ? 'success' : 'alert';
              addNotification(entry.origem, msg, type);
              addNotification(entry.iscaPertencente[idx], msg, type);
            }
          });
        }
        await updateDoc(doc(db, collectionName, id), updates);
      }
    } catch (e) {
      console.error("Error updating entry: ", e);
    }
    setEditingEntry(null);
  };

  const handleAddUnitTab = async (unit: UnitTab) => {
    try {
      await addDoc(collection(db, 'unitTabs'), unit);
    } catch (e) {
      console.error("Error adding unit tab: ", e);
    }
  };

  const handleUpdateUnitTab = async (id: string, updates: Partial<UnitTab>) => {
    try {
      await updateDoc(doc(db, 'unitTabs', id), updates);
    } catch (e) {
      console.error("Error updating unit tab: ", e);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!id) {
      alert('ERRO: ID INVÁLIDO PARA EXCLUSÃO.');
      return;
    }

    if (window.confirm('TEM CERTEZA QUE DESEJA EXCLUIR ESTE REGISTRO? ESTA AÇÃO NÃO PODE SER DESFEITA.')) {
      const isControl = data.iscaControlEntries.some(e => e.id === id);
      const collectionName = isControl ? 'iscaControlEntries' : 'entries';
      try {
        await deleteDoc(doc(db, collectionName, id));
      } catch (e) {
        console.error("Error deleting entry: ", e);
      }
    }
  };

  const allUsers: UserAccount[] = JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '[]');

  const handleDeleteUnitTab = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'unitTabs', id));
    } catch (e) {
      console.error("Error deleting unit tab: ", e);
    }
  };

  const handleSendMessage = async (text: string, channel: 'global' | 'unit' | 'private', recipient?: string) => {
    const newMessage = {
      author: currentUser,
      authorUnit: currentUserUnit,
      text,
      timestamp: new Date().toISOString(),
      channel,
      recipient
    };

    try {
      await addDoc(collection(db, 'messages'), newMessage);
    } catch (e) {
      console.error("Error sending message: ", e);
    }
  };

  const userUnits = userProfile.units || [currentUserUnit];
  const unreadCount = data.notifications.filter(n => !n.read && userUnits.includes(n.unit)).length;

  const markAllNotificationsAsRead = async () => {
    const unread = data.notifications.filter(n => !n.read && userUnits.includes(n.unit));
    try {
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
    } catch (e) {
      console.error("Error marking notifications as read: ", e);
    }
  };

  const NavIcon = ({ type, label, icon: Icon, color = "#C0955C", onClick }: { type: any, label: string, icon: any, color?: string, onClick?: () => void }) => (
    <div className="relative group">
      <button 
        onClick={onClick ? onClick : () => setExpandedSection(type)}
        className="w-full p-4 md:p-8 flex flex-col items-center gap-3 md:gap-6 rounded-2xl md:rounded-[2.5rem] transition-all duration-500 bg-white/[0.01] border border-white/[0.03] hover:bg-roasted-gold/[0.05] hover:border-roasted-gold/30 hover:shadow-[0_20px_50px_rgba(192,149,92,0.1)] md:hover:-translate-y-1"
      >
        <div 
          className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
          style={{ background: `radial-gradient(circle, ${color}15 0%, transparent 80%)`, color: color }}
        >
          <Icon className="w-6 h-6 md:w-10 md:h-10 filter drop-shadow-[0_0_8px_currentColor]" />
        </div>
        <span className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-center leading-tight font-mono" style={{ color: color }}>
          {label}
        </span>
      </button>
    </div>
  );

  const BackToMenu = () => (
    <button onClick={() => setExpandedSection('none')} className="mb-8 md:mb-12 flex items-center gap-3 md:gap-5 px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl bg-black/40 border border-roasted-gold/20 text-[9px] md:text-xs font-black uppercase tracking-widest text-roasted-gold hover:bg-roasted-gold hover:text-espresso-dark transition-all">
      <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 rotate-180" /> VOLTAR AO MENU
    </button>
  );

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen bg-[#120A07] text-[#f8fafc] relative selection:bg-roasted-gold selection:text-espresso-dark overflow-hidden`}>
      <header className="fixed top-0 left-0 right-0 z-[120] px-4 md:px-16 py-4 md:py-8 flex justify-between items-center bg-[#120A07]/80 backdrop-blur-3xl border-b border-roasted-gold/10">
        <div className="flex items-center gap-4 md:gap-8 cursor-pointer group" onClick={() => setExpandedSection('none')}>
          <Logo3D className="w-10 h-10 md:w-14 md:h-14" />
          <div className="border-l-2 border-roasted-gold/20 pl-4 md:pl-8">
            <h1 className="text-xl md:text-3xl font-black tracking-tighter italic uppercase text-roasted-gold brand-text">PRÉ ALERTA</h1>
            <div className="hidden sm:flex items-center gap-4 mt-1.5">
               <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black">{currentUser} | {currentUserUnit}</span>
               <div className="w-2 h-2 bg-roasted-gold rounded-full animate-pulse shadow-[0_0_100px_#C0955C]"></div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={() => setExpandedSection('chat')}
            className={`p-2.5 md:p-3 rounded-lg md:rounded-xl border transition-all relative bg-white/5 border-white/10 text-roasted-gold hover:border-roasted-gold/50`}
            title="Chat de Operações"
          >
            <MessageSquareIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <div className="relative" ref={bellRef}>
            <button 
              onClick={() => { setShowNotifications(!showNotifications); if(!showNotifications) markAllNotificationsAsRead(); }} 
              className={`p-2.5 md:p-3 rounded-lg md:rounded-xl border transition-all relative ${unreadCount > 0 ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/10 text-roasted-gold'}`}
            >
              <BellIcon className={`w-5 h-5 md:w-6 md:h-6 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 md:w-6 md:h-6 bg-red-500 text-white text-[8px] md:text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#120A07] animate-in zoom-in-50">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-4 w-[280px] md:w-96 bg-[#120A07] border border-roasted-gold/20 rounded-2xl md:rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-4 md:p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                  <h3 className="text-[9px] md:text-[10px] font-black text-roasted-gold uppercase tracking-widest">Notificações</h3>
                  <button onClick={() => setShowNotifications(false)}><XMarkIcon className="w-4 h-4 text-white/20" /></button>
                </div>
                <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
                  {data.notifications.filter(n => userUnits.includes(n.unit)).map(n => (
                    <div key={n.id} className={`p-4 md:p-6 border-b border-white/5 hover:bg-white/5 transition-all ${!n.read ? 'bg-roasted-gold/[0.02]' : ''}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                        <div className="flex-1">
                          <p className="text-[10px] md:text-xs font-medium text-white/80 leading-relaxed">{n.text}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[7px] md:text-[8px] font-black text-white/20 uppercase">{new Date(n.timestamp).toLocaleString()}</span>
                            <span className="text-[6px] font-black text-roasted-gold/40 uppercase border border-roasted-gold/10 px-1.5 py-0.5 rounded">{n.unit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.notifications.filter(n => userUnits.includes(n.unit)).length === 0 && (
                    <div className="p-12 text-center opacity-20">
                      <BellIcon className="w-8 h-8 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Sem notificações</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div 
            onClick={() => setExpandedSection('settings')}
            className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl border border-white/10 overflow-hidden bg-black/40 cursor-pointer hover:border-roasted-gold transition-all flex items-center justify-center group"
          >
            {userProfile.profilePic ? (
              <img src={userProfile.profilePic} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-roasted-gold" />
            )}
          </div>
        </div>
      </header>

      <main ref={mainRef} className="pt-28 md:pt-48 pb-20 md:pb-48 px-4 md:px-16 max-w-full relative z-10">
        {expandedSection === 'none' && (
          <div className="animate-in fade-in zoom-in-95 duration-1000 relative">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-11 gap-3 md:gap-6">
              <NavIcon type="new" label="ENVIO DO PRE ALERTA" icon={PlusIcon} color="#C0955C" />
              <NavIcon type="isca_control" label="CONTROLE DE ISCAS" icon={SparklesIcon} color="#C0955C" />
              <NavIcon type="pre_alerts" label="HISTÓRICO PRÉ ALERTA" icon={ClipboardIcon} color="#C0955C" />
              <NavIcon type="chat" label="Chat" icon={MessageSquareIcon} color="#64ffda" />
              <NavIcon type="billing" label="COBRANÇAS" icon={AlertIcon} color="#ef4444" />
              <NavIcon type="announcements" label="Comunicados" icon={MailIcon} color="#C0955C" />
              <NavIcon type="stats" label="Dados" icon={SlidersHorizontalIcon} color="#C0955C" />
              <NavIcon type="agents" label="Agentes" icon={UsersIcon} color="#C0955C" />
              <NavIcon type="notes" label="Notas" icon={NoteIcon} color="#C0955C" />
              <NavIcon type="settings" label="Config" icon={SettingsIcon} color="#C0955C" />
              <NavIcon type="logout" label="Sair" icon={LogOutIcon} color="#ef4444" onClick={handleLogout} />
            </div>

            <div className="fixed bottom-6 right-20 md:right-28 z-[110] animate-in fade-in duration-1000">
               <button 
                onClick={() => setExpandedSection('founder')}
                className="group flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-espresso-dark/40 backdrop-blur-sm border border-roasted-gold/10 rounded-full hover:border-roasted-gold/40 hover:bg-espresso-dark/80 transition-all shadow-xl"
               >
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-roasted-gold/5 flex items-center justify-center text-roasted-gold/60 group-hover:text-roasted-gold transition-colors">
                    <AwardIcon className="w-2 md:w-2.5 h-2 md:h-2.5" />
                  </div>
                  <div className="flex flex-col items-start leading-none pointer-events-none">
                     <span className="text-[6px] md:text-[8px] font-black text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">Jefferson A.</span>
                     <span className="hidden md:inline text-[6px] font-bold text-white/20 uppercase tracking-tighter mt-0.5">Fundador • GR 2022</span>
                  </div>
               </button>
            </div>
          </div>
        )}

        <div className="space-y-8 md:space-y-16">
          {expandedSection !== 'none' && <BackToMenu />}
          {expandedSection === 'isca_control' && (
            <div className="coffee-panel p-6 md:p-20 animate-in slide-in-from-bottom-10">
              <IscaControl 
                onAdd={handleAddIscaControl} 
                initialAuthor={data.lastAuthor} 
                entries={data.entries} 
                iscaControlEntries={data.iscaControlEntries} 
                unitTabs={data.unitTabs} 
                onAddUnitTab={handleAddUnitTab} 
                onUpdateEntry={handleUpdateEntry} 
                onDeleteEntry={handleDeleteEntry}
                onEditEntry={(entry) => setEditingEntry(entry)} 
                currentUser={currentUser} 
              />
            </div>
          )}
          {expandedSection === 'new' && (
            <div className="coffee-panel p-6 md:p-20 border-2 border-roasted-gold/10">
              <LogisticsForm 
                onAdd={handleAddProtocol} 
                initialAuthor={currentUser} 
                entries={data.entries} 
                iscaControlEntries={data.iscaControlEntries} 
                userUnits={userProfile.units} 
                users={allUsers}
              />
            </div>
          )}
          {expandedSection === 'chat' && (
            <ChatModule 
              messages={data.messages} 
              currentUser={currentUser} 
              currentUserUnit={currentUserUnit} 
              onSendMessage={handleSendMessage} 
              allUsers={allUsers}
            />
          )}
          {expandedSection === 'announcements' && (
            <AnnouncementsModule 
              announcements={data.announcements} 
              users={data.users} 
              currentUser={currentUser} 
              currentUserUnit={currentUserUnit} 
              onAddAnnouncement={handleAddAnnouncement} 
            />
          )}
          {expandedSection === 'pre_alerts' && <PreAlertsView entries={data.entries} unitTabs={data.unitTabs} onAddUnitTab={handleAddUnitTab} onSelect={handleSelectEntry} onUpdateEntry={handleUpdateEntry} currentUser={currentUser} currentUserUnit={currentUserUnit} />}
          {expandedSection === 'billing' && (
            <IscaBilling 
              entries={data.entries} 
              iscaControlEntries={data.iscaControlEntries}
              unitTabs={data.unitTabs} 
              onAddUnitTab={handleAddUnitTab} 
              onAddNotification={addNotification} 
              onSendRecado={handleSendRecado}
              onSendResponse={handleSendRecadoResponse}
              onUpdateEntry={handleUpdateEntry}
              recados={data.recados}
              currentUser={currentUser} 
              currentUserUnit={currentUserUnit}
              onBackToMenu={() => setExpandedSection('none')}
            />
          )}
          {expandedSection === 'stats' && <DashboardStats entries={data.entries} unitTabs={data.unitTabs} onAddUnitTab={handleAddUnitTab} />}
          {expandedSection === 'notes' && <NotesModule currentUser={currentUser} />}
          {expandedSection === 'agents' && <AgentsModule currentUser={currentUser} users={data.users} reviews={data.reviews} />}
          {expandedSection === 'founder' && <FounderSection />}
          {expandedSection === 'settings' && (
            <SettingsModule 
              currentUser={currentUser} 
              onUpdateCurrentUser={setUserProfile} 
              unitTabs={data.unitTabs}
              onUpdateUnitTab={handleUpdateUnitTab}
              onDeleteUnitTab={handleDeleteUnitTab}
              users={data.users}
            />
          )}
        </div>
      </main>

      {selectedEntry && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
          <div className="w-full max-w-5xl bg-white rounded-2xl md:rounded-[3rem] overflow-hidden relative shadow-[0_0_100px_rgba(192,149,92,0.2)]">
            <button onClick={() => setSelectedEntry(null)} className="absolute top-4 md:top-8 right-4 md:right-8 z-10 w-10 h-10 md:w-12 md:h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-roasted-gold transition-all"><XMarkIcon className="w-5 h-5 md:w-6 md:h-6" /></button>
            <ProtocolView entry={selectedEntry} />
          </div>
        </div>
      )}

      <OnlineUsers currentUser={currentUser} currentUserUnit={currentUserUnit} />

      {birthdayCelebrant && (
        <BirthdayModal agent={birthdayCelebrant} onClose={() => setBirthdayCelebrant(null)} />
      )}
    </div>
  );
};

export default App;

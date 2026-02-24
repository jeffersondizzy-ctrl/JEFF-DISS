
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { supabase } from './supabaseClient';
import { AppState, LogisticsEntry, AppData, OperationStatus, ChatMessage, CriticalAlert, UnitTab, Notification, UserAccount, VehicleType, LoadingPosition, Announcement, Recado } from './types';
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
  NoteIcon,
  MenuIcon
} from './components/icons';

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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [data, setData] = useState<AppData>({ 
    entries: [], 
    iscaControlEntries: [], 
    messages: [], 
    notifications: [],
    unitTabs: [],
    lastAuthor: '', 
    nextProtocol: 1,
    announcements: [],
    recados: []
  });
  const [selectedEntry, setSelectedEntry] = useState<LogisticsEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<LogisticsEntry | null>(null);
  const [loginError, setLoginError] = useState('');
  
  const socketRef = useRef<Socket | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const isRemoteUpdate = useRef(false);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [notesData, setNotesData] = useState<Record<string, UserNote[]>>({});
  const [reviewsData, setReviewsData] = useState<any[]>([]);

  useEffect(() => {
    const handleBack = () => setExpandedSection('none');
    window.addEventListener('back-to-menu', handleBack);
    return () => window.removeEventListener('back-to-menu', handleBack);
  }, []);

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('active_session_user');
    const sessionUnit = sessionStorage.getItem('active_session_unit');
    const sessionPass = sessionStorage.getItem('active_session_pass');
    
    if (sessionUser && sessionUnit && sessionPass) {
      setCurrentUser(sessionUser);
      setCurrentUserUnit(sessionUnit);
      setIsAuthenticated(true);
    }
  }, []);

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(window.location.origin, {
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    // Fallback for Vercel/Serverless where Socket.io might not be available
    const loadFromSupabaseFallback = async () => {
      if (!supabase) return;
      console.log('Attempting Supabase fallback load...');
      try {
        const { data: persistenceData } = await supabase.from('app_persistence').select('*');
        if (persistenceData) {
          const appData = persistenceData.find(d => d.key === 'app_data')?.content;
          const usersData = persistenceData.find(d => d.key === 'users_data')?.content;
          const notesData = persistenceData.find(d => d.key === 'notes_data')?.content;
          const reviewsData = persistenceData.find(d => d.key === 'reviews_data')?.content;

          if (appData) setData(appData);
          if (usersData) setAllUsers(usersData);
          if (notesData) setNotesData(notesData);
          if (reviewsData) setReviewsData(reviewsData);
          
          console.log('Supabase fallback load successful');
          setIsDataLoaded(true);
        }
      } catch (err) {
        console.error('Supabase fallback error:', err);
      }
    };

    // Load immediately from Supabase to ensure "online" data is available
    loadFromSupabaseFallback();

    // Supabase Realtime Subscription for "100% online" sync
    let subscription: any = null;
    if (supabase) {
      subscription = supabase
        .channel('app_changes')
        .on('postgres_changes', { event: 'INSERT', table: 'app_persistence' }, (payload) => {
          const { key, content } = payload.new;
          if (key === 'app_data') setData(content);
          if (key === 'users_data') setAllUsers(content);
          if (key === 'notes_data') setNotesData(content);
          if (key === 'reviews_data') setReviewsData(content);
        })
        .on('postgres_changes', { event: 'UPDATE', table: 'app_persistence' }, (payload) => {
          const { key, content } = payload.new;
          if (key === 'app_data') setData(content);
          if (key === 'users_data') setAllUsers(content);
          if (key === 'notes_data') setNotesData(content);
          if (key === 'reviews_data') setReviewsData(content);
        })
        // Instant updates for notifications and messages via dedicated tables
        .on('postgres_changes', { event: 'INSERT', table: 'notificacoes' }, (payload) => {
          const newNotif = payload.new as Notification;
          setData(prev => {
            if (prev.notifications.some(n => n.id === newNotif.id)) return prev;
            return { ...prev, notifications: [newNotif, ...prev.notifications] };
          });
        })
        .on('postgres_changes', { event: 'INSERT', table: 'mensagens' }, (payload) => {
          const newMessage = payload.new as ChatMessage;
          setData(prev => {
            if (prev.messages.some(m => m.id === newMessage.id)) return prev;
            return { ...prev, messages: [...prev.messages, newMessage] };
          });
        })
        .subscribe();
    }

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('request_initial_data');
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection failed. Supabase fallback is active.', err.message);
    });

    socket.on('login_success', (user: UserAccount) => {
      console.log('Login success:', user.username);
      setCurrentUser(user.username.toUpperCase());
      
      // Recover unit from session storage if not provided
      const sessionUnit = sessionStorage.getItem('active_session_unit') || (user.units && user.units[0]) || '';
      setCurrentUserUnit(sessionUnit);
      
      setIsAuthenticated(true);
      setUserProfile(user);
      setLoginError('');
      
      sessionStorage.setItem('active_session_user', user.username.toUpperCase());
      if (sessionUnit) sessionStorage.setItem('active_session_unit', sessionUnit);
    });

    socket.on('login_error', (error: string) => {
      console.error('Login error:', error);
      setLoginError(error);
      setIsAuthenticated(false);
    });

    socket.on('initial_data', ({ appData, usersData, notesData, reviewsData }: { appData: AppData, usersData: UserAccount[], notesData: Record<string, UserNote[]>, reviewsData: any[] }) => {
      setData(appData);
      setAllUsers(usersData);
      setNotesData(notesData);
      setReviewsData(reviewsData);
      setIsDataLoaded(true);
      
      const sessionUser = sessionStorage.getItem('active_session_user');
      const sessionPass = sessionStorage.getItem('active_session_pass');
      
      if (sessionUser && sessionPass) {
        socket.emit('login', { username: sessionUser, password: sessionPass });
        const current = usersData.find(u => u.username.toUpperCase() === sessionUser.toUpperCase());
        if (current) {
          setUserProfile(current);
          if (current.units) {
            current.units.forEach(u => socket.emit('join_unit', u));
          }
        }
      } else if (currentUser) {
        const current = usersData.find(u => u.username.toUpperCase() === currentUser.toUpperCase());
        if (current) setUserProfile(current);
      }
    });

    // --- REAL-TIME LISTENERS ---

    socket.on('protocol_added', (entry: LogisticsEntry) => {
      setData(prev => ({
        ...prev,
        entries: [entry, ...prev.entries],
        nextProtocol: (entry.protocol || prev.nextProtocol) + 1,
        lastAuthor: entry.author
      }));
    });

    socket.on('entry_updated', (data: { id: string, updates: Partial<LogisticsEntry> }) => {
      setData(prev => {
        const isMainEntry = prev.entries.some(e => e.id === data.id);
        if (isMainEntry) {
          return {
            ...prev,
            entries: prev.entries.map(e => e.id === data.id ? { ...e, ...data.updates } : e)
          };
        } else {
          return {
            ...prev,
            iscaControlEntries: prev.iscaControlEntries.map(e => e.id === data.id ? { ...e, ...data.updates } : e)
          };
        }
      });
    });

    socket.on('entry_deleted', (id: string) => {
      setData(prev => ({
        ...prev,
        entries: prev.entries.filter(e => e.id !== id),
        iscaControlEntries: prev.iscaControlEntries.filter(e => e.id !== id)
      }));
    });

    socket.on('isca_control_added', (entry: LogisticsEntry) => {
      setData(prev => ({
        ...prev,
        iscaControlEntries: [entry, ...prev.iscaControlEntries],
        lastAuthor: entry.author
      }));
    });

    socket.on('unit_tab_added', (unit: UnitTab) => {
      setData(prev => ({ ...prev, unitTabs: [...prev.unitTabs, unit] }));
    });

    socket.on('unit_tab_updated', (data: { id: string, updates: Partial<UnitTab> }) => {
      setData(prev => ({
        ...prev,
        unitTabs: prev.unitTabs.map(u => u.id === data.id ? { ...u, ...data.updates } : u)
      }));
    });

    socket.on('unit_tab_deleted', (id: string) => {
      setData(prev => ({ ...prev, unitTabs: prev.unitTabs.filter(u => u.id !== id) }));
    });

    socket.on('user_signed_up', (newUser: UserAccount) => {
      setAllUsers(prev => [...prev, newUser]);
    });

    socket.on('user_profile_updated', (data: { username: string, updates: Partial<UserAccount> }) => {
      setAllUsers(prev => prev.map(u => u.username.toUpperCase() === data.username.toUpperCase() ? { ...u, ...data.updates } : u));
      if (currentUser && data.username.toUpperCase() === currentUser.toUpperCase()) {
        setUserProfile(prev => ({ ...prev, ...data.updates }));
      }
    });

    socket.on('users_data_updated', (newUsers: UserAccount[]) => {
      setAllUsers(newUsers);
    });

    socket.on('notes_updated', (data: { username: string, notes: UserNote[] }) => {
      setNotesData(prev => ({ ...prev, [data.username.toUpperCase()]: data.notes }));
    });

    socket.on('review_added', (review: any) => {
      setReviewsData(prev => [...prev, review]);
    });

    socket.on('receive_message', (message: ChatMessage) => {
      setData(prev => {
        if (prev.messages.some(m => m.id === message.id)) return prev;
        return { ...prev, messages: [...prev.messages, message] };
      });
    });

    socket.on('receive_notification', (notif: Notification) => {
      setData(prev => {
        if (prev.notifications.some(n => n.id === notif.id)) return prev;
        return { ...prev, notifications: [notif, ...prev.notifications] };
      });
    });

    socket.on('receive_announcement', (ann: Announcement) => {
      setData(prev => {
        if (prev.announcements.some(a => a.id === ann.id)) return prev;
        return { ...prev, announcements: [ann, ...prev.announcements] };
      });
    });

    socket.on('receive_recado', (recado: Recado) => {
      setData(prev => {
        if (prev.recados.some(r => r.id === recado.id)) return prev;
        return { ...prev, recados: [recado, ...prev.recados] };
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
      if (subscription) {
        supabase?.removeChannel(subscription);
      }
    };
  }, [currentUser]);

  useEffect(() => {
    if (isAuthenticated && currentUserUnit && socketRef.current) {
      socketRef.current.emit('join_unit', currentUserUnit);
      if (userProfile.units) {
        userProfile.units.forEach((u: string) => socketRef.current?.emit('join_unit', u));
      }
    }
  }, [isAuthenticated, currentUserUnit, userProfile.units]);

  // Remove localStorage persistence to ensure 100% online data
  /*
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (allUsers.length > 0) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(allUsers));
    }
  }, [allUsers]);
  */

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

  const handleLogin = async (user: string, unit: string, pass: string) => {
    console.log('Attempting login for:', user, 'at unit:', unit);
    setLoginError('');
    
    if (!isDataLoaded && allUsers.length === 0) {
      console.warn('Login attempted before data loaded');
      setLoginError('CARREGANDO DADOS DO SERVIDOR... AGUARDE UM INSTANTE.');
      return;
    }

    sessionStorage.setItem('active_session_user', user.toUpperCase());
    sessionStorage.setItem('active_session_unit', unit);
    sessionStorage.setItem('active_session_pass', pass);
    
    // Set a safety timeout to prevent "stuck verifying"
    const timeoutId = setTimeout(() => {
      if (!isAuthenticated) {
        console.warn('Socket login timeout, trying local fallback');
        performLocalLogin(user, unit, pass);
      }
    }, 4000);

    if (socketRef.current && socketRef.current.connected) {
      console.log('Emitting login via socket');
      socketRef.current.emit('login', { username: user, password: pass });
      if (unit) socketRef.current.emit('join_unit', unit);
    } else {
      console.log('Socket not connected, performing local login');
      clearTimeout(timeoutId);
      performLocalLogin(user, unit, pass);
    }
  };

  const performLocalLogin = (user: string, unit: string, pass: string) => {
    const foundUser = allUsers.find(u => 
      u.username.toUpperCase() === user.toUpperCase() && 
      u.personalPassword === pass
    );

    if (foundUser) {
      console.log('Local login success');
      setCurrentUser(foundUser.username.toUpperCase());
      setCurrentUserUnit(unit || (foundUser.units && foundUser.units[0]) || '');
      setIsAuthenticated(true);
      setUserProfile(foundUser);
      setLoginError('');
    } else {
      console.warn('Local login failed');
      setLoginError('ACESSO NEGADO: ID OU SENHA INCORRETOS');
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

  const addNotification = (unit: string, text: string, type: 'info' | 'alert' | 'success' = 'info') => {
    const newNotif: Notification = {
      id: crypto.randomUUID(),
      unit,
      text,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };

    // Instant Supabase path
    if (supabase) {
      supabase.from('notificacoes').insert([newNotif]).then(({ error }) => {
        if (error) console.error('Supabase notification insert error:', error);
      });
    }

    if (socketRef.current) {
      socketRef.current.emit('send_notification', newNotif);
    }

    setData(prev => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications]
    }));
  };

  const handleAddProtocol = async (entry: Omit<LogisticsEntry, 'id' | 'timestamp' | 'protocol'>) => {
    const newEntry: LogisticsEntry = {
      ...entry,
      id: crypto.randomUUID(),
      protocol: data.nextProtocol,
      timestamp: new Date().toISOString(),
      iscaStatuses: entry.numIsca.map(() => entry.status)
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('add_protocol', newEntry);
    } else if (supabase) {
      console.log('Socket not connected, performing direct Supabase protocol addition...');
      const updatedEntries = [newEntry, ...data.entries];
      const nextProtocol = (newEntry.protocol || data.nextProtocol) + 1;
      try {
        const { error } = await supabase.from('app_persistence').upsert({ 
          key: 'app_data', 
          content: { ...data, entries: updatedEntries, nextProtocol, lastAuthor: newEntry.author }, 
          updated_at: new Date() 
        });
        if (!error) {
          setData(prev => ({ ...prev, entries: updatedEntries, nextProtocol, lastAuthor: newEntry.author }));
        }
      } catch (err) {
        console.error('Supabase protocol addition error:', err);
      }
    }
    
    addNotification(entry.origem, `Protocolo #P${data.nextProtocol} registrado com sucesso para ${entry.destino}.`, 'success');
    addNotification(entry.destino, `Novo Pré-Alerta recebido (#P${data.nextProtocol}) vindo de ${entry.origem}.`, 'info');
    entry.iscaPertencente.forEach(owner => {
      addNotification(owner, `Suas iscas do protocolo #P${data.nextProtocol} estão em rota para ${entry.destino}.`, 'success');
    });

    if (entry.taggedUsers) {
      entry.taggedUsers.forEach(username => {
        const taggedUser = allUsers.find(u => u.username.toUpperCase() === username.toUpperCase());
        if (taggedUser && taggedUser.units) {
          taggedUser.units.forEach((u: string) => {
            addNotification(u, `Você foi marcado no Pré-Alerta #P${data.nextProtocol} por ${entry.author}.`, 'info');
          });
        }
      });
    }

    setExpandedSection('pre_alerts');
  };

  const handleSendRecado = async (recado: Omit<Recado, 'id' | 'timestamp' | 'status'>) => {
    const newRecado: Recado = {
      ...recado,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_recado', newRecado);
    } else if (supabase) {
      console.log('Socket not connected, performing direct Supabase recado addition...');
      const updatedRecados = [newRecado, ...data.recados];
      try {
        const { error } = await supabase.from('app_persistence').upsert({ 
          key: 'app_data', 
          content: { ...data, recados: updatedRecados }, 
          updated_at: new Date() 
        });
        if (!error) {
          setData(prev => ({ ...prev, recados: updatedRecados }));
        }
      } catch (err) {
        console.error('Supabase recado addition error:', err);
      }
    }

    addNotification(recado.toUnit, `Novo recado de ${recado.fromUnit}: ${recado.subject}`, 'info');
  };

  const handleSendRecadoResponse = async (recadoId: string, response: string) => {
    const now = new Date().toISOString();
    const recado = data.recados.find(r => r.id === recadoId);
    if (!recado) return;

    const updatedRecados = data.recados.map(r => r.id === recadoId ? {
      ...r,
      status: 'responded',
      response,
      respondedBy: currentUser,
      respondedAt: now
    } : r) as Recado[];

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_recado_response', {
        recadoId,
        response,
        respondedBy: currentUser,
        respondedAt: now,
        fromUnit: recado.fromUnit,
        toUnit: recado.toUnit
      });
    } else if (supabase) {
      console.log('Socket not connected, performing direct Supabase recado response update...');
      try {
        const { error } = await supabase.from('app_persistence').upsert({ 
          key: 'app_data', 
          content: { ...data, recados: updatedRecados }, 
          updated_at: new Date() 
        });
        if (!error) {
          setData(prev => ({ ...prev, recados: updatedRecados }));
        }
      } catch (err) {
        console.error('Supabase recado response update error:', err);
      }
    }

    addNotification(recado.fromUnit, `Resposta recebida de ${recado.toUnit} para o recado: ${recado.subject}`, 'success');
  };

  const handleAddAnnouncement = async (ann: Omit<Announcement, 'id' | 'timestamp'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_announcement', newAnn);
    } else if (supabase) {
      console.log('Socket not connected, performing direct Supabase announcement addition...');
      const updatedAnnouncements = [newAnn, ...data.announcements];
      try {
        const { error } = await supabase.from('app_persistence').upsert({ 
          key: 'app_data', 
          content: { ...data, announcements: updatedAnnouncements }, 
          updated_at: new Date() 
        });
        if (!error) {
          setData(prev => ({ ...prev, announcements: updatedAnnouncements }));
        }
      } catch (err) {
        console.error('Supabase announcement addition error:', err);
      }
    }

    ann.taggedUsers.forEach(username => {
      const taggedUser = allUsers.find((u: any) => u.username.toUpperCase() === username.toUpperCase());
      if (taggedUser && taggedUser.units) {
        taggedUser.units.forEach((u: string) => {
          addNotification(u, `Novo comunicado: "${ann.subject}" - Você foi marcado por ${ann.author}.`, 'info');
        });
      }
    });
  };

  const handleAddIscaControl = async (entry: Omit<LogisticsEntry, 'id' | 'timestamp' | 'protocol'>) => {
    const newEntry: LogisticsEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      iscaStatuses: entry.numIsca.map(() => entry.status)
    };
    
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('add_isca_control', newEntry);
    } else if (supabase) {
      console.log('Socket not connected, performing direct Supabase isca control addition...');
      const updatedIscaControlEntries = [newEntry, ...data.iscaControlEntries];
      try {
        const { error } = await supabase.from('app_persistence').upsert({ 
          key: 'app_data', 
          content: { ...data, iscaControlEntries: updatedIscaControlEntries }, 
          updated_at: new Date() 
        });
        if (!error) {
          setData(prev => ({ ...prev, iscaControlEntries: updatedIscaControlEntries }));
        }
      } catch (err) {
        console.error('Supabase isca control addition error:', err);
      }
    }

    addNotification(entry.origem, `Registro de Controle de Isca efetuado para o motorista ${entry.motorista}.`, 'info');
    setExpandedSection('isca_control');
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
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('update_entry', { id, updates });
    } else if (supabase) {
      console.log('Socket not connected, performing direct Supabase entry update...');
      const updatedEntries = data.entries.map(e => e.id === id ? { ...e, ...updates } : e);
      const updatedIscaControlEntries = data.iscaControlEntries.map(e => e.id === id ? { ...e, ...updates } : e);
      try {
        const { error } = await supabase.from('app_persistence').upsert({ 
          key: 'app_data', 
          content: { ...data, entries: updatedEntries, iscaControlEntries: updatedIscaControlEntries }, 
          updated_at: new Date() 
        });
        if (!error) {
          setData(prev => ({ ...prev, entries: updatedEntries, iscaControlEntries: updatedIscaControlEntries }));
        }
      } catch (err) {
        console.error('Supabase entry update error:', err);
      }
    }

    const allEntries = [...data.entries, ...data.iscaControlEntries];
    const entry = allEntries.find(e => e.id === id);
    
    if (entry && updates.iscaStatuses) {
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
    setEditingEntry(null);
  };

  const handleAddUnitTab = async (unit: UnitTab) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('add_unit_tab', unit);
    } else if (supabase) {
      console.log('Socket not connected, performing direct Supabase unit addition...');
      const updatedUnitTabs = [...data.unitTabs, unit];
      try {
        const { error } = await supabase.from('app_persistence').upsert({ 
          key: 'app_data', 
          content: { ...data, unitTabs: updatedUnitTabs }, 
          updated_at: new Date() 
        });
        if (!error) {
          setData(prev => ({ ...prev, unitTabs: updatedUnitTabs }));
          alert("FILIAL ADICIONADA (MODO DIRETO)");
        }
      } catch (err) {
        console.error('Supabase unit addition error:', err);
      }
    }
  };

  const handleUpdateUnitTab = async (id: string, updates: Partial<UnitTab>) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('update_unit_tab', { id, updates });
    } else if (supabase) {
      console.log('Socket not connected, performing direct Supabase unit update...');
      const updatedUnitTabs = data.unitTabs.map(u => u.id === id ? { ...u, ...updates } : u);
      try {
        const { error } = await supabase.from('app_persistence').upsert({ 
          key: 'app_data', 
          content: { ...data, unitTabs: updatedUnitTabs }, 
          updated_at: new Date() 
        });
        if (!error) {
          setData(prev => ({ ...prev, unitTabs: updatedUnitTabs }));
          alert("FILIAL ATUALIZADA (MODO DIRETO)");
        }
      } catch (err) {
        console.error('Supabase unit update error:', err);
      }
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!id) {
      alert('ERRO: ID INVÁLIDO PARA EXCLUSÃO.');
      return;
    }

    if (window.confirm('TEM CERTEZA QUE DESEJA EXCLUIR ESTE REGISTRO? ESTA AÇÃO NÃO PODE SER DESFEITA.')) {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('delete_entry', id);
      } else if (supabase) {
        console.log('Socket not connected, performing direct Supabase entry deletion...');
        const updatedEntries = data.entries.filter(e => e.id !== id);
        const updatedIscaControlEntries = data.iscaControlEntries.filter(e => e.id !== id);
        try {
          const { error } = await supabase.from('app_persistence').upsert({ 
            key: 'app_data', 
            content: { ...data, entries: updatedEntries, iscaControlEntries: updatedIscaControlEntries }, 
            updated_at: new Date() 
          });
          if (!error) {
            setData(prev => ({ ...prev, entries: updatedEntries, iscaControlEntries: updatedIscaControlEntries }));
            alert("REGISTRO EXCLUÍDO (MODO DIRETO)");
          }
        } catch (err) {
          console.error('Supabase entry deletion error:', err);
        }
      }
    }
  };

  const handleDeleteUnitTab = async (id: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('delete_unit_tab', id);
    } else if (supabase) {
      console.log('Socket not connected, performing direct Supabase unit deletion...');
      const updatedUnitTabs = data.unitTabs.filter(u => u.id !== id);
      try {
        const { error } = await supabase.from('app_persistence').upsert({ 
          key: 'app_data', 
          content: { ...data, unitTabs: updatedUnitTabs }, 
          updated_at: new Date() 
        });
        if (!error) {
          setData(prev => ({ ...prev, unitTabs: updatedUnitTabs }));
          alert("FILIAL EXCLUÍDA (MODO DIRETO)");
        }
      } catch (err) {
        console.error('Supabase unit deletion error:', err);
      }
    }
  };

  const handleProfileSave = async (updates: Partial<UserAccount>) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('update_user_profile', { username: currentUser, updates });
    } else if (supabase) {
      console.log('Socket not connected, performing direct Supabase profile update...');
      const updatedUsers = allUsers.map(u => 
        u.username.toUpperCase() === currentUser.toUpperCase() ? { ...u, ...updates } : u
      );
      try {
        const { error } = await supabase.from('app_persistence').upsert({ 
          key: 'users_data', 
          content: updatedUsers, 
          updated_at: new Date() 
        });
        if (!error) {
          setAllUsers(updatedUsers);
          const current = updatedUsers.find(u => u.username.toUpperCase() === currentUser.toUpperCase());
          if (current) setUserProfile(current);
          alert("PERFIL ATUALIZADO (MODO DIRETO)");
        }
      } catch (err) {
        console.error('Supabase profile update error:', err);
      }
    }
  };

  const deleteUser = async (username: string) => {
    const updatedUsers = allUsers.filter(u => u.username !== username);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('update_all_users', updatedUsers);
    } else if (supabase) {
      console.log('Socket not connected, performing direct Supabase user deletion...');
      try {
        const { error } = await supabase.from('app_persistence').upsert({ 
          key: 'users_data', 
          content: updatedUsers, 
          updated_at: new Date() 
        });
        if (!error) {
          setAllUsers(updatedUsers);
          alert("USUÁRIO EXCLUÍDO (MODO DIRETO)");
        }
      } catch (err) {
        console.error('Supabase user deletion error:', err);
      }
    }
  };

  const saveEditedUser = async (username: string, updates: Partial<UserAccount>) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('update_user_profile', { username, updates });
    } else if (supabase) {
      console.log('Socket not connected, performing direct Supabase user edit...');
      const updatedUsers = allUsers.map(u => 
        u.username.toUpperCase() === username.toUpperCase() ? { ...u, ...updates } : u
      );
      try {
        const { error } = await supabase.from('app_persistence').upsert({ 
          key: 'users_data', 
          content: updatedUsers, 
          updated_at: new Date() 
        });
        if (!error) {
          setAllUsers(updatedUsers);
          alert("DADOS DO AGENTE ATUALIZADOS (MODO DIRETO)");
        }
      } catch (err) {
        console.error('Supabase user edit error:', err);
      }
    }
  };

  const handleSendMessage = (text: string, channel: 'global' | 'unit' | 'private', recipient?: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      author: currentUser,
      authorUnit: currentUserUnit,
      text,
      timestamp: new Date().toISOString(),
      channel,
      recipient
    };

    // Instant Supabase path
    if (supabase) {
      supabase.from('mensagens').insert([newMessage]).then(({ error }) => {
        if (error) console.error('Supabase message insert error:', error);
      });
    }

    if (socketRef.current) {
      socketRef.current.emit('send_message', newMessage);
    }

    setData(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  const userUnits = userProfile.units || [currentUserUnit];
  const unreadCount = data.notifications.filter(n => !n.read && userUnits.includes(n.unit)).length;

  const markAllNotificationsAsRead = () => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => userUnits.includes(n.unit) ? { ...n, read: true } : n)
    }));
  };

  const NavIcon = ({ type, label, icon: Icon, color = "#C0955C", onClick }: { type: any, label: string, icon: any, color?: string, onClick?: () => void }) => (
    <div className="relative group">
      <button 
        onClick={() => {
          if (type && type !== 'logout') setExpandedSection(type);
          if (onClick) onClick();
        }}
        className="w-full p-4 md:p-8 flex flex-col items-center gap-3 md:gap-6 rounded-2xl md:rounded-[2.5rem] transition-all duration-500 bg-white/[0.01] border border-white/[0.03] hover:bg-roasted-gold/[0.05] hover:border-roasted-gold/30 hover:shadow-[0_20px_50px_rgba(192,149,92,0.1)] md:hover:-translate-y-1"
      >
        <div 
          className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
          style={{ background: `radial-gradient(circle, ${color}15 0%, transparent 80%)`, color: color }}
        >
          <Icon className="w-6 h-6 md:w-10 md:h-10 filter drop-shadow-[0_0_8px_currentColor]" />
        </div>
        <span className="text-[8px] md:text-[11px] font-black tracking-[0.2em] md:tracking-[0.4em] text-center leading-tight font-mono" style={{ color: color }}>
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
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        allUsers={allUsers} 
        loginError={loginError}
        isDataLoaded={isDataLoaded}
        onSignup={async (newUser) => {
          if (!isDataLoaded && allUsers.length === 0) {
            alert("CARREGANDO DADOS... TENTE NOVAMENTE EM ALGUNS SEGUNDOS.");
            return;
          }
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('signup_user', newUser);
          } else if (supabase) {
            // Fallback signup directly to Supabase
            console.log('Socket not connected, performing direct Supabase signup...');
            const updatedUsers = [...allUsers, newUser];
            try {
              const { error } = await supabase.from('app_persistence').upsert({ 
                key: 'users_data', 
                content: updatedUsers, 
                updated_at: new Date() 
              });
              if (!error) {
                setAllUsers(updatedUsers);
                alert("CADASTRO REALIZADO COM SUCESSO (MODO DIRETO)");
              } else {
                console.error('Supabase signup error:', error);
                alert("ERRO AO CADASTRAR NO SUPABASE");
              }
            } catch (err) {
              console.error('Supabase signup exception:', err);
            }
          }
        }} 
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[#120A07] text-[#f8fafc] relative selection:bg-roasted-gold selection:text-espresso-dark overflow-hidden`}>
      <header className="fixed top-0 left-0 right-0 z-[120] px-4 md:px-16 py-4 md:py-8 flex justify-between items-center bg-[#120A07]/80 backdrop-blur-3xl border-b border-roasted-gold/10">
        <div className="flex items-center gap-4 md:gap-8 cursor-pointer group" onClick={() => { setExpandedSection('none'); setShowMobileMenu(false); }}>
          <Logo3D className="w-10 h-10 md:w-14 md:h-14" />
          <div className="border-l-2 border-roasted-gold/20 pl-4 md:pl-8">
            <h1 className="text-xl md:text-3xl font-black tracking-tighter italic uppercase text-roasted-gold brand-text">PRÉ ALERTA</h1>
            <div className="hidden sm:flex items-center gap-4 mt-1.5">
               <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black">{currentUser} | {currentUserUnit}</span>
               <div className="w-2 h-2 bg-roasted-gold rounded-full animate-pulse shadow-[0_0_100px_#C0955C]"></div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-6">
          <button 
            onClick={() => { setExpandedSection('chat'); setShowMobileMenu(false); }}
            className={`p-2.5 md:p-3 rounded-lg md:rounded-xl border transition-all relative bg-white/5 border-white/10 text-roasted-gold hover:border-roasted-gold/50 ${expandedSection === 'chat' ? 'border-roasted-gold bg-roasted-gold/10' : ''}`}
            title="Chat de Operações"
          >
            <MessageSquareIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <div className="relative" ref={bellRef}>
            <button 
              onClick={() => { setShowNotifications(!showNotifications); if(!showNotifications) markAllNotificationsAsRead(); setShowMobileMenu(false); }} 
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

          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2.5 rounded-lg border border-white/10 bg-white/5 text-roasted-gold min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {showMobileMenu ? <XMarkIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => { setExpandedSection('settings'); setShowMobileMenu(false); }}
            className="hidden md:flex w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl border border-white/10 overflow-hidden bg-black/40 cursor-pointer hover:border-roasted-gold transition-all items-center justify-center group"
          >
            {userProfile.profilePic ? (
              <img src={userProfile.profilePic} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-roasted-gold" />
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[115] bg-[#120A07] pt-28 px-6 animate-in fade-in slide-in-from-right duration-300 md:hidden overflow-y-auto pb-20">
          <div className="grid grid-cols-2 gap-4">
            <NavIcon type="new" label="Envio" icon={PlusIcon} color="#C0955C" onClick={() => setShowMobileMenu(false)} />
            <NavIcon type="isca_control" label="Controle" icon={SparklesIcon} color="#C0955C" onClick={() => setShowMobileMenu(false)} />
            <NavIcon type="pre_alerts" label="Histórico" icon={ClipboardIcon} color="#C0955C" onClick={() => setShowMobileMenu(false)} />
            <NavIcon type="chat" label="Chat" icon={MessageSquareIcon} color="#64ffda" onClick={() => setShowMobileMenu(false)} />
            <NavIcon type="billing" label="Cobranças" icon={AlertIcon} color="#ef4444" onClick={() => setShowMobileMenu(false)} />
            <NavIcon type="announcements" label="Comunicados" icon={MailIcon} color="#C0955C" onClick={() => setShowMobileMenu(false)} />
            <NavIcon type="stats" label="Dados" icon={SlidersHorizontalIcon} color="#C0955C" onClick={() => setShowMobileMenu(false)} />
            <NavIcon type="agents" label="Agentes" icon={UsersIcon} color="#C0955C" onClick={() => setShowMobileMenu(false)} />
            <NavIcon type="notes" label="Notas" icon={NoteIcon} color="#C0955C" onClick={() => setShowMobileMenu(false)} />
            <NavIcon type="settings" label="Config" icon={SettingsIcon} color="#C0955C" onClick={() => setShowMobileMenu(false)} />
            <NavIcon type="logout" label="Sair" icon={LogOutIcon} color="#ef4444" onClick={() => { handleLogout(); setShowMobileMenu(false); }} />
          </div>
          <div className="mt-12 p-6 border-t border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl border border-roasted-gold/20 overflow-hidden">
              {userProfile.profilePic ? <img src={userProfile.profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-roasted-gold/10 flex items-center justify-center text-roasted-gold font-black">{currentUser[0]}</div>}
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">{currentUser}</p>
              <p className="text-[8px] font-black text-roasted-gold/60 uppercase tracking-widest">{currentUserUnit}</p>
            </div>
          </div>
        </div>
      )}

      <main ref={mainRef} className={`pt-24 md:pt-48 pb-20 md:pb-48 px-4 md:px-16 max-w-full relative z-10 ${expandedSection === 'chat' ? 'md:pt-48 pt-20 px-0 md:px-16' : ''}`}>
        {expandedSection === 'none' && (
          <div className="animate-in fade-in zoom-in-95 duration-1000 relative">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-11 gap-3 md:gap-6">
              <NavIcon type="new" label="Envio do Pré Alerta" icon={PlusIcon} color="#C0955C" />
              <NavIcon type="isca_control" label="Controle de Iscas" icon={SparklesIcon} color="#C0955C" />
              <NavIcon type="pre_alerts" label="Historico de pre alertas" icon={ClipboardIcon} color="#C0955C" />
              <NavIcon type="chat" label="Chat" icon={MessageSquareIcon} color="#64ffda" />
              <NavIcon type="billing" label="Cobranças" icon={AlertIcon} color="#ef4444" />
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
          {expandedSection !== 'none' && expandedSection !== 'chat' && <BackToMenu />}
          {expandedSection === 'chat' && (
            <div className="hidden md:block">
              <BackToMenu />
            </div>
          )}
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
              users={allUsers} 
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
          {expandedSection === 'notes' && (
            <NotesModule 
              currentUser={currentUser} 
              notes={notesData[currentUser.toUpperCase()] || []}
              onUpdateNotes={(updatedNotes) => {
                if (socketRef.current) {
                  socketRef.current.emit('update_user_notes', { username: currentUser, notes: updatedNotes });
                }
              }}
            />
          )}
          {expandedSection === 'agents' && (
            <AgentsModule 
              currentUser={currentUser} 
              agents={allUsers}
              reviews={reviewsData}
              onUpdateReviews={(updatedReviews) => {
                // In a real app we might emit 'add_review' instead of full list
                // but for now let's keep it simple if the list is small
                const lastReview = updatedReviews[updatedReviews.length - 1];
                if (socketRef.current && lastReview) {
                  socketRef.current.emit('add_review', lastReview);
                }
              }}
            />
          )}
          {expandedSection === 'founder' && <FounderSection />}
          {expandedSection === 'settings' && (
            <SettingsModule 
              currentUser={currentUser} 
              onUpdateCurrentUser={setUserProfile} 
              unitTabs={data.unitTabs}
              onUpdateUnitTab={handleUpdateUnitTab}
              onDeleteUnitTab={handleDeleteUnitTab}
              allUsers={allUsers}
              onUpdateAllUsers={setAllUsers}
              onProfileSave={handleProfileSave}
              onDeleteUser={deleteUser}
              onSaveEditedUser={saveEditedUser}
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

      <OnlineUsers currentUser={currentUser} currentUserUnit={currentUserUnit} agents={allUsers} />

      {birthdayCelebrant && (
        <BirthdayModal agent={birthdayCelebrant} onClose={() => setBirthdayCelebrant(null)} />
      )}
    </div>
  );
};

export default App;

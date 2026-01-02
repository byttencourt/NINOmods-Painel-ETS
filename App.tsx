
import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, CloudCheck, CloudOff, Globe, User } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ConfigPanel from './components/ConfigPanel';
import LogConsole from './components/LogConsole';
import AutomationPanel from './components/AutomationPanel';
import BanningPanel from './components/BanningPanel';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import { auth } from './lib/auth';
import { api } from './lib/api';
import { ServerStatus, ServerConfig, AutomationSettings, UserSession, ServerStats, ConnectedPlayer } from './types';

const INITIAL_CONFIG: ServerConfig = {
  lobby_name: "Sincronizando...",
  description: "",
  welcome_message: "",
  password: "",
  max_players: 128,
  max_vehicles_total: 5,
  max_ai_vehicles_player: 5,
  max_ai_vehicles_player_spawn: 5,
  connection_virtual_port: 100,
  query_virtual_port: 101,
  connection_dedicated_port: 27015,
  query_dedicated_port: 27016,
  server_logon_token: "",
  player_damage: true,
  traffic: true,
  hide_in_company: false,
  hide_colliding: true,
  force_speed_limiter: false,
  mods_optioning: true,
  timezones: 0,
  service_no_collision: false,
  in_menu_ghosting: false,
  name_tags: true,
  friends_only: false,
  show_server: true,
  moderator_list: []
};

const INITIAL_STATS: ServerStats = {
  cpuUsage: "0%",
  ramUsage: "0",
  ramTotal: "0",
  uptime: "...",
  playersOnline: 0,
  playersMax: 128,
  history: []
};

const INITIAL_AUTOMATION: AutomationSettings = {
  autoStartOnBoot: false,
  dailyRestart: false,
  restartHour: "04:00"
};

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'config' | 'logs' | 'automation' | 'bans'>('dashboard');
  const [status, setStatus] = useState<ServerStatus>(ServerStatus.OFFLINE);
  const [config, setConfig] = useState<ServerConfig>(INITIAL_CONFIG);
  const [automation, setAutomation] = useState<AutomationSettings>(INITIAL_AUTOMATION);
  const [stats, setStats] = useState<ServerStats>(INITIAL_STATS);
  const [players, setPlayers] = useState<ConnectedPlayer[]>([]);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Painel NINOmods iniciado."]);

  useEffect(() => {
    const init = async () => {
      const currentSession = auth.getSession();
      setSession(currentSession);
      setTimeout(() => setLoadingAuth(false), 800);
      if (currentSession) loadRealData();
    };
    init();
  }, []);

  // Intervalo de 5 segundos para dados críticos (jogadores e status)
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => refreshRealtimeData(), 5000);
    return () => clearInterval(interval);
  }, [session]);

  const loadRealData = async () => {
    setIsSyncing(true);
    try {
      const [realData, automationData] = await Promise.all([
        api.fetchConfig(),
        api.fetchAutomation()
      ]);
      setConfig(prev => ({ ...prev, ...realData }));
      setAutomation(automationData);
      await refreshRealtimeData();
      addLog(`Sucesso: Debian 13 sincronizado.`);
    } catch (err: any) {
      addLog(`Aviso de Sincronia: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshRealtimeData = async () => {
    try {
      const [realStats, realStatus, currentPlayers] = await Promise.all([
        api.fetchStats(),
        api.fetchStatus(),
        api.fetchPlayers()
      ]);
      setStats(realStats);
      setStatus(realStatus);
      setPlayers(currentPlayers);
    } catch (e) {
      console.warn("Sync falhou.");
    }
  };

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${time}] ${message}`]);
  };

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    if (session?.role !== 'SUPERADMIN' && action === 'stop') {
      alert('Apenas Superadmins podem desligar o servidor.');
      return;
    }
    
    const prevStatus = status;
    setStatus(action === 'stop' ? ServerStatus.STOPPING : ServerStatus.STARTING);
    addLog(`Comando: ${action.toUpperCase()} enviado ao Debian...`);
    
    try {
      await api.sendServerAction(action);
      addLog(`Sucesso: Operação ${action} confirmada pelo sistema.`);
      setTimeout(refreshRealtimeData, 3000);
    } catch (err: any) {
      const msg = err.message || "Erro desconhecido";
      addLog(`ERRO: ${msg}`);
      alert(`Falha no Servidor:\n${msg}`);
      setStatus(prevStatus);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setSession(null);
  };

  if (loadingAuth) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 text-slate-400 font-mono">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="animate-pulse">Sincronizando Sessão...</p>
    </div>
  );

  if (!session) return <Login onLogin={() => { setSession(auth.getSession()); loadRealData(); }} />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        userRole={session.role} 
        username={session.username} 
      />
      
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-6">
            <img src="https://i.postimg.cc/kgP2578h/nino_logop.png" alt="Logo" className="h-10 w-auto" />
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-white tracking-tight">NINOmods Manager</h1>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg">
                  <User size={12} className="text-blue-400" />
                  <span className="text-[11px] font-bold text-slate-200">{session.username}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Debian 13 Environment</p>
                <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                <span className={`text-[9px] flex items-center gap-1 font-bold ${isSyncing ? 'text-blue-400' : 'text-green-500'}`}>
                   {isSyncing ? <div className="w-2 h-2 border border-blue-400 border-t-transparent rounded-full animate-spin"></div> : <CloudCheck size={10} />}
                   {isSyncing ? 'Sincronizando...' : 'Sistema Sincronizado'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
              <div className={`w-2 h-2 rounded-full ${status === ServerStatus.ONLINE ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'}`} />
              <span className="text-sm font-medium uppercase">{status}</span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => handleAction('restart')} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all" title="Reiniciar Servidor"><RotateCcw size={18} /></button>
              <button onClick={() => handleAction('start')} className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-all" title="Ligar Servidor"><Play size={18} fill="currentColor" /></button>
              <button onClick={() => handleAction('stop')} className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-all" title="Desligar Servidor"><Square size={18} fill="currentColor" /></button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'dashboard' && <Dashboard status={status} stats={stats} players={players} logs={logs} />}
          {activeTab === 'config' && <ConfigPanel config={config} setConfig={setConfig} readOnly={session.role !== 'SUPERADMIN'} />}
          {activeTab === 'bans' && <BanningPanel userRole={session.role} onLogAction={addLog} />}
          {activeTab === 'logs' && <LogConsole logs={logs} />}
          {activeTab === 'automation' && <AutomationPanel automation={automation} setAutomation={setAutomation} readOnly={session.role !== 'SUPERADMIN'} />}
        </div>
      </main>
    </div>
  );
};

export default App;

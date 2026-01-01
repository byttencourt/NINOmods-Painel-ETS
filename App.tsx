import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, CloudCheck, Globe } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ConfigPanel from './components/ConfigPanel';
import LogConsole from './components/LogConsole';
import AutomationPanel from './components/AutomationPanel';
import AdminManagement from './components/AdminManagement';
import BanningPanel from './components/BanningPanel';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import { auth } from './lib/auth';
import { api } from './lib/api';
import { ServerStatus, ServerConfig, AutomationSettings, UserSession } from './types';

const INITIAL_CONFIG: ServerConfig = {
  lobby_name: "Carregando...",
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

const INITIAL_AUTOMATION: AutomationSettings = {
  autoStartOnBoot: true,
  dailyRestart: true,
  restartHour: "04:00"
};

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'config' | 'logs' | 'automation' | 'users' | 'bans'>('dashboard');
  const [status, setStatus] = useState<ServerStatus>(ServerStatus.ONLINE);
  const [config, setConfig] = useState<ServerConfig>(INITIAL_CONFIG);
  const [automation, setAutomation] = useState<AutomationSettings>(INITIAL_AUTOMATION);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Painel NINOmods iniciado. Aguardando conexão com backend..."]);

  useEffect(() => {
    const init = async () => {
      const currentSession = auth.getSession();
      setSession(currentSession);
      
      setTimeout(() => {
        setLoadingAuth(false);
        if (currentSession) {
          loadRealConfig().catch(() => {});
        }
      }, 800);
    };
    init();
  }, []);

  const loadRealConfig = async () => {
    setIsSyncing(true);
    try {
      const realData = await api.fetchConfig();
      setConfig(prev => ({ ...prev, ...realData }));
      addLog(`Sucesso: Conectado ao host ${window.location.hostname}`);
    } catch (err) {
      addLog(`Aviso: Backend (Porta 3000) inacessível em ${window.location.hostname}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${time}] ${message}`]);
  };

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    if (session?.role !== 'SUPERADMIN' && action === 'stop') {
      alert('Acesso negado.');
      return;
    }
    
    const prevStatus = status;
    setStatus(action === 'stop' ? ServerStatus.STOPPING : ServerStatus.STARTING);
    addLog(`Comando: ${action.toUpperCase()} enviado...`);
    
    const success = await api.sendServerAction(action);
    
    if (success) {
      addLog(`Sucesso: Operação ${action} concluída.`);
      setTimeout(() => {
        setStatus(action === 'stop' ? ServerStatus.OFFLINE : ServerStatus.ONLINE);
      }, 1000);
    } else {
      addLog(`Erro: O backend não respondeu ao comando.`);
      setStatus(prevStatus);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setSession(null);
  };

  if (loadingAuth) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-600/20 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <div className="text-center">
        <p className="text-slate-400 font-mono text-xs animate-pulse tracking-widest uppercase mb-2">Iniciando Engine NINOmods...</p>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] text-slate-500 font-mono">
          <Globe size={10} />
          {window.location.hostname}:{window.location.port}
        </div>
      </div>
    </div>
  );

  if (!session) return <Login onLogin={() => {
    const s = auth.getSession();
    setSession(s);
    loadRealConfig();
  }} />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} userRole={session.role} />
      
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-4">
            <img src="https://i.postimg.cc/kgP2578h/nino_logop.png" alt="Logo" className="h-8 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-white">NINOmods Manager</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Debian 13</p>
                <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                {isSyncing ? (
                   <span className="text-[9px] text-blue-400 flex items-center gap-1">
                     <div className="w-2 h-2 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                     Sincronizando...
                   </span>
                ) : (
                  <span className="text-[9px] text-green-500 flex items-center gap-1 font-bold">
                    <CloudCheck size={10} />
                    SINC. SERVER_CONFIG.SII
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
              <div className={`w-2 h-2 rounded-full ${status === ServerStatus.ONLINE ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
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
          {activeTab === 'dashboard' && <Dashboard status={status} logs={logs} />}
          {activeTab === 'config' && <ConfigPanel config={config} setConfig={setConfig} readOnly={session.role !== 'SUPERADMIN'} />}
          {activeTab === 'bans' && <BanningPanel userRole={session.role} onLogAction={addLog} />}
          {activeTab === 'logs' && <LogConsole logs={logs} />}
          {activeTab === 'automation' && <AutomationPanel automation={automation} setAutomation={setAutomation} readOnly={session.role !== 'SUPERADMIN'} />}
          {activeTab === 'users' && session.role === 'SUPERADMIN' && <AdminManagement />}
        </div>
      </main>
    </div>
  );
};

export default App;
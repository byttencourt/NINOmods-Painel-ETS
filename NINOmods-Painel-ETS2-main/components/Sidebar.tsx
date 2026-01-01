
import React from 'react';
import { LayoutDashboard, Settings, Terminal, Clock, LogOut, UsersRound, UserX, ExternalLink } from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, userRole }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'config', label: 'Configuração', icon: Settings },
    { id: 'bans', label: 'Banimentos', icon: UserX },
    { id: 'logs', label: 'Logs do Console', icon: Terminal },
    { id: 'automation', label: 'Automação', icon: Clock },
  ];

  if (userRole === 'SUPERADMIN') {
    menuItems.push({ id: 'users', label: 'Gestão de Admins', icon: UsersRound });
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <img 
            src="https://i.postimg.cc/kgP2578h/nino_logop.png" 
            alt="NINO Logo" 
            className="h-10 w-auto drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
          />
          <div>
            <h2 className="font-bold text-white tracking-tight leading-none text-sm">FRATERNIDADE</h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-1">Dedicated Server</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} className={activeTab === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Perfil Atual</p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
              userRole === 'SUPERADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {userRole}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Usuário</span>
              <span className="text-white font-mono">{userRole.toLowerCase()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Sair do Painel</span>
        </button>

        <div className="pt-2 border-t border-slate-800">
          <a 
            href="https://github.com/byttencourt" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col gap-1 text-slate-500 hover:text-blue-400 transition-colors group"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Desenvolvido por</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold">NINOdev</span>
              <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;


import React, { useState, useEffect } from 'react';
import { ShieldBan, Trash2, Search, Info, AlertCircle, Loader2, UserPlus, Radio, ExternalLink, HelpCircle } from 'lucide-react';
import { ConnectedPlayer, BannedUser, UserRole } from '../types';
import { api } from '../lib/api';

interface BanningPanelProps {
  userRole: UserRole;
  onLogAction: (msg: string) => void;
}

const BanningPanel: React.FC<BanningPanelProps> = ({ userRole, onLogAction }) => {
  const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);
  const [bans, setBans] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
    const interval = setInterval(refreshOnline, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [realBans, players] = await Promise.all([
        api.fetchBans(),
        api.fetchPlayers()
      ]);
      setBans(realBans);
      setOnlinePlayers(players);
    } catch (e) {
      console.error("Erro ao carregar moderação.");
    } finally {
      setLoading(false);
    }
  };

  const refreshOnline = async () => {
    const players = await api.fetchPlayers();
    setOnlinePlayers(players);
  };

  const handleBan = async (player: { steamId: string, username: string }) => {
    let sid = player.steamId;
    
    if (sid === "Desconhecido") {
      sid = prompt(`O SteamID de "${player.username}" não foi encontrado no log.\nPor favor, digite o SteamID64 (17 dígitos) para banir:`, "");
      if (!sid || sid.length < 15) return;
    }

    const reason = prompt(`Motivo do banimento para ${player.username}:`, "Violação das regras");
    if (reason === null) return;

    const newBan: BannedUser = {
      steamId: sid,
      username: player.username,
      reason: reason,
      bannedAt: new Date().toLocaleDateString(),
      bannedBy: userRole.toLowerCase()
    };

    const updatedBans = [newBan, ...bans];
    setBans(updatedBans);
    
    try {
      await api.saveBans(updatedBans);
      onLogAction(`[BAN] ${player.username} (${sid}) banido.`);
      alert("Sucesso: Jogador adicionado ao banlist.sii");
    } catch (e) {
      alert("Erro ao salvar arquivo.");
    }
  };

  const handleManualBan = () => {
    const steamId = prompt("Digite o SteamID64 (17 dígitos):");
    if (!steamId || steamId.length < 15) return;
    const username = prompt("Nome do jogador:", "Manual");
    handleBan({ steamId, username: username || "Manual" });
  };

  const handleUnban = async (steamId: string, username: string) => {
    if (userRole !== 'SUPERADMIN') return alert("Permissão negada.");
    if (confirm(`Remover banimento de ${username}?`)) {
      const updatedBans = bans.filter(b => b.steamId !== steamId);
      setBans(updatedBans);
      try {
        await api.saveBans(updatedBans);
        onLogAction(`[UNBAN] Banimento de ${username} removido.`);
      } catch (e) { alert("Erro ao salvar."); }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldBan className="text-red-500" />
            Controle de Jogadores
          </h2>
          <p className="text-slate-400 text-sm">Monitoramento do tráfego e banlist.sii</p>
        </div>
        
        <div className="flex gap-2">
           <button 
            onClick={handleManualBan}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold border border-slate-700 transition-all flex items-center gap-2"
          >
            <UserPlus size={16} />
            Banir Manualmente
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Filtrar banidos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white w-full md:w-64 outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* JOGADORES ONLINE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-blue-500/5 flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Radio size={18} className="text-blue-500 animate-pulse" />
              Sessão Ativa no Debian
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 uppercase font-bold tracking-tighter flex items-center gap-1">
              <HelpCircle size={10} /> O log atual omite SteamIDs. Use ferramentas de busca se necessário.
            </p>
          </div>
          <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">{onlinePlayers.length} / 128</span>
        </div>
        
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {onlinePlayers.map(player => (
            <div key={player.clientId} className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex items-center justify-between hover:border-blue-500/50 transition-all group">
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-white truncate pr-2" title={player.username}>{player.username}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded font-mono">CID: {player.clientId}</span>
                  <a 
                    href={`https://steamcommunity.com/actions/Search?K=${encodeURIComponent(player.username)}`}
                    target="_blank"
                    className="text-[9px] text-blue-500 hover:underline flex items-center gap-0.5"
                  >
                    Buscar Perfil <ExternalLink size={8} />
                  </a>
                </div>
              </div>
              <button 
                onClick={() => handleBan(player)}
                className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                title="Banir Jogador"
              >
                <ShieldBan size={18} />
              </button>
            </div>
          ))}
          {onlinePlayers.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-600 flex flex-col items-center gap-2">
              <Radio size={32} className="opacity-20" />
              <p className="text-sm italic">Nenhum rastro de conexão recente no server.log.txt</p>
            </div>
          )}
        </div>
      </div>

      {/* LISTA DE BANIDOS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
          <p className="text-xs font-bold uppercase tracking-widest">Sincronizando banlist.sii...</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />
              Base de Dados de Banidos
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bans.length} registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-800/20">
                  <th className="px-6 py-3">SteamID64</th>
                  <th className="px-6 py-3">Informação</th>
                  <th className="px-6 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bans.filter(b => b.steamId.includes(searchQuery)).map(ban => (
                  <tr key={ban.steamId} className="group hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono text-blue-400 bg-blue-400/5 px-2 py-1 rounded border border-blue-400/20">{ban.steamId}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-300">{ban.username}</span>
                        <span className="text-[10px] text-slate-500 italic mt-0.5">{ban.reason}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleUnban(ban.steamId, ban.username)}
                        className={`p-2 rounded-lg transition-all ${
                          userRole === 'SUPERADMIN' 
                          ? 'text-slate-500 hover:text-green-500 hover:bg-green-500/10' 
                          : 'text-slate-700 cursor-not-allowed'
                        }`}
                        title="Remover Banimento"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BanningPanel;

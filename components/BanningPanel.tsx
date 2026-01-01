
import React, { useState } from 'react';
import { UserX, ShieldBan, Trash2, Search, Info, UserCheck, AlertCircle } from 'lucide-react';
import { ConnectedPlayer, BannedUser, UserRole } from '../types';

interface BanningPanelProps {
  userRole: UserRole;
  onLogAction: (msg: string) => void;
}

const MOCK_CONNECTED: ConnectedPlayer[] = [
  { steamId: "76561198000000001", username: "TruckerKing_99", ping: 45, connectedSince: "15:20", country: "BR" },
  { steamId: "76561198000000002", username: "RoadRunner_BR", ping: 120, connectedSince: "16:05", country: "BR" },
  { steamId: "76561198000000003", username: "Gamer_ES", ping: 88, connectedSince: "16:45", country: "ES" },
  { steamId: "76561198000000004", username: "TrollMaster", ping: 32, connectedSince: "17:10", country: "BR" },
];

const MOCK_BANS: BannedUser[] = [
  { steamId: "76561198999999999", username: "Cheater_X", reason: "Uso de SpeedHack", bannedAt: "12/05/2024", bannedBy: "superadmin" },
  { steamId: "76561198888888888", username: "ToxicGuy", reason: "Ofensa no Chat", bannedAt: "10/05/2024", bannedBy: "moderador_01" },
];

const BanningPanel: React.FC<BanningPanelProps> = ({ userRole, onLogAction }) => {
  const [connected, setConnected] = useState<ConnectedPlayer[]>(MOCK_CONNECTED);
  const [bans, setBans] = useState<BannedUser[]>(MOCK_BANS);
  const [searchQuery, setSearchQuery] = useState("");

  const handleBan = (player: ConnectedPlayer) => {
    const reason = prompt(`Motivo do banimento para ${player.username}:`, "Violação das regras do servidor");
    if (reason === null) return;

    const newBan: BannedUser = {
      steamId: player.steamId,
      username: player.username,
      reason: reason,
      bannedAt: new Date().toLocaleDateString(),
      bannedBy: userRole.toLowerCase()
    };

    setBans([newBan, ...bans]);
    setConnected(connected.filter(p => p.steamId !== player.steamId));
    onLogAction(`[BAN] O jogador ${player.username} (${player.steamId}) foi banido por ${userRole}. Motivo: ${reason}`);
    alert(`Jogador ${player.username} banido com sucesso!`);
  };

  const handleUnban = (steamId: string, username: string) => {
    if (userRole !== 'SUPERADMIN') {
      alert("Apenas o Superadmin pode remover banimentos.");
      return;
    }

    if (confirm(`Deseja remover o banimento de ${username}?`)) {
      setBans(bans.filter(b => b.steamId !== steamId));
      onLogAction(`[UNBAN] O banimento de ${username} (${steamId}) foi removido por ${userRole}.`);
    }
  };

  const filteredConnected = connected.filter(p => 
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.steamId.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldBan className="text-red-500" />
            Gestão de Banimentos
          </h2>
          <p className="text-slate-400">Controle de acesso e moderação em tempo real.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome ou SteamID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white w-full md:w-80 outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
          />
        </div>
      </div>

      {/* Connected Players Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <UserCheck size={18} className="text-green-500" />
            Jogadores Conectados
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredConnected.length} Online</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Jogador</th>
                <th className="px-6 py-4">SteamID64</th>
                <th className="px-6 py-4">Ping</th>
                <th className="px-6 py-4">Desde</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredConnected.map(player => (
                <tr key={player.steamId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                        {player.username.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-white">{player.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{player.steamId}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${player.ping > 100 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {player.ping}ms
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{player.connectedSince}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleBan(player)}
                      className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-500/20"
                    >
                      Banir
                    </button>
                  </td>
                </tr>
              ))}
              {filteredConnected.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm italic">
                    Nenhum jogador encontrado com os critérios de busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Banned Players Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" />
            Lista de Banidos (banlist.sii)
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bans.length} Banidos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Jogador</th>
                <th className="px-6 py-4">Motivo</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Banido Por</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bans.map(ban => (
                <tr key={ban.steamId} className="group hover:bg-red-950/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{ban.username}</span>
                      <span className="text-[10px] font-mono text-slate-500">{ban.steamId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Info size={14} className="text-slate-500 shrink-0" />
                      {ban.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{ban.bannedAt}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 italic">@{ban.bannedBy}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleUnban(ban.steamId, ban.username)}
                      className={`p-2 rounded-lg transition-all ${
                        userRole === 'SUPERADMIN' 
                        ? 'text-slate-500 hover:text-green-500 hover:bg-green-500/10' 
                        : 'text-slate-700 cursor-not-allowed'
                      }`}
                      title={userRole === 'SUPERADMIN' ? "Remover Banimento" : "Somente Superadmin pode desbanir"}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {bans.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                    A lista de banidos está vazia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BanningPanel;

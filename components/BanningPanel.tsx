
import React, { useState, useEffect } from 'react';
import { ShieldBan, Trash2, Search, Info, AlertCircle, Loader2, UserPlus, Radio, ExternalLink, HelpCircle, X, Copy, Check, UserSearch, Fingerprint } from 'lucide-react';
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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{username: string, clientId: string} | null>(null);
  const [inputSteamId, setInputSteamId] = useState("");
  const [inputReason, setInputReason] = useState("Violação das regras do servidor");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(refreshOnline, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [realBans, players] = await Promise.all([api.fetchBans(), api.fetchPlayers()]);
      setBans(realBans);
      setOnlinePlayers(players);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const refreshOnline = async () => {
    const players = await api.fetchPlayers();
    setOnlinePlayers(players);
  };

  const openBanModal = (player: any) => {
    setSelectedPlayer(player);
    setInputSteamId("");
    setIsModalOpen(true);
    navigator.clipboard.writeText(player.username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tira Tags de Clan como [G.D.F] ou G.D.F® para melhorar a busca
  const getCleanName = (name: string) => {
    return name.replace(/\[.*?\]/g, '').replace(/[\u00AE\u2122]/g, '').trim();
  };

  const confirmBan = async () => {
    if (!inputSteamId || inputSteamId.length < 15) return alert("Insira o SteamID64 (17 dígitos).");
    const newBan: BannedUser = {
      steamId: inputSteamId,
      username: selectedPlayer?.username || "Manual",
      reason: inputReason,
      bannedAt: new Date().toLocaleDateString(),
      bannedBy: userRole.toLowerCase()
    };
    const updatedBans = [newBan, ...bans];
    setBans(updatedBans);
    try {
      await api.saveBans(updatedBans);
      onLogAction(`[BAN] ${newBan.username} (${newBan.steamId}) banido.`);
      setIsModalOpen(false);
    } catch (e) { alert("Erro ao salvar."); }
  };

  const handleUnban = async (steamId: string, username: string) => {
    if (userRole !== 'SUPERADMIN') return alert("Acesso negado.");
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
      {/* MODAL DETETIVE DE STEAM ID */}
      {isModalOpen && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-red-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg"><ShieldBan size={20} className="text-white" /></div>
                <div>
                  <h3 className="font-bold text-white">Identificar e Banir</h3>
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Resolução de Identidade</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Alvo */}
              <div className="flex items-center justify-between bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nome no Log</p>
                  <p className="text-2xl font-black text-white truncate">{selectedPlayer.username}</p>
                </div>
                <button 
                  onClick={() => {navigator.clipboard.writeText(selectedPlayer.username); setCopied(true); setTimeout(()=>setCopied(false), 2000)}}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'COPIADO' : 'COPIAR NOME'}
                </button>
              </div>

              {/* FERRAMENTAS DE BUSCA */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <UserSearch size={14} /> 1. Encontre o perfil pelo nome de exibição:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a 
                    href={`https://steamcommunity.com/search/users/#text=${encodeURIComponent(selectedPlayer.username)}`} 
                    target="_blank" 
                    className="flex items-center justify-between px-4 py-3 bg-[#171a21] hover:bg-[#2a475e] text-white rounded-xl border border-white/5 transition-all group"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">Busca na Steam</span>
                      <span className="text-[9px] text-slate-400">Página de Usuários</span>
                    </div>
                    <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a 
                    href={`https://steamid.io/lookup`} 
                    target="_blank" 
                    className="flex items-center justify-between px-4 py-3 bg-[#1e293b] hover:bg-[#334155] text-white rounded-xl border border-white/5 transition-all group"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">STEAMID I/O</span>
                      <span className="text-[9px] text-slate-400">Busca por url steam</span>
                    </div>
                    <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              {/* RESOLUÇÃO DE ID */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Fingerprint size={14} /> 2. Cole o SteamID64 (17 dígitos) encontrado:
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="76561198XXXXXXXXX"
                    value={inputSteamId}
                    onChange={(e) => setInputSteamId(e.target.value)}
                    className="flex-1 bg-black border border-slate-800 rounded-xl px-4 py-3 text-blue-400 font-mono text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
                  />
                  <a 
                    href="https://steamid.io" 
                    target="_blank" 
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2"
                    title="Se você achou o link do perfil, converta-o aqui"
                  >
                    Resolver URL <ExternalLink size={12} />
                  </a>
                </div>
                <input 
                  type="text"
                  placeholder="Motivo do banimento"
                  value={inputReason}
                  onChange={(e) => setInputReason(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs outline-none focus:ring-1 focus:ring-red-500/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-bold hover:bg-slate-700">Cancelar</button>
                <button onClick={confirmBan} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-500 shadow-lg shadow-red-900/20 active:scale-95 transition-all">Confirmar Ban</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldBan className="text-red-500" />
            Moderação de Acesso
          </h2>
          <p className="text-slate-400 text-sm">Controle de jogadores e banlist.sii</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => openBanModal({username: "Manual", clientId: "0"})}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold border border-slate-700 transition-all flex items-center gap-2"
          >
            <UserPlus size={16} />
            Ban Manual
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar banidos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white w-full outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </div>
        </div>
      </div>

      {/* JOGADORES ONLINE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-800 bg-blue-500/5 flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Radio size={18} className="text-blue-500 animate-pulse" />
              Sessão de Jogo Ativa
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Detectados via server.log.txt</span>
          </div>
          <div className="px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
            <span className="text-[10px] font-black text-blue-400">{onlinePlayers.length} ONLINE</span>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {onlinePlayers.map(player => (
            <div key={player.clientId} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-800/50 hover:border-blue-500/50 transition-all group">
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-black text-white truncate" title={player.username}>{player.username}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded font-mono">CID: {player.clientId}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">{player.connectedAt}</span>
                </div>
              </div>
              <button 
                onClick={() => openBanModal(player)}
                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <ShieldBan size={20} />
              </button>
            </div>
          ))}
          {onlinePlayers.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-700 flex flex-col items-center gap-4">
              <div className="p-4 bg-slate-800/20 rounded-full"><Radio size={40} className="opacity-20" /></div>
              <p className="text-sm font-medium italic">Nenhuma atividade detectada no log do sistema.</p>
            </div>
          )}
        </div>
      </div>

      {/* LISTA DE BANIDOS */}
      {!loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />
              Base de Dados de Banidos (.sii)
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{bans.length} REGISTROS</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-slate-800/40">
                  <th className="px-6 py-4">SteamID64</th>
                  <th className="px-6 py-4">Detalhes</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {bans.filter(b => b.steamId.includes(searchQuery)).map(ban => (
                  <tr key={ban.steamId} className="group hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono text-blue-400 bg-blue-400/5 px-2.5 py-1 rounded-lg border border-blue-400/10">{ban.steamId}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{ban.username}</span>
                        <span className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-xs">{ban.reason}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleUnban(ban.steamId, ban.username)}
                        className={`p-2.5 rounded-xl transition-all ${
                          userRole === 'SUPERADMIN' 
                          ? 'text-slate-500 hover:text-green-500 hover:bg-green-500/10 border border-transparent hover:border-green-500/20' 
                          : 'text-slate-700 cursor-not-allowed opacity-20'
                        }`}
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

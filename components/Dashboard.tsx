
import React from 'react';
import { Users, Cpu, HardDrive, Activity, MessageSquare, Loader2, Radio, Clock } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ServerStatus, ServerStats, ConnectedPlayer } from '../types';

const StatCard: React.FC<{ icon: any, label: string, value: string, color: string, isLive?: boolean }> = ({ icon: Icon, label, value, color, isLive }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors relative group">
    {isLive && (
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[8px] font-black text-green-500/50 uppercase tracking-tighter">LIVE</span>
      </div>
    )}
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <Icon className={color} size={24} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-2xl">
        <p className="text-xs text-slate-400 font-bold mb-1">{label}</p>
        <p className="text-sm text-blue-400 font-black">
          {payload[0].value} Jogadores
        </p>
      </div>
    );
  }
  return null;
};

interface DashboardProps {
  status: ServerStatus;
  stats: ServerStats;
  players: ConnectedPlayer[];
  logs: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ status, stats, players, logs }) => {
  const chartData = stats.history && stats.history.length > 0 
    ? stats.history 
    : [{ time: 'Iniciando...', players: 0 }];

  const isOnline = status === ServerStatus.ONLINE;

  // Calcula o intervalo de ticks para o eixo X baseado no número de pontos
  // Se tivermos 288 pontos (24h), mostramos um texto a cada 24 pontos (cada 2 horas)
  const xTickInterval = chartData.length > 50 ? Math.floor(chartData.length / 10) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Quick Stats Reais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Jogadores Online" 
          value={isOnline ? `${players.length} / ${stats.playersMax || 128}` : "0 / 0"} 
          color="text-blue-500"
          isLive={isOnline}
        />
        <StatCard 
          icon={Activity} 
          label="Uptime do Servidor" 
          value={isOnline ? stats.uptime : "Offline"} 
          color="text-green-500" 
        />
        <StatCard 
          icon={Cpu} 
          label="Uso de CPU" 
          value={isOnline ? stats.cpuUsage : "0%"} 
          color="text-purple-500" 
        />
        <StatCard 
          icon={HardDrive} 
          label="RAM (Uso/Total)" 
          value={isOnline ? `${stats.ramUsage} / ${stats.ramTotal}` : "0 / 0"} 
          color="text-yellow-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart com dados Reais */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-blue-500" />
              Atividade do Servidor (Últimas 24h)
            </h3>
            <div className="flex items-center gap-2">
              {stats.history.length === 0 && <Loader2 size={12} className="animate-spin text-slate-500" />}
              <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full uppercase tracking-widest">
                Janela: 24h móveis
              </span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPlayers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="time" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                  interval={xTickInterval}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 'dataMax + 5']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="players" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPlayers)" 
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jogadores em Tempo Real */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-blue-500" />
              Jogadores Ativos
            </h3>
            <span className="text-[9px] font-bold text-slate-500 border border-slate-800 px-2 py-0.5 rounded">POLLING: 5S</span>
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
            {players.length > 0 ? (
              players.map((player) => (
                <div key={player.clientId} className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-800/50 rounded-lg group hover:border-blue-500/30 transition-all">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">{player.username}</span>
                    <span className="text-[9px] text-slate-500 font-mono">ID: {player.clientId}</span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="flex items-center gap-1 text-green-500/70">
                      <Clock size={10} />
                      <span className="text-[9px] font-bold">{player.connectedAt}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-slate-600 gap-2 opacity-50">
                <Radio size={24} />
                <p className="text-xs font-medium italic">Nenhum comboio ativo</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-green-500" />
            Atividade Recente do Log
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {logs.slice(-10).reverse().map((log, i) => (
            <div key={i} className="flex gap-3 text-sm animate-in slide-in-from-left-2 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 flex-shrink-0" />
              <span className="text-slate-400 font-mono text-[10px] truncate leading-relaxed">{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

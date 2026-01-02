
import React from 'react';
import { Users, Cpu, HardDrive, Activity, MessageSquare, Loader2 } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ServerStatus, ServerStats } from '../types';

const StatCard: React.FC<{ icon: any, label: string, value: string, color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
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

const Dashboard: React.FC<{ status: ServerStatus, stats: ServerStats, logs: string[] }> = ({ status, stats, logs }) => {
  const chartData = stats.history && stats.history.length > 0 
    ? stats.history 
    : [{ time: 'Iniciando...', players: 0 }];

  const isOnline = status === ServerStatus.ONLINE;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Quick Stats Reais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Jogadores Online" 
          value={isOnline ? `${stats.playersOnline} / ${stats.playersMax || 128}` : "0 / 0"} 
          color="text-blue-500" 
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
              Atividade do Servidor (Histórico)
            </h3>
            <div className="flex items-center gap-2">
              {stats.history.length === 0 && <Loader2 size={12} className="animate-spin text-slate-500" />}
              <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full uppercase tracking-widest">
                Amostragem: 5 min
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
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-green-500" />
              Eventos Recentes
            </h3>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
            {logs.slice(-10).reverse().map((log, i) => (
              <div key={i} className="flex gap-3 text-sm animate-in slide-in-from-left-2">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-700 flex-shrink-0" />
                <span className="text-slate-400 font-mono text-[11px] leading-relaxed break-all">{log}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center italic">Monitorando log do Debian em tempo real</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

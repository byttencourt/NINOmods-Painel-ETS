
import React, { useRef, useEffect } from 'react';
import { Terminal, Download, Trash2, ChevronRight } from 'lucide-react';

interface LogConsoleProps {
  logs: string[];
}

const LogConsole: React.FC<LogConsoleProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Console do Sistema</h2>
          <p className="text-slate-400">Monitoramento em tempo real do binário <code className="text-blue-400 font-mono text-xs">eurotrucks2_server</code></p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold transition-all">
            <Download size={14} />
            Baixar Log
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded text-xs font-bold transition-all">
            <Trash2 size={14} />
            Limpar Console
          </button>
        </div>
      </div>

      <div className="flex-1 bg-black rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
        {/* Terminal Header */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono font-bold uppercase ml-2 tracking-widest">steam@proxmox:~/ets2-server</span>
        </div>

        {/* Terminal Body */}
        <div 
          ref={scrollRef}
          className="flex-1 p-6 font-mono text-sm overflow-y-auto space-y-1 bg-[#050505]"
        >
          {logs.map((log, i) => {
            const isInfo = log.includes('[INFO]');
            const isError = log.includes('[ERROR]') || log.includes('failed');
            const isWarning = log.includes('[WARN]');
            
            return (
              <div key={i} className="flex gap-3 leading-relaxed">
                <span className="text-slate-600 select-none">{i + 1}</span>
                <span className={`${
                  isError ? 'text-red-400' : 
                  isWarning ? 'text-yellow-400' : 
                  isInfo ? 'text-blue-400' : 
                  'text-slate-300'
                }`}>
                  {log}
                </span>
              </div>
            );
          })}
          <div className="flex gap-3 items-center pt-2">
            <span className="text-slate-600 select-none">{logs.length + 1}</span>
            <div className="flex items-center gap-2 text-green-500">
              <ChevronRight size={14} />
              <div className="w-2 h-4 bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center gap-3 bg-black/50 rounded border border-slate-700 px-4 py-2">
            <span className="text-blue-500 font-bold">$</span>
            <input 
              type="text" 
              placeholder="Digite um comando para o console..."
              className="bg-transparent border-none focus:outline-none text-slate-300 font-mono text-sm w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogConsole;

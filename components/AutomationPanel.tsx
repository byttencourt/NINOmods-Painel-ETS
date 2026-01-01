import React from 'react';
import { Clock, RefreshCw, Zap, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { AutomationSettings } from '../types';

interface AutomationPanelProps {
  automation: AutomationSettings;
  setAutomation: React.Dispatch<React.SetStateAction<AutomationSettings>>;
  readOnly?: boolean;
}

const AutomationPanel: React.FC<AutomationPanelProps> = ({ automation, setAutomation, readOnly }) => {
  const handleToggle = (key: keyof AutomationSettings) => {
    if (readOnly) return;
    setAutomation(prev => ({ ...prev, [key]: !prev[key] } as any));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Automação e Resiliência</h2>
          <p className="text-slate-400">Gerencie reinicializações automáticas e integração com o systemd do Debian.</p>
        </div>
        {readOnly && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-500 rounded-lg text-[10px] font-bold border border-slate-700">
            <Lock size={12} />
            CONFIGURAÇÕES TRAVADAS
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auto Start Card */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group ${readOnly ? 'opacity-75' : ''}`}>
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap size={100} className="text-blue-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Zap className="text-blue-500" size={24} />
            </div>
            <h3 className="font-bold text-lg text-white">Início Automático</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Habilita o servidor ETS2 para iniciar automaticamente assim que o Proxmox/Container ligar.
          </p>
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <span className="text-sm font-semibold">Ativar no Boot</span>
            <button 
              onClick={() => handleToggle('autoStartOnBoot')}
              disabled={readOnly}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${automation.autoStartOnBoot ? 'bg-blue-600' : 'bg-slate-700'} ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${automation.autoStartOnBoot ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          {automation.autoStartOnBoot && (
            <div className="mt-4 flex items-center gap-2 text-xs text-green-500 font-bold bg-green-500/10 p-2 rounded">
              <CheckCircle2 size={14} />
              systemctl enable ets2-server.service
            </div>
          )}
        </div>

        {/* Daily Restart Card */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group ${readOnly ? 'opacity-75' : ''}`}>
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock size={100} className="text-purple-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Clock className="text-purple-500" size={24} />
            </div>
            <h3 className="font-bold text-lg text-white">Restart Programado</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Mantém o servidor estável reiniciando o serviço a cada 24 horas no horário definido.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <span className="text-sm font-semibold">Ativar Ciclo de 24h</span>
              <button 
                onClick={() => handleToggle('dailyRestart')}
                disabled={readOnly}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${automation.dailyRestart ? 'bg-purple-600' : 'bg-slate-700'} ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${automation.dailyRestart ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {automation.dailyRestart && (
              <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <span className="text-sm font-semibold text-slate-400">Horário:</span>
                <input 
                  type="time" 
                  value={automation.restartHour}
                  disabled={readOnly}
                  onChange={(e) => setAutomation(prev => ({ ...prev, restartHour: e.target.value }))}
                  className={`bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500 ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crontab / Systemd Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <ShieldAlert size={18} className="text-yellow-500" />
          Visão Técnica (Scripts Gerados)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-black/50 p-4 rounded-xl border border-slate-800 overflow-x-auto">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 border-b border-slate-800 pb-1">/etc/systemd/system/ets2-server.service</p>
            <pre className="text-slate-400 leading-relaxed">
{`[Unit]
Description=ETS2 Dedicated Server
After=network.target

[Service]
Type=simple
User=steam
ExecStart=/home/steam/ets2-server/bin/...
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target`}
            </pre>
          </div>
          <div className="bg-black/50 p-4 rounded-xl border border-slate-800 overflow-x-auto">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 border-b border-slate-800 pb-1">Crontab (Auto Restart)</p>
            <pre className="text-slate-400 leading-relaxed">
{`# Configurado via Painel
${automation.dailyRestart ? `${automation.restartHour.split(':')[1]} ${automation.restartHour.split(':')[0]} * * * systemctl restart ets2-server` : '# Desativado'}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationPanel;
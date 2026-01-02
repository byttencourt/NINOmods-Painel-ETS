
import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Zap, ShieldAlert, Lock, Save, Loader2, CalendarClock } from 'lucide-react';
import { AutomationSettings } from '../types';
import { api } from '../lib/api';

interface AutomationPanelProps {
  automation: AutomationSettings;
  setAutomation: React.Dispatch<React.SetStateAction<AutomationSettings>>;
  readOnly?: boolean;
}

const AutomationPanel: React.FC<AutomationPanelProps> = ({ automation, setAutomation, readOnly }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [serverTime, setServerTime] = useState<string>("Carregando...");

  // Busca o horário real do Debian para o usuário saber se o fuso está correto
  useEffect(() => {
    const fetchTime = async () => {
      try {
        const stats = await api.fetchStats();
        if (stats.systemTime) setServerTime(stats.systemTime);
      } catch (e) {}
    };
    fetchTime();
    const timer = setInterval(fetchTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleToggle = (key: keyof AutomationSettings) => {
    if (readOnly) return;
    setAutomation(prev => ({ ...prev, [key]: !prev[key] } as any));
  };

  const handleSave = async () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      await api.saveAutomation(automation);
      alert('Automação salva com sucesso no Debian!');
    } catch (e) {
      alert('Erro ao persistir automação.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Automação e Resiliência</h2>
          <p className="text-slate-400">Estado atual lido diretamente do <code className="text-blue-400">automation.json</code> no servidor.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Horário do Debian</span>
             <span className="text-sm font-mono text-blue-400 font-bold">{serverTime}</span>
          </div>
          {!readOnly && (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg font-bold shadow-lg transition-all active:scale-95"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? 'Gravando...' : 'Gravar no Debian'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auto Start Card */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group ${readOnly ? 'opacity-75' : ''}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Zap size={24} />
            </div>
            <h3 className="font-bold text-lg text-white">Início Automático</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Habilita o serviço para iniciar sozinho após o reboot do sistema.
          </p>
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <span className="text-sm font-semibold">Ativado no Boot</span>
            <button 
              onClick={() => handleToggle('autoStartOnBoot')}
              disabled={readOnly}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${automation.autoStartOnBoot ? 'bg-blue-600' : 'bg-slate-700'} ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${automation.autoStartOnBoot ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Daily Restart Card */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group ${readOnly ? 'opacity-75' : ''}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
              <CalendarClock size={24} />
            </div>
            <h3 className="font-bold text-lg text-white">Restart Programado</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Reinicia o servidor em um horário fixo para manter a estabilidade.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <span className="text-sm font-semibold">Agendamento Diário</span>
              <button 
                onClick={() => handleToggle('dailyRestart')}
                disabled={readOnly}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${automation.dailyRestart ? 'bg-purple-600' : 'bg-slate-700'} ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${automation.dailyRestart ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {automation.dailyRestart && (
              <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 animate-in slide-in-from-top-2">
                <span className="text-sm font-semibold text-slate-400">Horário (24h):</span>
                <input 
                  type="time" 
                  value={automation.restartHour}
                  disabled={readOnly}
                  onChange={(e) => setAutomation(prev => ({ ...prev, restartHour: e.target.value }))}
                  className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <ShieldAlert size={18} className="text-yellow-500" />
          Verificação de Agendamento
        </h3>
        <div className="p-4 bg-black/50 rounded-xl border border-slate-800 font-mono text-xs">
          <p className="text-slate-500 mb-2"># Linha inserida no Crontab do Debian:</p>
          <code className="text-purple-400">
            {automation.dailyRestart 
              ? `${automation.restartHour.split(':')[1]} ${automation.restartHour.split(':')[0]} * * * systemctl restart ets2-server` 
              : '# Nenhuma tarefa ativa'}
          </code>
          <p className="mt-4 text-slate-500 italic">
            * Nota: O reinício ocorrerá com base no "Horário do Debian" exibido acima.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AutomationPanel;

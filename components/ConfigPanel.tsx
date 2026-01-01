
import React, { useState } from 'react';
import { Save, Shield, Globe, Monitor, Cpu, Lock, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { ServerConfig } from '../types';
import { api } from '../lib/api';

interface ConfigPanelProps {
  config: ServerConfig;
  setConfig: React.Dispatch<React.SetStateAction<ServerConfig>>;
  readOnly?: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig, readOnly }) => {
  const [activeSection, setActiveSection] = useState<'general' | 'gameplay' | 'network' | 'moderators'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Garantir que moderator_list sempre seja um array
  const moderatorList = config.moderator_list || [];

  const handleToggle = (key: keyof ServerConfig) => {
    if (readOnly) return;
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (key: keyof ServerConfig, value: string | number) => {
    if (readOnly) return;
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      await api.saveConfig(config);
      alert('Configuração salva com sucesso no Debian!');
    } catch (err) {
      alert('Erro ao salvar no servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const addModerator = () => {
    if (readOnly) return;
    setConfig(prev => ({
      ...prev,
      moderator_list: [...moderatorList, '']
    }));
  };

  const updateModerator = (index: number, value: string) => {
    if (readOnly) return;
    const newList = [...moderatorList];
    newList[index] = value;
    setConfig(prev => ({ ...prev, moderator_list: newList }));
  };

  const removeModerator = (index: number) => {
    if (readOnly) return;
    const newList = moderatorList.filter((_, i) => i !== index);
    setConfig(prev => ({ ...prev, moderator_list: newList }));
  };

  const sections = [
    { id: 'general', label: 'Geral', icon: Monitor },
    { id: 'gameplay', label: 'Jogabilidade', icon: Cpu },
    { id: 'network', label: 'Rede / GSLT', icon: Globe },
    { id: 'moderators', label: 'Moderadores', icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Configurações do Servidor</h2>
          <p className="text-slate-400">Edite o <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 text-xs font-mono">server_config.sii</code> em tempo real.</p>
        </div>
        {!readOnly ? (
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
            {isSaving ? 'Salvando...' : 'Aplicar no Debian'}
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-500 rounded-lg text-[10px] font-bold border border-slate-700">
            <Lock size={14} />
            SOMENTE LEITURA
          </div>
        )}
      </div>

      <div className="flex gap-8">
        <div className="w-56 shrink-0 space-y-1">
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === s.id ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-semibold">{s.label}</span>
              </button>
            )
          })}
        </div>

        <div className={`flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-8 min-h-[500px] shadow-xl ${readOnly ? 'opacity-90' : ''}`}>
          {activeSection === 'general' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
                <Monitor size={20} className="text-blue-500" /> Informações do Lobby
              </h3>
              <div className="grid gap-6">
                <ConfigInput label="Nome do Servidor" value={config.lobby_name} onChange={(v: string) => handleInputChange('lobby_name', v)} readOnly={readOnly} />
                <ConfigTextarea label="Descrição" value={config.description} onChange={(v: string) => handleInputChange('description', v)} readOnly={readOnly} />
                <ConfigInput label="Capacidade de Jogadores" type="number" value={config.max_players} onChange={(v: string) => handleInputChange('max_players', parseInt(v))} readOnly={readOnly} />
              </div>
            </div>
          )}

          {activeSection === 'gameplay' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
                <Cpu size={20} className="text-purple-500" /> Regras de Simulação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ToggleSwitch label="Dano entre Jogadores" active={config.player_damage} onToggle={() => handleToggle('player_damage')} readOnly={readOnly} />
                <ToggleSwitch label="Tráfego de IA" active={config.traffic} onToggle={() => handleToggle('traffic')} readOnly={readOnly} />
                <ToggleSwitch label="Forçar Limitador de Velocidade" active={config.force_speed_limiter} onToggle={() => handleToggle('force_speed_limiter')} readOnly={readOnly} />
                <ToggleSwitch label="Esconder Colisões" active={config.hide_colliding} onToggle={() => handleToggle('hide_colliding')} readOnly={readOnly} />
              </div>
            </div>
          )}

          {activeSection === 'network' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
                <Globe size={20} className="text-green-500" /> Rede e GSLT (Steam)
              </h3>
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest">GSLT Token (Obrigatório p/ lista pública)</label>
                <div className="relative">
                  <input 
                    type={showToken ? "text" : "password"}
                    value={config.server_logon_token} 
                    onChange={(e) => handleInputChange('server_logon_token', e.target.value)}
                    disabled={readOnly}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-white font-mono text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button 
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'moderators' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield size={20} className="text-red-500" /> Moderadores (Steam IDs)
                </h3>
                {!readOnly && (
                  <button 
                    onClick={addModerator}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all border border-slate-700"
                  >
                    <Plus size={14} /> Adicionar ID
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {moderatorList.map((id, index) => (
                  <div key={index} className="flex gap-2 group">
                    <div className="flex-1">
                      <ConfigInput 
                        placeholder="Ex: 76561198099299481" 
                        value={id} 
                        onChange={(v: string) => updateModerator(index, v)} 
                        readOnly={readOnly} 
                      />
                    </div>
                    {!readOnly && (
                      <button 
                        onClick={() => removeModerator(index)}
                        className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/10"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                {moderatorList.length === 0 && (
                  <p className="text-center py-10 text-slate-500 text-sm italic">Nenhum moderador listado no arquivo SII.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConfigInput = ({ label, value, onChange, type = "text", readOnly, placeholder }: any) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>}
    <input 
      type={type} 
      value={value} 
      placeholder={placeholder}
      onChange={e => onChange?.(e.target.value)}
      disabled={readOnly}
      className={`w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${readOnly ? 'cursor-not-allowed opacity-60 bg-slate-900' : 'hover:border-slate-600'}`}
    />
  </div>
);

const ConfigTextarea = ({ label, value, onChange, readOnly }: any) => (
  <div>
    <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
    <textarea 
      value={value} 
      onChange={e => onChange?.(e.target.value)}
      disabled={readOnly}
      className={`w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 h-28 transition-all ${readOnly ? 'cursor-not-allowed opacity-60 bg-slate-900' : 'hover:border-slate-600'}`}
    />
  </div>
);

const ToggleSwitch = ({ label, active, onToggle, readOnly }: any) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all">
    <span className="text-sm font-bold text-slate-300">{label}</span>
    <button 
      onClick={onToggle}
      disabled={readOnly}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${active ? 'bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-700'} ${readOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

export default ConfigPanel;

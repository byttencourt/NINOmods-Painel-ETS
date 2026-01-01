
import { ServerConfig, ServerStats, ServerStatus, BannedUser, ConnectedPlayer } from '../types';

const getBaseUrl = () => {
  const { hostname, protocol, port } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://${hostname}:3000/api`;
  }
  return `${protocol}//${hostname}${port ? `:${port}` : ''}/api`;
};

export const BACKEND_URL = getBaseUrl();

export const parseSiiConfig = (siiContent: string): Partial<ServerConfig> => {
  if (!siiContent) return { moderator_list: [] };
  const config: any = { moderator_list: [] };
  const lines = siiContent.split('\n');
  
  lines.forEach(line => {
    const modMatch = line.match(/^\s*moderator_list\[\d+\]\s*:\s*(.*)$/);
    if (modMatch) {
      config.moderator_list.push(modMatch[1].trim());
      return;
    }
    const match = line.match(/^\s*(\w+)\s*:\s*(.*)$/);
    if (match) {
      let [_, key, value] = match;
      if (key === 'moderator_list') return;
      value = value.trim().split('#')[0].trim().replace(/^"(.*)"$/, '$1'); 
      if (value === 'true') config[key] = true;
      else if (value === 'false') config[key] = false;
      else if (!isNaN(Number(value)) && value !== '' && !value.includes('.')) config[key] = parseInt(value);
      else if (!isNaN(Number(value)) && value !== '') config[key] = parseFloat(value);
      else config[key] = value;
    }
  });
  return config;
};

export const stringifySiiConfig = (config: ServerConfig): string => {
  let content = 'SiiNunit\n{\nserver_config : _nameless.config {\n';
  Object.entries(config).forEach(([key, value]) => {
    if (key === 'moderator_list') return;
    const formattedValue = typeof value === 'string' ? `"${value}"` : value;
    content += ` ${key}: ${formattedValue}\n`;
  });
  content += ` moderator_list: ${config.moderator_list.length}\n`;
  config.moderator_list.forEach((id, index) => {
    content += ` moderator_list[${index}]: ${id}\n`;
  });
  content += '}\n}';
  return content;
};

export const api = {
  async fetchStatus(): Promise<ServerStatus> {
    try {
      const response = await fetch(`${BACKEND_URL}/server/status`);
      const data = await response.json();
      return data.active ? ServerStatus.ONLINE : ServerStatus.OFFLINE;
    } catch { return ServerStatus.OFFLINE; }
  },

  async fetchPlayers(): Promise<ConnectedPlayer[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/server/players`);
      const data = await response.json();
      return data.players || [];
    } catch { return []; }
  },

  async fetchConfig(): Promise<Partial<ServerConfig>> {
    const response = await fetch(`${BACKEND_URL}/config`);
    const data = await response.json();
    return parseSiiConfig(data.content);
  },

  async fetchStats(): Promise<ServerStats> {
    const response = await fetch(`${BACKEND_URL}/server/stats`);
    return await response.json();
  },

  async fetchBans(): Promise<BannedUser[]> {
    const response = await fetch(`${BACKEND_URL}/bans`);
    const data = await response.json();
    return data.bans || [];
  },

  async saveBans(bans: BannedUser[]): Promise<void> {
    await fetch(`${BACKEND_URL}/bans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bans })
    });
  },

  async saveConfig(config: ServerConfig): Promise<void> {
    await fetch(`${BACKEND_URL}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: stringifySiiConfig(config) })
    });
  },

  async sendServerAction(action: 'start' | 'stop' | 'restart'): Promise<void> {
    await fetch(`${BACKEND_URL}/server/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
  }
};

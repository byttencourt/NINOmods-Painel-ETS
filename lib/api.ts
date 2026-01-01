import { ServerConfig } from '../types';

/**
 * Detecta o endereço da API dinamicamente.
 * Em produção (Debian + Nginx), usamos caminhos relativos para evitar erros de CORS 
 * e problemas com portas bloqueadas no Mikrotik.
 */
const getBaseUrl = () => {
  const { hostname, protocol, port } = window.location;
  
  // Se estivermos em desenvolvimento local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://${hostname}:3000/api`;
  }
  
  // Em produção, o Nginx vai escutar na mesma porta do frontend (ex: 8081)
  // e repassar o prefixo /api/ para o backend na porta 3000.
  return `${protocol}//${hostname}${port ? `:${port}` : ''}/api`;
};

export const BACKEND_URL = getBaseUrl();

export const parseSiiConfig = (siiContent: string): Partial<ServerConfig> => {
  if (!siiContent) return {};
  const config: any = {};
  const lines = siiContent.split('\n');
  
  lines.forEach(line => {
    const match = line.match(/^\s*(\w+)\s*:\s*(.*)$/);
    if (match) {
      let [_, key, value] = match;
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
  async fetchConfig(): Promise<Partial<ServerConfig>> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(`${BACKEND_URL}/config`, { signal: controller.signal });
      clearTimeout(id);
      if (!response.ok) throw new Error("Status API inválido");
      const data = await response.json();
      return parseSiiConfig(data.content);
    } catch (error) {
      console.error(`[API] Erro ao buscar configuração em ${BACKEND_URL}:`, error);
      throw error;
    }
  },

  async saveConfig(config: ServerConfig): Promise<boolean> {
    const siiText = stringifySiiConfig(config);
    try {
      const response = await fetch(`${BACKEND_URL}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: siiText })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  async sendServerAction(action: 'start' | 'stop' | 'restart'): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/server/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};
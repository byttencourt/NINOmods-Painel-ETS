
export type UserRole = 'SUPERADMIN' | 'ADMIN';

export interface UserSession {
  id: string;
  username: string;
  role: UserRole;
  token: string;
}

export interface ManagedUser {
  id: string;
  username: string;
  role: UserRole;
  lastLogin: string;
  permissions: {
    canControlServer: boolean;
    canEditConfig: boolean;
    canManageUsers: boolean;
  };
}

export interface BannedUser {
  steamId: string;
  username: string;
  reason: string;
  bannedAt: string;
  bannedBy: string;
}

export interface ConnectedPlayer {
  steamId: string;
  username: string;
  ping: number;
  connectedSince: string;
  country: string;
}

export interface ServerConfig {
  lobby_name: string;
  description: string;
  welcome_message: string;
  password: string;
  max_players: number;
  max_vehicles_total: number;
  max_ai_vehicles_player: number;
  max_ai_vehicles_player_spawn: number;
  connection_virtual_port: number;
  query_virtual_port: number;
  connection_dedicated_port: number;
  query_dedicated_port: number;
  server_logon_token: string;
  player_damage: boolean;
  traffic: boolean;
  hide_in_company: boolean;
  hide_colliding: boolean;
  force_speed_limiter: boolean;
  mods_optioning: boolean;
  timezones: number;
  service_no_collision: boolean;
  in_menu_ghosting: boolean;
  name_tags: boolean;
  friends_only: boolean;
  show_server: boolean;
  moderator_list: string[];
}

export enum ServerStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  STARTING = 'STARTING',
  STOPPING = 'STOPPING',
  ERROR = 'ERROR'
}

export interface AutomationSettings {
  autoStartOnBoot: boolean;
  dailyRestart: boolean;
  restartHour: string;
}


import React, { useState } from 'react';
import { ShieldCheck, UserPlus, ShieldAlert, MoreVertical, Trash2, Lock, Unlock } from 'lucide-react';
import { ManagedUser } from '../types';

const MOCK_USERS: ManagedUser[] = [
  {
    id: '1',
    username: 'super_atitecnica',
    role: 'SUPERADMIN',
    lastLogin: 'Agora mesmo',
    permissions: { canControlServer: true, canEditConfig: true, canManageUsers: true }
  },
  {
    id: '2',
    username: 'moderador_01',
    role: 'ADMIN',
    lastLogin: '2 horas atrás',
    permissions: { canControlServer: true, canEditConfig: false, canManageUsers: false }
  }
];

const AdminManagement: React.FC = () => {
  const [users, setUsers] = useState<ManagedUser[]>(MOCK_USERS);

  const togglePermission = (userId: string, permission: keyof ManagedUser['permissions']) => {
    setUsers(users.map(u => {
      if (u.id === userId && u.role !== 'SUPERADMIN') {
        return {
          ...u,
          permissions: { ...u.permissions, [permission]: !u.permissions[permission] }
        };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestão de Acessos</h2>
          <p className="text-slate-400">Gerencie quem pode controlar e configurar o servidor ETS2.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all">
          <UserPlus size={18} />
          Novo Admin
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Usuário</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Nível</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Permissões</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Último Acesso</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.role === 'SUPERADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-white">{user.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] px-2 py-1 rounded font-bold ${user.role === 'SUPERADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <PermissionBadge 
                      active={user.permissions.canControlServer} 
                      label="Power" 
                      onClick={() => togglePermission(user.id, 'canControlServer')}
                      disabled={user.role === 'SUPERADMIN'}
                    />
                    <PermissionBadge 
                      active={user.permissions.canEditConfig} 
                      label="Config" 
                      onClick={() => togglePermission(user.id, 'canEditConfig')}
                      disabled={user.role === 'SUPERADMIN'}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {user.lastLogin}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {user.role !== 'SUPERADMIN' && (
                      <button className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button className="p-2 text-slate-500 hover:text-white">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl flex gap-3">
        <ShieldAlert className="text-blue-400 shrink-0" size={20} />
        <p className="text-xs text-blue-300 leading-relaxed">
          <strong>Dica de Segurança:</strong> Somente o Superadmin pode alterar permissões e deletar usuários. Administradores sem permissão de "Config" só poderão visualizar a aba de configurações, sem salvar alterações.
        </p>
      </div>
    </div>
  );
};

const PermissionBadge: React.FC<{ active: boolean, label: string, onClick: () => void, disabled?: boolean }> = ({ active, label, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-all border ${
      active 
        ? 'bg-green-500/10 border-green-500/30 text-green-500' 
        : 'bg-slate-800 border-slate-700 text-slate-500'
    } ${disabled ? 'cursor-default opacity-80' : 'hover:scale-105 active:scale-95'}`}
  >
    {label}
  </button>
);

export default AdminManagement;

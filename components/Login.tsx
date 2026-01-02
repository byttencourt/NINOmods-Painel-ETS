
import React, { useState } from 'react';
import { auth } from '../lib/auth';
import { Lock, Mail, Loader2, Beaker, ShieldCheck, Eye, EyeOff } from 'lucide-react';

/** 
 * CONFIGURAÇÃO DE DESENVOLVIMENTO
 * Mude para false para obrigar a autenticação real via Backend no Debian.
 */
const BYPASS_BACKEND_TEST = false;

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Lógica de Usuário Teste (Bypass)
    if (BYPASS_BACKEND_TEST && email === 'teste' && password === '123') {
      setTimeout(() => {
        const mockSession = {
          id: 'test-id',
          username: 'usuário_teste',
          role: 'SUPERADMIN',
          token: 'mock-token-123'
        };
        localStorage.setItem('ets2_session', JSON.stringify(mockSession));
        onLogin();
      }, 500);
      return;
    }

    try {
      await auth.signIn(email, password);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor Debian.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
            <img 
              src="https://i.postimg.cc/kgP2578h/nino_logop.png" 
              alt="NINOmods Logo" 
              className="h-24 w-auto drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">NINOmods Painel</h1>
          <p className="text-slate-400 mt-2 tracking-wide text-sm">Gerenciamento ETS2 | Debian 13 Server</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
          {BYPASS_BACKEND_TEST && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg animate-bounce">
              <Beaker size={12} />
              MODO TESTE ATIVO
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Usuário / E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  placeholder="Seu usuário do Debian"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-12 py-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : (
                <>
                  <ShieldCheck size={20} />
                  Entrar no Sistema
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-slate-500">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Conexão Segura com Debian</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

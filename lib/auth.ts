import { BACKEND_URL } from './api';

export const auth = {
  /**
   * Realiza o login enviando os dados para o servidor Debian na porta 3000.
   */
  async signIn(username: string, pass: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciais inválidas.');
      }

      const sessionData = await response.json();
      
      // Salva a sessão no navegador (Token JWT ou Objeto de Usuário)
      localStorage.setItem('ets2_session', JSON.stringify(sessionData));
      
      return sessionData;
    } catch (error: any) {
      console.error('[AUTH] Erro no login:', error.message);
      throw new Error(error.message || 'Não foi possível conectar ao servidor de autenticação.');
    }
  },

  async signOut() {
    localStorage.removeItem('ets2_session');
    window.location.reload();
  },

  getSession() {
    const session = localStorage.getItem('ets2_session');
    return session ? JSON.parse(session) : null;
  }
};
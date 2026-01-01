
<p align="center">
  <img src="https://i.imgur.com/sqGMqV1.png" alt="NINOmods Logo" width="200" />
</p>

<h1 align="center">NINOmods Manager - ETS2 Pro</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Vite-6-purple?style=for-the-badge&logo=vite" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Debian-13-A81D33?style=for-the-badge&logo=debian" />
</p>

<p align="center">
  <strong>A solução definitiva para gerenciamento de servidores dedicados de Euro Truck Simulator 2.</strong><br />
  Interface moderna, controle em tempo real e automação avançada para a sua empresa virtual.
</p>

---

## 📸 Preview do Sistema

<p align="center">
  <img src="https://i.imgur.com/sf8gQw0.png" alt="Dashboard NINOmods" width="100%" style="border-radius: 10px; border: 1px solid #334155;" />
</p>

---

## ✨ Funcionalidades Premium

*   **📊 Dashboard de Performance**: Gráficos de atividade em tempo real, monitoramento de CPU, RAM e contagem de jogadores online.
*   **⚙️ Editor Visual SII**: Altere o `server_config.sii` diretamente pelo navegador com interface amigável. Chega de editar arquivos de texto via terminal!
*   **🔨 Gestão de Banimentos**: Lista de banidos (`banlist.sii`) integrada, permitindo banir e desbanir jogadores com apenas um clique.
*   **🤖 Automação e Resiliência**: Configuração de reinicialização diária automática e integração nativa com `systemd` do Debian.
*   **📟 Console em Tempo Real**: Visualize os logs do binário do servidor e envie comandos diretamente para o sistema.
*   **🔐 Controle de Acesso**: Sistema de permissões para Administradores e Superadmins.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 19, TypeScript, Tailwind CSS.
- **Ícones**: Lucide React.
- **Gráficos**: Recharts.
- **Backend**: Node.js (API de comunicação com o sistema Debian).
- **Servidor Web**: Nginx como Proxy Reverso.

---

## 🚀 Como Instalar (Quick Start)

### 1. Preparação no Debian 13
```bash
apt update && apt install git nodejs npm nginx -y
git clone https://github.com/byttencourt/NINOmods-Painel-ETS.git
cd NINOmods-Painel-ETS
```

### 2. Build do Painel
No seu ambiente de desenvolvimento:
```bash
npm install
npm run build
```
Mova a pasta `dist` gerada para `/var/www/html/ets2-panel/` no seu servidor.

### 3. Configuração do Nginx
Crie um arquivo em `/etc/nginx/sites-available/ets2-panel` com a porta 8081 apontando para o seu diretório e fazendo o proxy da `/api` para a porta 3000.

---

## 👨‍💻 Desenvolvido por

<p align="left">
  <strong>NINOdev</strong><br />
  Soluções Inteligentes para Euro Truck Simulator 2.<br />
  <a href="https://github.com/byttencourt">
    <img src="https://img.shields.io/badge/GitHub-Perfil-181717?style=flat-square&logo=github" />
  </a>
</p>

<p align="center">
  <em>"Transformando a simulação em gerenciamento profissional."</em>
</p>

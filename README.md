
<p align="center">
  <img src="https://i.postimg.cc/kgP2578h/nino_logop.png" alt="NINOmods Logo" width="220" />
</p>

<h1 align="center">NINOmods Manager — ETS2 Dedicated Pro</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Release-v1.5.0-blue?style=for-the-badge&logo=github" />
  <img src="https://img.shields.io/badge/Environment-Debian_13-A81D33?style=for-the-badge&logo=debian&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Backend-Node.js_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white" />
</p>

<p align="center">
  <strong>O gerenciador mais avançado para frotas e empresas virtuais de Euro Truck Simulator 2.</strong><br />
  Controle total do seu servidor Linux com uma interface intuitiva, segura e performática.
</p>

---

## 🖼️ Interface do Sistema
<p align="center">
  <img src="https://i.imgur.com/TGyGnBr.png" alt="Interface Preview" width="100%" style="border-radius: 12px; border: 1px solid #1e293b;" />
  <br><em>*Visualização do Dashboard em tempo real com telemetria de 24 horas.*</em>
</p>

---

## 💎 Funcionalidades de Elite

### 📊 Inteligência de Dados & Telemetria
*   **Histórico de 24 Horas**: Motor de telemetria persistente que armazena a atividade do comboio (`players vs time`) em ciclos de 5 minutos, totalizando 288 pontos de dados diários.
*   **Monitoramento de Hardware**: Leitura direta via `os-utils` para consumo de CPU, RAM (Uso/Total) e Load Average do Debian.
*   **Uptime Inteligente**: Cálculo preciso do tempo de atividade do processo do servidor através do parser de logs.

### ⚙️ Engenharia SII (No-Code Config)
*   **Parser de Alta Fidelidade**: Sistema inteligente que lê e escreve no `server_config.sii` preservando a estrutura nativa do jogo.
*   **Gestão de Moderadores**: Interface dinâmica para adicionar SteamIDs de moderadores sem necessidade de reiniciar o serviço.
*   **Configurações de Simulação**: Controle visual para tráfego IA, limite de velocidade, dano entre jogadores e colisões em áreas de descanso.
*   **GSLT Integration**: Campo seguro para gestão do Steam Game Server Logon Token.

### 🛡️ Segurança & Moderação
*   **Advanced Log Tracking**: Motor de busca que identifica jogadores entrando e saindo do servidor em tempo real.
*   **Sistema de Banimento .sii**: Interface completa para gestão do `banlist.sii`, permitindo banimentos rápidos e revogações automáticas.
*   **Detetive de SteamID**: Ferramenta integrada para auxiliar na busca do perfil Steam de infratores diretamente pela interface.

### 🤖 Automação Operacional
*   **Integração Systemd**: Gerenciamento nativo de serviços Linux (Start/Stop/Restart/Status).
*   **Crontab Manager**: Interface para agendamento de reinicializações diárias, garantindo a performance do servidor em horários de baixa atividade.
*   **Persistence Mode**: Opção de habilitação automática do servidor após reinicialização física do hardware (Debian Boot).

---

## 🛠️ Especificações Técnicas

*   **Linguagem**: TypeScript (End-to-end type safety).
*   **Frontend**: React 19 + Tailwind CSS v4 + Lucide Icons.
*   **Gráficos**: Recharts (High performance SVG charts).
*   **Backend**: Node.js com Express.
*   **Comunicação**: API REST com baixa latência para sincronização de logs.
*   **Segurança**: Autenticação baseada em funções (SUPERADMIN e ADMIN).

---

## 🚀 Instalação e Deployment

O painel foi otimizado para rodar em instâncias **Debian 12/13 (Trixie)**, seja em Bare Metal, Proxmox ou VPS.

1. **Backend**:
   ```bash
   cd ets2-backend
   npm install
   # Configure os caminhos no server.js
   node server.js
   ```

2. **Frontend**:
   ```bash
   npm install
   npm run build
   # Sirva a pasta 'dist' via Nginx
   ```

---

## 👨‍💻 Créditos

**NINOdev (byttencourt)**  
*Especialista em soluções de automação para simulação e gerenciamento de servidores dedicados.*

---
<p align="center">
  2024-2025 © NINOmods - Dedicated Server Management
</p>


<p align="center">
  <img src="https://i.postimg.cc/kgP2578h/nino_logop.png" alt="NINOmods Logo" width="180" />
</p>

<h1 align="center">NINOmods Manager — ETS2 Dedicated Pro</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Estável-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Debian-13-A81D33?style=for-the-badge&logo=debian&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-LTS-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-V4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

<p align="center">
  <strong>A solução definitiva e de alta performance para a gestão de servidores Euro Truck Simulator 2.</strong><br />
  Desenvolvido para empresas virtuais que exigem estabilidade, dados precisos e controle absoluto sobre o ambiente Debian.
</p>

---

## 💎 A Vitrine de Funcionalidades

O **NINOmods Manager** não é apenas um painel; é um ecossistema completo de gerenciamento que elimina a necessidade de acesso via terminal (SSH) para operações cotidianas.

### 📊 Dashboard de Inteligência (Real-Time)
*   **Telemetria de 24 Horas**: Gráfico de atividade histórica que armazena 288 pontos de dados (amostragem a cada 5 min), permitindo identificar horários de pico e engajamento do comboio.
*   **Monitoramento de Recursos Críticos**: Visualização em tempo real do uso de CPU e RAM do servidor Proxmox/Debian.
*   **Contador de Jogadores Live**: Sincronização de 5 segundos com o log oficial para contagem precisa de `Online / Max Players`.
*   **Indicador Uptime**: Cronômetro de estabilidade do processo do servidor.

### ⚙️ Gestão de Configuração SII (No-Code)
*   **Editor Visual Progressivo**: Esqueça a edição manual do `server_config.sii`. Altere nomes de lobby, senhas e mensagens de boas-vindas em uma interface elegante.
*   **Controle de Simulação**: Habilite/Desabilite tráfego IA, dano entre jogadores, limitador de velocidade e colisões em áreas de serviço com um clique.
*   **Gestão de GSLT**: Campo dedicado para tokens da Steam, essencial para servidores que buscam visibilidade na lista pública.
*   **Lista de Moderadores**: Adicione ou remova SteamIDs de moderadores sem reiniciar o servidor.

### 🛡️ Moderação Avançada
*   **Radar de Jogadores**: Lista detalhada de quem está no servidor agora, incluindo ID de conexão e tempo de permanência.
*   **Identificador de SteamID**: Sistema que auxilia na busca do SteamID64 do infrator diretamente pelo nome de usuário no log.
*   **Banlist Integrada**: Interface para gerenciar o arquivo `banlist.sii`, permitindo banimentos permanentes e revogações instantâneas.

### 🤖 Automação e Resiliência
*   **Restart Diário Programado**: Configure um horário (ex: 04:00 AM) para o servidor reiniciar automaticamente via Cron, garantindo a limpeza de cache e performance.
*   **Persistência no Boot**: Integração nativa com `systemd` para garantir que o servidor suba sozinho caso o Debian seja reiniciado.
*   **Console Web Interativo**: Visualize o log de saída do binário `eurotrucks2_server` em tempo real com sintaxe colorida (Highlight de Erros e Avisos).

---

## 🛠️ Arquitetura Técnica

*   **Frontend**: React 19 com TypeScript, utilizando **Lucide React** para iconografia e **Recharts** para visualização de dados complexos.
*   **Backend**: API em Node.js (Express) com execução de comandos de baixo nível via `child_process` para interação direta com o Linux.
*   **Segurança**: Sistema de autenticação JWT com níveis de acesso:
    *   **SUPERADMIN**: Controle total de serviços e automação.
    *   **ADMIN**: Gestão de jogadores, banimentos e monitoramento.
*   **Otimização de Log**: Leitura via `tail -n` para garantir que o painel permaneça veloz mesmo com arquivos de log de centenas de MB.

---

## 🚀 Guia de Implementação Rápida

### Requisitos
- Debian 12 ou 13.
- Node.js 18+.
- Nginx (recomendado para Proxy Reverso).

### Instalação no Servidor
1. **Clonar Repositório**:
   ```bash
   git clone https://github.com/byttencourt/NINOmods-Painel-ETS.git
   ```
2. **Backend**:
   ```bash
   cd ets2-backend
   npm install
   node server.js
   ```
3. **Frontend**:
   ```bash
   npm install
   npm run build
   # Mova a pasta 'dist' para o diretório do Nginx
   ```

---

## 👨‍💻 Sobre o Desenvolvedor

**NINOdev (byttencourt)**
Especialista em automação de servidores de jogos e interfaces de alta fidelidade. Focado em transformar logs complexos de simulação em experiências de usuário intuitivas e poderosas.

> *"Transformando a simulação em gerenciamento profissional de frotas."*

---
<p align="center">
  PROJETADO PARA O DEBIAN 13 "TRIAXIE" | 2024-2025
</p>

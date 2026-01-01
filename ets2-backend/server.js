
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { exec } = require('child_process');
const app = express();

app.use(cors());
app.use(express.json());

// CONFIGURAÇÕES DE CAMINHO
const BASE_PATH = '/home/steam/.local/share/Euro Truck Simulator 2';
const CONFIG_PATH = `${BASE_PATH}/server_config.sii`;
const BAN_PATH = `${BASE_PATH}/banlist.sii`;
const LOG_PATH = `${BASE_PATH}/server.log.txt`;
const ADMINS_DB_PATH = path.join(__dirname, 'admins.json');
const SERVICE_NAME = 'ets2-server.service'; 

function formatMs(ms) {
    if (!ms || isNaN(ms)) return "00h 00m";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${minutes.toString().padStart(2, '0')}m`);
    parts.push(`${seconds.toString().padStart(2, '0')}s`);
    return parts.join(' ');
}

// LOGIN
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    try {
        if (!fs.existsSync(ADMINS_DB_PATH)) return res.status(500).json({ message: "Erro de auth." });
        const users = JSON.parse(fs.readFileSync(ADMINS_DB_PATH, 'utf8'));
        const user = users.find(u => u.username === username && u.password === password);
        if (user) return res.json({ id: Date.now().toString(), username: user.username, role: user.role, token: "TK_" + Date.now() });
        res.status(401).json({ message: "Incorreto." });
    } catch (e) { res.status(500).send(); }
});

// LISTA DE JOGADORES - FORMATO REAL DO LOG DO USUÁRIO
app.get('/api/server/players', (req, res) => {
    if (!fs.existsSync(LOG_PATH)) return res.json({ players: [] });
    
    try {
        const logContent = fs.readFileSync(LOG_PATH, 'utf8');
        const lines = logContent.split('\n');
        const playersMap = new Map();

        lines.forEach(line => {
            // Detecta entrada: [MP] NOME connected, client_id = X
            const joinMatch = line.match(/\[MP\] (.*) connected, client_id = (\d+)/);
            if (joinMatch) {
                const name = joinMatch[1].trim();
                const cid = joinMatch[2];
                playersMap.set(cid, { 
                    username: name, 
                    steamId: "Desconhecido", // O log não fornece o SteamID nesta linha
                    clientId: cid,
                    connectedAt: line.substring(0, 8)
                });
            }
            // Detecta saída: [MP] NOME disconnected, client_id = X
            const leaveMatch = line.match(/\[MP\] (.*) disconnected, client_id = (\d+)/);
            if (leaveMatch) {
                playersMap.delete(leaveMatch[2]);
            }
        });

        res.json({ players: Array.from(playersMap.values()) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// STATUS
app.get('/api/server/status', (req, res) => {
    exec(`systemctl is-active ${SERVICE_NAME}`, (err, stdout) => {
        res.json({ active: stdout.trim() === 'active' });
    });
});

// STATS
app.get('/api/server/stats', (req, res) => {
    const totalMem = os.totalmem();
    const usedMem = totalMem - os.freemem();
    const cpuLoad = (os.loadavg()[0] * 10).toFixed(1) + "%";
    let uptime = "Offline", players = 0;

    if (fs.existsSync(LOG_PATH)) {
        const log = fs.readFileSync(LOG_PATH, 'utf8').split('\n');
        for (let i = log.length - 1; i >= 0; i--) {
            if (log[i].includes('State: running')) {
                const tm = log[i].match(/Time:\s*(\d+)/);
                const pl = log[i].match(/Players:\s*(\d+)/);
                if (tm) uptime = formatMs(parseInt(tm[1]));
                if (pl) players = parseInt(pl[1]);
                break;
            }
        }
    }
    res.json({ cpuUsage: cpuLoad, ramUsage: (usedMem/1024/1024/1024).toFixed(1)+"GB", ramTotal: (totalMem/1024/1024/1024).toFixed(1)+"GB", uptime, playersOnline: players, playersMax: 128, history: [] });
});

// CONFIGURAÇÃO
app.get('/api/config', (req, res) => res.json({ content: fs.readFileSync(CONFIG_PATH, 'utf8') }));
app.post('/api/config', (req, res) => { fs.writeFileSync(CONFIG_PATH, req.body.content); res.json({status: "ok"}); });

// BANLIST
app.get('/api/bans', (req, res) => {
    if (!fs.existsSync(BAN_PATH)) return res.json({ bans: [] });
    const data = fs.readFileSync(BAN_PATH, 'utf8');
    const bans = [];
    data.split('\n').forEach(line => {
        const match = line.match(/ban_list\[\d+\]:\s*(.*)/);
        if (match) bans.push({ steamId: match[1].trim(), username: "Jogador Banido", reason: "Arquivo .sii", bannedAt: "-", bannedBy: "system" });
    });
    res.json({ bans });
});
app.post('/api/bans', (req, res) => {
    let content = 'SiiNunit\n{\nban_list : _nameless.banlist {\n';
    content += ` ban_list: ${req.body.bans.length}\n`;
    req.body.bans.forEach((ban, i) => content += ` ban_list[${i}]: ${ban.steamId}\n`);
    content += '}\n}';
    fs.writeFileSync(BAN_PATH, content);
    res.json({ status: "ok" });
});

app.post('/api/server/action', (req, res) => {
    exec(`sudo systemctl ${req.body.action} ${SERVICE_NAME}`, (err) => res.json({ status: "ok" }));
});

app.listen(3000, '0.0.0.0');

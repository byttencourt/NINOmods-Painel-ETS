
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { exec, execSync } = require('child_process');
const app = express();

app.use(cors());
app.use(express.json());

// CONFIGURAÇÕES DE CAMINHO
const BASE_PATH = '/home/steam/.local/share/Euro Truck Simulator 2';
const CONFIG_PATH = `${BASE_PATH}/server_config.sii`;
const BAN_PATH = `${BASE_PATH}/banlist.sii`;
const LOG_PATH = `${BASE_PATH}/server.log.txt`;
const SERVICE_NAME = 'ets2-server.service'; 

// Caminhos do Banco de Dados Interno do Painel
const ADMINS_DB_PATH = path.join(__dirname, 'admins.json');
const AUTOMATION_DB = path.join(__dirname, 'automation.json');
const HISTORY_DB = path.join(__dirname, 'history.json');

// Inicialização de Arquivos
if (!fs.existsSync(ADMINS_DB_PATH)) {
    const defaultAdmins = [
        { "username": "byttencourt", "password": "Nico1503", "role": "SUPERADMIN" },
        { "username": "Christian", "password": "ati13", "role": "SUPERADMIN" },
        { "username": "Leandro", "password": "Frater2026", "role": "ADMIN" }
    ];
    fs.writeFileSync(ADMINS_DB_PATH, JSON.stringify(defaultAdmins, null, 4));
}

if (!fs.existsSync(AUTOMATION_DB)) {
    fs.writeFileSync(AUTOMATION_DB, JSON.stringify({ autoStartOnBoot: false, dailyRestart: false, restartHour: "04:00" }));
}

if (!fs.existsSync(HISTORY_DB)) {
    fs.writeFileSync(HISTORY_DB, JSON.stringify([]));
}

// Lógica de Telemetria (Heartbeat)
function updateHistory(currentPlayers) {
    try {
        let history = JSON.parse(fs.readFileSync(HISTORY_DB, 'utf8'));
        const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Adiciona novo ponto
        history.push({ time: now, players: currentPlayers });
        
        // Mantém apenas os últimos 20 registros (aprox. 1h40 de histórico se for a cada 5m)
        if (history.length > 20) history.shift();
        
        fs.writeFileSync(HISTORY_DB, JSON.stringify(history));
    } catch (e) { console.error("Erro na telemetria:", e); }
}

// Intervalo de amostragem: a cada 5 minutos
setInterval(() => {
    const stats = getLiveStats();
    updateHistory(stats.playersOnline);
}, 5 * 60 * 1000);

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

function getLiveStats() {
    let uptime = "Offline", players = 0;
    if (fs.existsSync(LOG_PATH)) {
        try {
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
        } catch (e) {}
    }
    return { uptime, playersOnline: players };
}

// API ENDPOINTS
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    try {
        const users = JSON.parse(fs.readFileSync(ADMINS_DB_PATH, 'utf8'));
        const user = users.find(u => u.username === username && u.password === password);
        if (user) return res.json({ id: Date.now().toString(), username: user.username, role: user.role, token: "TK_" + Date.now() });
        res.status(401).json({ message: "Usuário ou senha incorretos." });
    } catch (e) { res.status(500).json({ message: "Erro interno." }); }
});

app.get('/api/server/stats', (req, res) => {
    const totalMem = os.totalmem();
    const usedMem = totalMem - os.freemem();
    const cpuLoad = (os.loadavg()[0] * 10).toFixed(1) + "%";
    const systemTime = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    
    const live = getLiveStats();
    let history = [];
    try { history = JSON.parse(fs.readFileSync(HISTORY_DB, 'utf8')); } catch(e) {}

    res.json({ 
        cpuUsage: cpuLoad, 
        ramUsage: (usedMem/1024/1024/1024).toFixed(1)+"GB", 
        ramTotal: (totalMem/1024/1024/1024).toFixed(1)+"GB", 
        uptime: live.uptime, 
        playersOnline: live.playersOnline, 
        playersMax: 128, 
        systemTime, 
        history: history 
    });
});

app.get('/api/server/players', (req, res) => {
    if (!fs.existsSync(LOG_PATH)) return res.json({ players: [] });
    try {
        const logContent = fs.readFileSync(LOG_PATH, 'utf8');
        const lines = logContent.split('\n');
        const playersMap = new Map();
        lines.forEach(line => {
            const joinMatch = line.match(/\[MP\] (.*) connected, client_id = (\d+)/);
            if (joinMatch) {
                playersMap.set(joinMatch[2], { username: joinMatch[1].trim(), steamId: "Desconhecido", clientId: joinMatch[2], connectedAt: line.substring(0, 8) });
            }
            const leaveMatch = line.match(/\[MP\] (.*) disconnected, client_id = (\d+)/);
            if (leaveMatch) playersMap.delete(leaveMatch[2]);
        });
        res.json({ players: Array.from(playersMap.values()) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/server/status', (req, res) => {
    exec(`systemctl is-active ${SERVICE_NAME}`, (err, stdout) => {
        res.json({ active: stdout.trim() === 'active' });
    });
});

app.get('/api/config', (req, res) => res.json({ content: fs.readFileSync(CONFIG_PATH, 'utf8') }));
app.post('/api/config', (req, res) => { fs.writeFileSync(CONFIG_PATH, req.body.content); res.json({status: "ok"}); });

app.get('/api/automation', (req, res) => {
    try {
        const data = fs.readFileSync(AUTOMATION_DB, 'utf8');
        res.json(JSON.parse(data));
    } catch (e) { res.json({ autoStartOnBoot: false, dailyRestart: false, restartHour: "04:00" }); }
});

app.post('/api/automation', (req, res) => {
    const settings = req.body;
    fs.writeFileSync(AUTOMATION_DB, JSON.stringify(settings, null, 4));
    const systemdAction = settings.autoStartOnBoot ? 'enable' : 'disable';
    exec(`sudo systemctl ${systemdAction} ${SERVICE_NAME}`);
    try {
        let currentCron = "";
        try { currentCron = execSync('crontab -l').toString(); } catch(e) {}
        const lines = currentCron.split('\n').filter(l => l.trim() !== '' && !l.includes('# ETS2_TASK'));
        if (settings.dailyRestart) {
            const [hour, min] = settings.restartHour.split(':');
            lines.push(`${min} ${hour} * * * /usr/bin/systemctl restart ${SERVICE_NAME} # ETS2_TASK`);
        }
        const newCron = lines.join('\n').trim() + '\n';
        fs.writeFileSync('/tmp/cron_tmp', newCron);
        execSync('crontab /tmp/cron_tmp');
    } catch (e) {}
    res.json({ status: "ok" });
});

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
    let content = 'SiiNunit\n{\nban_list : {\n';
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

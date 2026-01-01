
# 🏁 Guia de Finalização (Deploy no Debian 13)

Agora que você já tem o `server.js` e o código do painel, siga estes últimos passos para colocar o sistema no ar.

## 1. Build do Frontend
No seu computador de desenvolvimento (ou onde você está rodando o npm):
1. Execute: `npm install`
2. Execute: `npm run build` (ou o comando de build do seu projeto, ex: `vite build`).
3. Isso vai gerar uma pasta chamada `dist` (ou `build`).
4. Mova os arquivos de dentro dessa pasta para o seu Debian em: `/var/www/html/ets2-panel` (ou a pasta que você preferir).

## 2. Permissão para o Comando Reiniciar (Sudoers)
Como o painel (Node.js) precisa dar comandos de sistema (`systemctl`), o usuário que roda o backend precisa de permissão sem senha apenas para esses comandos.

1. No terminal do Debian, digite:
   ```bash
   visudo
   ```
2. Adicione esta linha ao final do arquivo (substitua `root` pelo usuário que roda o backend, se for outro):
   ```bash
   root ALL=(ALL) NOPASSWD: /usr/bin/systemctl start ets2-server.service, /usr/bin/systemctl stop ets2-server.service, /usr/bin/systemctl restart ets2-server.service
   ```
3. Salve e saia. Isso permite que o painel reinicie o ETS2 sem pedir senha.

## 3. Configuração do Nginx (Servidor Web)
Para que o navegador entenda que o `/api` deve ir para a porta 3000 e o restante é o site, use esta configuração no Nginx:

1. Crie o arquivo: `nano /etc/nginx/sites-available/ets2-panel`
2. Cole este conteúdo:
```nginx
server {
    listen 80;
    server_name SEU_IP_AQUI;

    root /var/www/html/ets2-panel;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Direciona chamadas de API para o backend Node.js
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
3. Ative o site e reinicie o Nginx:
```bash
ln -s /etc/nginx/sites-available/ets2-panel /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 4. Ordem de Inicialização
Para que tudo funcione sempre:
1. `systemctl restart ets2-backend` (seu código Node.js)
2. `systemctl restart nginx` (seu servidor web)

---
**Tudo Pronto!** Agora você pode acessar o IP do seu Proxmox no navegador e o painel estará comunicando diretamente com o seu servidor de Euro Truck Simulator 2.

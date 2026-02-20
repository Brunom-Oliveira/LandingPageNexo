# Deploy Em VPS Ubuntu (Nginx)

Este projeto e estatico (`index.html`, `style.css`, `script.js`).

## 1. Estrutura recomendada

```bash
sudo mkdir -p /var/www/nexodigital
sudo chown -R $USER:$USER /var/www/nexodigital
```

Copie os arquivos do projeto para `/var/www/nexodigital`.

## 2. Nginx: site estatico + proxy do webhook

Ja deixei um arquivo pronto no projeto:

- `deploy/nginx/nexodigital.conf`

Crie o arquivo:

```bash
sudo nano /etc/nginx/sites-available/nexodigital
```

Conteudo sugerido:

```nginx
server {
    listen 80;
    server_name nexodigital.club www.nexodigital.club;

    root /var/www/nexodigital;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Endpoint usado pelo formulario: /webhook/lead-nexo
    location /webhook/ {
        proxy_pass http://127.0.0.1:5678/webhook/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache simples para assets estaticos
    location ~* \.(css|js|png|jpg|jpeg|webp|svg|ico)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Ou copie o arquivo pronto direto para a VPS:

```bash
sudo cp deploy/nginx/nexodigital.conf /etc/nginx/sites-available/nexodigital
```

Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/nexodigital /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 3. HTTPS (Let's Encrypt)

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d nexodigital.club -d www.nexodigital.club
sudo nginx -t
sudo systemctl reload nginx
```

## 4. Observacoes

- O formulario agora usa `action="/webhook/lead-nexo"`.
- Isso evita CORS no front e centraliza o acesso no proprio dominio.
- Se seu n8n estiver em outra porta/host, ajuste o `proxy_pass`.
- Se o n8n rodar em container/docker externo, troque `127.0.0.1:5678` pelo host correto.
- A config Nginx inclui `gzip`, `etag` e `limit_req` no `/webhook/` para ajudar desempenho e anti-spam.

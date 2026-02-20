# Deploy Em VPS Ubuntu (Nginx)

Este projeto e estatico (`index.html`, `style.css`, `script.js`).

## 1. Estrutura recomendada

```bash
sudo mkdir -p /var/www/nexodigital
sudo chown -R $USER:$USER /var/www/nexodigital
```

Copie os arquivos do projeto para `/var/www/nexodigital`.

## 2. Nginx: usar arquivo pronto do projeto

Use diretamente o arquivo:

- `deploy/nginx/nexodigital.conf`

Copie para a VPS:

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
- No n8n, valide payload (campos obrigatorios, tamanho minimo) e bloqueie duplicados por `email+whatsapp`.

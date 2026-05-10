# Blacktoner Contabo VPS Setup

This is the full command runbook for setting up the Blacktoner app on a Contabo VPS.

- Domain: `shop.makazicloud.com`
- App user: `bidan`
- App directory: `/var/www/blacktonner`
- API port: `3001`
- Web port: `3000`

Replace placeholders like `YOUR_SERVER_IP`, `YOUR_REPO_URL`, and `YOUR_DATABASE_URL`.

## Fresh Server Setup

SSH into the VPS as `root`:

```bash
ssh root@YOUR_SERVER_IP
```

Update the server:

```bash
apt update
apt upgrade -y
```

Create a non-root user for security:

```bash
adduser bidan
usermod -aG sudo bidan
```

Switch to the `bidan` user:

```bash
su - bidan
```

Install server packages:

```bash
sudo apt install -y git curl nginx certbot python3-certbot-nginx
```

Install Node.js 22:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Install PM2:

```bash
sudo npm install -g pm2
```

Create the app directory:

```bash
sudo mkdir -p /var/www/blacktonner
sudo chown -R bidan:bidan /var/www/blacktonner
```

Clone the project:

```bash
cd /var/www/blacktonner
git clone YOUR_REPO_URL .
```

Install dependencies:

```bash
npm ci
```

Create the API environment file:

```bash
nano apps/api/.env
```

Add:

```env
DATABASE_URL="YOUR_DATABASE_URL"
PORT=3001
FRONTEND_URL=https://shop.makazicloud.com
```

Generate Prisma Client:

```bash
npm run prisma:generate --workspace=apps/api
```

Run database migrations:

```bash
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

Make sure the API start script points to the built Nest file:

```bash
npm pkg set scripts.start="node dist/src/main" --workspace=apps/api
```

Build the API and web app:

```bash
npm run build:api
npm run build
```

Start the apps with PM2:

```bash
pm2 start npm --name blacktoner-api -- run start --workspace=apps/api
pm2 start npm --name blacktoner-web -- run start --workspace=apps/web
```

Save the PM2 process list:

```bash
pm2 save
```

Enable PM2 startup on reboot:

```bash
pm2 startup
```

Copy and run the command printed by `pm2 startup`. It will look similar to:

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u bidan --hp /home/bidan
```

Then save again:

```bash
pm2 save
```

## Nginx Setup

Create the Nginx config:

```bash
sudo nano /etc/nginx/sites-available/blacktoner
```

Paste:

```nginx
server {
    server_name shop.makazicloud.com;

    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the Nginx site:

```bash
sudo ln -s /etc/nginx/sites-available/blacktoner /etc/nginx/sites-enabled/blacktoner
```

Optionally remove the default Nginx site:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Test and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## DNS

Before installing SSL, make sure the domain points to the VPS:

```text
A record: shop.makazicloud.com -> YOUR_SERVER_IP
```

## HTTPS With Certbot

Install the HTTPS certificate:

```bash
sudo certbot --nginx -d shop.makazicloud.com
```

Certbot prompts:

```text
Email: your email, for example bydangitau@gmail.com
Agree to terms: Y
Share email/newsletter: N
```

Test automatic renewal:

```bash
sudo certbot renew --dry-run
```

Restart the apps:

```bash
pm2 restart blacktoner-api --update-env
pm2 restart blacktoner-web --update-env
pm2 save
```

## Checks

Check PM2:

```bash
pm2 list
```

Test the website:

```bash
curl -I https://shop.makazicloud.com
```

Test the API directly:

```bash
curl -I http://127.0.0.1:3001/api/
```

Test the API through HTTPS and Nginx:

```bash
curl -I https://shop.makazicloud.com/api/
```

Test a real API endpoint:

```bash
curl https://shop.makazicloud.com/api/products
```

Expected healthy results:

```text
https://shop.makazicloud.com      -> 200 OK
https://shop.makazicloud.com/api/ -> 404 from Nest is okay if there is no root API route
```

## Future Deploys From The VPS

```bash
cd /var/www/blacktonner

git fetch origin main
git reset --hard origin/main

npm ci

npm run prisma:generate --workspace=apps/api
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma

npm run build:api
npm run build

pm2 restart blacktoner-api --update-env
pm2 restart blacktoner-web --update-env
pm2 save
```

## Important Repo Fix

Keep this API start script in `apps/api/package.json`:

```json
"start": "node dist/src/main"
```

Nest builds the API entrypoint to `apps/api/dist/src/main.js`. If the start script is `node dist/main`, PM2 will crash with:

```text
Cannot find module '/var/www/blacktonner/apps/api/dist/main'
```

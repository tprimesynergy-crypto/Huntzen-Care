# Fix: NestJS 404 on https://app.huntzen.space/

You see `{"message":"Cannot GET /","error":"Not Found","statusCode":404}` because **all traffic** (including `/`) is being sent to the **NestJS API** instead of the **frontend**. The frontend (React app in `dist/`) must be served by Nginx for `/`; only `/api/` should go to the backend.

## Root causes

1. **SSL was on the default site** – Certbot configured the **default** Nginx server. You then removed it, so the **huntzen** config has **no HTTPS** (only `listen 80`). Something else is handling 443 and proxying everything to the API.
2. **`server_name` typo** – Config had `app.huntzen.space.com` instead of `app.huntzen.space`.
3. **Huntzen config doesn’t handle 443** – So it never serves the frontend over HTTPS.

## Fix (run on the server)

### 1. Confirm where the frontend build lives

```bash
ls -la /var/www/huntzen/Huntzen-Care/dist/
# Expect: index.html, assets/
```

If your `dist` is elsewhere (e.g. `/var/www/huntzen/dist`), note it for step 3.

### 2. Check SSL files exist

```bash
sudo ls -la /etc/letsencrypt/live/app.huntzen.space/
# Expect: fullchain.pem, privkey.pem
```

### 3. Replace the huntzen Nginx config

```bash
sudo nano /etc/nginx/sites-available/huntzen
```

Delete all contents and paste the config from **`deploy/nginx-app.huntzen.space.conf`** in this repo.

- If `dist` is **not** at `/var/www/huntzen/Huntzen-Care/dist`, change the `root` line to your actual path.
- If **`/etc/letsencrypt/options-ssl-nginx.conf`** or **`/etc/letsencrypt/ssl-dhparams.pem`** don’t exist, remove these two lines from the `server { listen 443 ssl; ... }` block:
  ```nginx
  include /etc/letsencrypt/options-ssl-nginx.conf;
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
  ```

Save and exit.

### 4. Ensure only huntzen is enabled (no duplicate 443 config)

```bash
ls -la /etc/nginx/sites-enabled/
# You want: huntzen (and no “default” or other app block that proxies / to Node)
```

If you see `default` or another site that might handle `app.huntzen.space` or act as default for 443, disable it:

```bash
sudo rm /etc/nginx/sites-enabled/default   # if present
# Or: sudo rm /etc/nginx/sites-enabled/other-app
```

### 5. Test and reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Verify

- Open **https://app.huntzen.space/** – you should get the **React app** (login page), not JSON.
- **https://app.huntzen.space/api/** – should hit the API (e.g. 401 for `/auth/me` without token, or 404 for unknown routes), not the SPA.

---

## Summary

| What | Before | After |
|------|--------|--------|
| `server_name` | `app.huntzen.space.com` | `app.huntzen.space` |
| HTTPS | Not in huntzen config | `listen 443 ssl` + Certbot certs in huntzen |
| `/` | Proxied to API → NestJS 404 | Served from `dist/` → React app |
| `/api/` | Proxy to backend | Unchanged (still proxy to backend) |

The **huntzen** server block must serve the frontend for **all non‑API routes** and proxy **only** `/api/` to the NestJS app.

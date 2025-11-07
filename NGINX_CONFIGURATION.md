# Nginx Configuration for File Uploads

## Problem
If you're getting a `413 Content Too Large` error when uploading files to `https://dev.yaamijewels.com/api/products/admin`, this is likely because nginx (reverse proxy) is rejecting the request before it reaches your Node.js application.

## Solution

You need to increase the `client_max_body_size` in your nginx configuration.

### Step 1: Locate your nginx configuration file

Common locations:
- `/etc/nginx/nginx.conf` (main config)
- `/etc/nginx/sites-available/your-site` (site-specific config)
- `/etc/nginx/conf.d/default.conf`

### Step 2: Add or update `client_max_body_size`

#### Option A: Global configuration (affects all sites)
Edit `/etc/nginx/nginx.conf`:

```nginx
http {
    # ... other settings ...
    
    # Increase max body size to 500MB (or more if needed)
    client_max_body_size 500M;
    
    # Optional: Increase timeouts for large uploads
    client_body_timeout 300s;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    
    # ... rest of config ...
}
```

#### Option B: Site-specific configuration
Edit your site's nginx config file (e.g., `/etc/nginx/sites-available/yaamijewels`):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name dev.yaamijewels.com;
    
    # Increase max body size for this specific site
    client_max_body_size 500M;
    
    # Increase timeouts for large uploads
    client_body_timeout 300s;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    
    # Proxy settings
    location / {
        proxy_pass http://localhost:5000;  # Adjust port if different
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Important: Also set body size in location block
        client_max_body_size 500M;
    }
    
    # ... rest of config ...
}
```

### Step 3: Test and reload nginx

```bash
# Test the configuration for syntax errors
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx

# Or restart nginx
sudo systemctl restart nginx
```

### Step 4: Verify the configuration

Check if the setting is applied:
```bash
sudo nginx -T | grep client_max_body_size
```

## Recommended Settings

For the Yami Jewels backend with product uploads:
- **client_max_body_size**: `500M` (allows up to 500MB per request)
- **client_body_timeout**: `300s` (5 minutes for upload)
- **proxy_read_timeout**: `300s` (5 minutes for processing)
- **proxy_connect_timeout**: `300s`
- **proxy_send_timeout**: `300s`

## Troubleshooting

1. **Still getting 413 errors?**
   - Make sure you reloaded nginx after making changes
   - Check if there are multiple nginx config files overriding your settings
   - Verify the setting is in the correct location (http block or server block)

2. **Check nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Check if nginx is actually being used:**
   - Verify your domain points to nginx, not directly to Node.js
   - Check if there's a load balancer in front of nginx

4. **Multiple reverse proxies?**
   - If you have a load balancer (like AWS ALB, Cloudflare, etc.) in front of nginx, you may need to configure limits there as well

## Alternative: Direct Node.js Access

If you want to bypass nginx for testing, you can access your Node.js server directly (if it's exposed):
- Make sure your Node.js server is listening on the correct port
- Access it directly: `http://your-server-ip:5000/api/products/admin`

However, for production, always use nginx as a reverse proxy for better security and performance.


# Development Environment

This folder contains all necessary configurations to run the Infertility System on a local virtual machine during the development phase.

### Includes:

- **NGINX reverse proxy** with SSL
- **Docker Compose** for MySQL, backend, and proxy
- Fallback static pages for frontend maintenance or under construction

This setup helps replicate a near-production environment for internal testing and debugging.

---

## Folder Structure

```
development/
├── nginx/
│   ├── html/
│   │   └── coming-soon.html       # Placeholder UI when frontend isn't deployed
│   ├── ssl/
│   │   ├── [your-origin-cert].pem         # SSL Certificate (replace with actual)
│   │   └── [your-origin-private-key].pem  # SSL Private Key (replace with actual)
│   └── nginx.config.example       # NGINX reverse proxy config
├── docker-compose.yml.example     # Compose file for backend, DB, nginx
```

---

## NGINX Proxy

The `nginx/nginx.config.example` file defines:

- SSL termination for domain `[your-main]`
- Reverse proxy routing to backend at `/infertility-system/`
- Static fallback for `/projects/infertility-system` and `/` to `coming-soon.html`

To use:

```bash
cp development/nginx/nginx.config.example development/nginx/[your-package].conf
# Replace [your-main] and other placeholders in the file.
```

---

## Docker Compose Setup

Use the provided `docker-compose.yml.example` to spin up all services for local testing.

### Steps

```bash
cp development/docker-compose.yml.example development/docker-compose.yml
docker compose -f development/docker-compose.yml up -d
```

### Services Included

- `mysql`: MySQL 8 with persistent volume
- `infertility-backend`: Spring Boot backend service (you must build or pull this image)
- `nginx`: Serves SSL & reverse proxy

> Replace all `[your-...]` placeholders in the compose file before using.

---

## Tips

- Place real SSL certs in `development/nginx/ssl/`
- You can later uncomment the `frontend` section when ready to deploy it into this setup
- For production, use a dedicated NGINX config & certs in your cloud setup (e.g. AWS ALB, Cloudflare, etc.)

---

## Example Commands

```bash
# Build your backend image if not using registry
docker build -t your-name/infertility-system-api:0.0.8 .

# Spin up services
docker compose -f development/docker-compose.yml up -d

# View logs
docker compose logs -f --tail=100
```

---

**Author:** Minh Kha  
**Environment:** Local VM for Development Purposes

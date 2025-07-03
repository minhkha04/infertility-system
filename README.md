# Infertility Treatment Management System

A fullstack system designed for infertility treatment clinics to manage patient registration, treatment schedules, payments, and health reminders.  
Built with **Spring Boot**, **ReactJS**, **MySQL**, and deployed with **Docker + Nginx**.

---

## Tech Stack

| Layer     | Tech Details |
|-----------|--------------|
| Backend   | Java 24, Spring Boot, Spring Security, JPA, JWT, OAuth2 |
| Frontend  | ReactJS, TailwindCSS, Vite |
| Database  | MySQL |
| Auth      | Google OAuth2, JWT |
| Payment   | MoMo, VNPAY |
| DevOps    | Docker, Docker Compose, Nginx, VPS (Ubuntu), Cloudflare SSL |
| Mail      | Resend |
| CI/CD     | GitHub + Manual Deployment |

---

## Project Structure

```
infertility-system/
├── backend/     # Spring Boot source code
├── frontend/    # ReactJS client (added via git subtree)
├── development/ # docker-compose, nginx, SSL
```

---

## Features

- Patient Registration for IUI / IVF services
- View treatment schedules
- Automated reminders for medication and testing
- Integration with MoMo / VNPAY payment gateways
- Email Notifications via Resend API
- Google Login via OAuth2
- Deployed with Docker, Nginx, and Cloudflare SSL

---

## Setup Instructions

### 1. Clone the MonoRepo

```bash
git clone https://github.com/minhkha04/infertility-system
cd infertility-system
```

### 2. Configure Environment Variables

All secret keys are defined in:

- `backend/src/main/resources/application.properties` (linked to environment vars)
- Docker secrets defined in `docker-compose.yml`

Use this template file to create your config:

```bash
cp development/docker-compose.example.yml development/docker-compose.yml
```

Update with your credentials:
```yaml
DB_PASSWORD: your-password
JWT_KEY: your-secret
GOOGLE_ID: ...
SPRING_MAIL_USERNAME: ...
```

>  Note: Keep this file secret. Do not commit credentials to Git.

---

### 3. Run System with Docker

Make sure you are in the `development/` folder.

```bash
cd development
docker compose up -d
```

This will spin up:

- MySQL
- Backend API
- Nginx (serves reverse proxy if configured)

>  If you don't use Nginx, you can remove the nginx service and access API at `localhost:8080/infertility-system`.

---

### 4. Access System

| URL                                        | Description        |
|--------------------------------------------|--------------------|
| `http://localhost:8080/infertility-system` | Backend API |
| `http://localhost`                         | Nginx entry point (serves frontend + API) |

---

## Testing API

Use Postman to test endpoints. API has:

- `/api/v1/public/...` for public access
- `/api/v1/admin/...` for admin-only
- `/api/v1/customer/...` for patient operations

> See Swagger: `http://localhost:8080/infertility-system/swagger-ui/index.html`

---

## License

This project is licensed under the MIT License. Feel free to use, modify, or contribute.

---

## Author & Maintainer

Built by **Minh Kha** – Backend Developer & Team Lead
lenguyenminhkha1606@gmail.com

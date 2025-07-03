# Infertility System - Backend

This is the **Backend Service** of the **Infertility System**, a platform for managing patient appointments, treatment cycles, payments, doctors, and more. The system is implemented using **Spring Boot** with a **modular Domain-Driven Design (DDD)** and **MVC architecture**.

---

## Folder Structure

```
backend/
├── Dockerfile
├── pom.xml
├── README.md
└── src/
    └── main/
        ├── java/
        │   └── com/emmkay/infertility_system/
        │       ├── InfertilitySystemApplication.java
        │       └── modules/
        │           ├── admin/
        │           ├── appointment/
        │           ├── authentication/
        │           ├── blog/
        │           ├── dashboard/
        │           ├── doctor/
        │           ├── email/
        │           ├── feedback/
        │           ├── manager/
        │           ├── payment/
        │           ├── reminder/
        │           ├── schedule/
        │           ├── shared/
        │           ├── treatment/
        │           └── user/
        └── resources/
            ├── application.properties
            └── static/
```

---

## Architecture Overview

This backend is structured with a hybrid **DDD + MVC** approach for better modularization, testability, and separation of concerns.

### Module Design (each domain module contains):
- `controller/`: REST API endpoints
- `service/`: Business logic and use case orchestration
- `repository/`: JPA repositories (data access)
- `entity/`: JPA entity classes (database models)
- `dto/request`, `dto/response`: DTOs for input/output
- `mapper/`: Uses **MapStruct** to convert between entities and DTOs
- `projection/`: JPA interface-based projections
- `enums/`: Constants for domain state & options
- `strategy/`: Strategy pattern implementations (for extensible logic)
- `helper/` or `utils/`: Utility methods and classes

Example modules:
- `appointment`: Manages appointments, rescheduling, availability
- `payment`: Integrates payment providers, handles invoices
- `authentication`: Login, JWT, OAuth2 strategies
- `doctor`, `feedback`, `user`, `blog`, `email`, etc.

Shared logic (e.g. exception handling, common enums, security config) is centralized in the `shared/` module.

---

## Build & Run

### Prerequisites
- Java 24
- Maven 3.9.9
- Docker (optional)

### Build the project

```bash
./mvnw clean install
```

### Run locally

```bash
./mvnw spring-boot:run
```

Application will start at:  
`http://localhost:8080/infertility-system`

---

## Docker Support

### Build Docker Image

```bash
docker build -t infertility-backend .
```

### Run container

```bash
docker run -p 8080:8080 infertility-backend
```

---

## Environment Variables

Environment variables should be configured using either `.env` files or system variables. Example:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASS}
jwt.signerKey=${JWT_SECRET}
cloudinary.apiKey=${CLOUDINARY_KEY}
...
```

Create a `.env.example` file for onboarding purposes.

---

## API Endpoints (sample)

- `POST /api/v1/auth/login` — User login
- `POST /api/v1/appointments` — Book appointment
- `POST /api/v1/payments/confirm` — Payment webhook
- `GET /api/v1/doctors/{id}/availability` — Doctor schedule
- `GET /api/v1/feedback` — Feedback listing

> Full API docs: coming soon with Swagger / Postman collection

---

## Best Practices Followed

- SOLID principles in service design
- DTO + Mapper pattern
- Exception handling with custom `AppException`
- Modular folder design per domain
- Centralized configuration, security, and helper layers
- Stateless authentication using JWT

---

## References

- Spring Boot
- Spring Security
- Spring Data JPA
- MapStruct
- Docker

---

## Contribution Guide

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## Contact

- Developer: Minh Kha  
- Email: [lenguyenminhkha1606@gmail.com](mailto:lenguyenminhkha1606@gmail.com)

---

# SocialOrbit Authentication System

---

## Overview

SocialOrbit uses a production-style hybrid authentication architecture built with:

* NestJS
* JWT Authentication
* Passport Strategies
* Redis Session Caching
* PostgreSQL Persistence
* Refresh Token Rotation
* Stateful Session Validation

The system combines the scalability of stateless JWT authentication with the security of stateful session management.

---

# Features

* JWT Access Token Authentication
* JWT Refresh Token Authentication
* Passport JWT Strategies
* Global Route Protection
* Redis-backed Session Validation
* PostgreSQL Session Persistence
* Refresh Token Rotation
* Replay Attack Protection
* Secure Refresh Token Hashing
* Instant Logout Support
* Multi-device Session Architecture
* Public Route Decorators
* Current User Injection Decorators
* Protected API Pipelines
* Scalable Hybrid Auth Architecture

---

# Tech Stack

| Layer             | Technology     |
| ----------------- | -------------- |
| Backend Framework | NestJS         |
| Database          | PostgreSQL     |
| ORM               | Prisma         |
| Cache Layer       | Redis          |
| Authentication    | JWT + Passport |
| Password Hashing  | Argon2         |
| Token Validation  | Passport JWT   |
| Language          | TypeScript     |

---

# Authentication Architecture

```text
Client
   ↓
NestJS API
   ↓
Global JWT Guard
   ↓
Passport Strategy
   ↓
Redis Session Validation
   ↓
PostgreSQL Session Store
   ↓
Protected APIs
```

---

# Authentication Flow

## 1. User Registration

```text
User submits email/password
        ↓
Validate DTO
        ↓
Hash password with Argon2
        ↓
Store user in PostgreSQL
        ↓
Generate email verification token
        ↓
Send verification email
```

---

## 2. Login Flow

```text
Find user
      ↓
Verify password
      ↓
Create sessionId
      ↓
Generate access token
      ↓
Generate refresh token
      ↓
Hash refresh token
      ↓
Store session in PostgreSQL
      ↓
Cache session in Redis
      ↓
Return tokens
```

---

## 3. Protected Route Flow

```text
Client sends access token
        ↓
Global JWT Guard executes
        ↓
Passport JWT strategy validates token
        ↓
Session validated via Redis/PostgreSQL
        ↓
request.user injected
        ↓
Controller executes
```

---

## 4. Refresh Token Rotation Flow

```text
Client sends refresh token
        ↓
Refresh strategy validates token
        ↓
Verify refresh token hash
        ↓
Generate new access token
Generate new refresh token
        ↓
Hash new refresh token
        ↓
Update session hash
        ↓
Old refresh token invalidated
```

---

## 5. Logout Flow

```text
Get sessionId from JWT
        ↓
Mark session revoked
        ↓
Delete Redis cache
        ↓
Future requests denied
```

---

# Token Strategy

## Access Token

| Property           | Value                     |
| ------------------ | ------------------------- |
| Purpose            | Authenticate API requests |
| Lifetime           | 15 Minutes                |
| Stateless          | Yes                       |
| Stored in Database | No                        |

### Example Payload

```json
{
  "sub": 7,
  "email": "user@example.com",
  "sessionId": "session-uuid"
}
```

---

## Refresh Token

| Property         | Value                      |
| ---------------- | -------------------------- |
| Purpose          | Generate new access tokens |
| Lifetime         | 7 Days                     |
| Stateful         | Yes                        |
| Stored Hashed    | Yes                        |
| Rotation Enabled | Yes                        |

---

# Security Features

| Feature                  | Status  |
| ------------------------ | ------- |
| Password Hashing         | Enabled |
| JWT Signing              | Enabled |
| Refresh Token Hashing    | Enabled |
| Session Revocation       | Enabled |
| Replay Attack Protection | Enabled |
| Redis Session Validation | Enabled |
| Refresh Token Rotation   | Enabled |
| Protected Routes         | Enabled |
| Global Auth Guard        | Enabled |
| Instant Logout           | Enabled |

---

# Project Structure

```text
src/
 ├── auth/
 │    ├── controllers/
 │    ├── decorators/
 │    ├── dto/
 │    ├── guards/
 │    ├── strategies/
 │    ├── services/
 │    ├── auth.controller.ts
 │    ├── auth.service.ts
 │    └── auth.module.ts
 │
 ├── prisma/
 ├── redis/
 ├── users/
 └── main.ts
```

---

# API Endpoints

## Authentication APIs

| Method | Endpoint             | Description            |
| ------ | -------------------- | ---------------------- |
| POST   | `/auth/register`     | Register new user      |
| POST   | `/auth/login`        | Login user             |
| POST   | `/auth/refresh`      | Rotate tokens          |
| POST   | `/auth/logout`       | Logout session         |
| GET    | `/auth/me`           | Get authenticated user |
| GET    | `/auth/verify-email` | Verify email           |

---

# Environment Variables

```env
DATABASE_URL=
REDIS_HOST=
REDIS_PORT=
JWT_SECRET=
JWT_REFRESH_SECRET=
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
```

---

## Install Dependencies

```bash
npm install
```

---

## Setup Environment Variables

Create a `.env` file:

```env
DATABASE_URL=
REDIS_HOST=
REDIS_PORT=
JWT_SECRET=
JWT_REFRESH_SECRET=
```

---

## Run Database Migrations

```bash
npx prisma migrate dev
```

---

## Start Redis

```bash
docker run -p 6379:6379 redis
```

---

## Start Development Server

```bash
npm run start:dev
```

---

# Scalability Benefits

This architecture supports:

* Horizontal Scaling
* Multiple Backend Instances
* Stateful Session Control
* Redis-based Fast Authentication
* Multi-device Sessions
* Instant Session Revocation
* Secure Token Rotation
* Replay Attack Protection
* Future OAuth Integration

---

# Future Improvements

* OAuth Authentication
* Device Tracking
* Session Analytics
* Role-based Authorization
* Permission Management
* WebAuthn Support
* MFA Authentication
* Kafka-based Auth Events
* WebSocket Session Synchronization

---

# License

MIT License

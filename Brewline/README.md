# Brewline

## System Design Document
**Project:** Real-Time Stock Chat Application  
**Version:** 1.0  
**Type:** Web Application (Scalable, Secure, Async)

## 1. Overview
Brewline is a real-time stock discussion platform where users can:

- Join stock-based chat rooms such as `RELIANCE` and `TCS`
- View live stock prices
- Communicate with other users instantly
- Set alerts and track market activity

The system is designed to be:

- Scalable
- Secure with JWT-based authentication
- Event-driven through WebSockets
- Optimized with Redis caching and Pub/Sub

## 2. Objectives

- Provide a real-time chat experience
- Deliver near real-time stock price updates
- Ensure secure authentication using JWT
- Maintain high performance with Redis caching
- Enable horizontal scalability

## 3. System Architecture

### High-Level Components

- Frontend: React web app
- Backend: Django with Django Channels
- Database: PostgreSQL
- Cache and Pub/Sub: Redis
- Background Workers: Celery

### Architecture Flow

```text
Client (React)
   |
   v
Django API + Channels
   |
   +----------------+----------------+
   |                |                |
   v                v                v
PostgreSQL        Redis         Celery Workers
```

## 4. Authentication Design (JWT)

### Login Flow

1. User logs in with credentials.
2. Server validates the request and issues:
   - Access token (short-lived)
   - Refresh token (long-lived)
3. Client stores the token securely.
4. All authenticated requests include:

```http
Authorization: Bearer <JWT>
```

### WebSocket Authentication
The token is passed during connection:

```text
ws://app/ws/room?token=<JWT>
```

The backend validates the token before allowing access.

### Security Measures

- Token expiration enforced
- Refresh token rotation
- HTTPS-only communication
- Input validation and sanitization

## 5. Chat System Design

### Message Flow

1. User sends a message.
2. Django Channels receives the message.
3. The message is:
   - Validated
   - Stored in PostgreSQL
   - Published to Redis
4. Redis broadcasts the event to all connected users in the room.

### Key Features

- Real-time message delivery
- Room-based communication
- Message persistence
- Optimistic UI updates

## 6. Stock Data Flow

### Process

1. A background worker fetches stock prices periodically.
2. Data is stored in Redis cache.
3. Updates are published through Redis Pub/Sub.
4. WebSockets push the updates to connected clients.

### Benefits

- Reduced API calls
- Improved performance
- Near real-time updates

## 7. Presence System

### Redis Mechanism
On room join:

```text
SADD room:<stock>:users <user_id>
```

On room leave:

```text
SREM room:<stock>:users <user_id>
```

### Output

- Active user count per room
- Online status indicators

## 8. Rate Limiting

### Strategy
Track per-user message count with Redis:

```text
INCR user:<id>:msg_count
EXPIRE 60 seconds
```

Block or throttle the user if the threshold is exceeded.

### Purpose

- Prevent spam
- Ensure fair usage
- Protect system stability

## 9. Security Considerations

### Core Security

- JWT validation for all protected endpoints
- WebSocket authentication
- Input sanitization to reduce XSS risk
- Redis-backed rate limiting

### Additional Safeguards

- Abuse detection based on message patterns
- Audit logging for user actions
- HTTPS enforcement

## 10. Performance Optimization

### Database

- Add indexes on `room_id` and `created_at`
- Use pagination for message history

### Redis

- Cache frequently accessed data
- Use TTL for temporary values
- Avoid unnecessary persistence for transient data

### WebSockets

- Send minimal payloads
- Avoid redundant broadcasts

## 11. Scalability Strategy

### Phase 1: MVP

- Single Django instance
- Single Redis instance
- Single PostgreSQL database

### Phase 2: Horizontal Scaling

- Introduce a load balancer
- Run multiple Django instances
- Share Redis and PostgreSQL across instances

```text
Load Balancer
   |
   v
Django Instances (xN)
   |
   v
Redis + PostgreSQL
```

### Phase 3: Advanced

- Move toward microservices architecture
- Redis clustering
- Database read replicas
- Dedicated services such as:
  - Chat service
  - Analytics service

## 12. Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Zustand
- Socket.IO Client

### Backend

- Django
- Django Channels
- Celery

### Infrastructure

- PostgreSQL
- Redis

## 13. Redis Options (Free Tier)

### Recommended

- Upstash
- Redis Cloud

### Alternative

- Local Redis via Docker for development

## 14. Future Enhancements

- Sentiment analysis
- AI-based chat summaries
- Trending stock engine
- Advanced alerts
- Reputation system

## 15. Conclusion
This system design provides:

- Real-time communication
- Secure authentication
- Scalable architecture
- Efficient data handling using Redis

It is well-suited for:

- Portfolio projects
- Production-ready systems with scaling upgrades

## Local Frontend Setup

### Requirements

- Node.js
- npm

### Run Locally

```bash
npm install
npm run dev
```

### Available Scripts

- `npm run dev` - start the Vite development server
- `npm run build` - create a production build
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint

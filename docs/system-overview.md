# AETCH System Overview

## Architecture

AETCH is a Next.js App Router application following MVC patterns.

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  Next.js App Router (React Server Components)│
│  TailwindCSS + Glassmorphism Design System   │
├─────────────────────────────────────────────┤
│               API Layer                      │
│  Next.js Route Handlers (src/app/api/)       │
│  Middleware: Auth, Rate Limit, Validation     │
├─────────────────────────────────────────────┤
│             Service Layer                    │
│  Business logic (src/backend/services/)      │
│  Prisma ORM queries                          │
├─────────────────────────────────────────────┤
│              Data Layer                      │
│  PostgreSQL + Prisma ORM                     │
│  Meilisearch (full-text search)              │
│  Upstash Redis (rate limiting)               │
│  S3/R2 (file storage)                        │
└─────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/                    # Next.js pages and API routes
│   ├── api/                # REST API endpoints (45 routes)
│   ├── app/                # Authenticated app pages (/app/*)
│   ├── (onboarding)/       # Onboarding flow pages
│   └── page.tsx            # Marketing landing page
├── backend/
│   ├── middleware/          # Auth, rate limit, role guard, logging
│   └── services/           # Business logic (12 services)
├── components/
│   ├── ui/                 # Reusable glass UI components
│   ├── features/           # Feature-specific components
│   ├── layouts/            # Page layout wrappers
│   └── system/             # Error boundary, system components
├── lib/                    # Core libraries (auth, prisma, upload, etc.)
└── utils/                  # Pure utilities (slugify, pagination, cn)
```

## Main Services

| Service                | Responsibility                              |
| ---------------------- | ------------------------------------------- |
| `tattoo-service`       | CRUD, search, likes, saves, trending        |
| `post-service`         | Social feed, posts, likes, trending         |
| `artist-service`       | Profiles, search, availability, suggestions |
| `shop-service`         | Shop profiles, artist membership, gallery   |
| `booking-service`      | Booking lifecycle, status transitions       |
| `message-service`      | Conversations, messages, unread counts      |
| `notification-service` | Event notifications, mark-read              |
| `user-service`         | Onboarding, roles, profile management       |
| `follow-service`       | Follow/unfollow, follower lists             |
| `comment-service`      | Post comments, replies                      |
| `ai-service`           | AI tattoo generation, history               |
| `ar-preview-service`   | AR preview save/retrieve                    |

## Data Flow

### Authentication

```
Browser → NextAuth → Google OAuth / Magic Link → Session Cookie → Auth Guard
```

### API Request Pipeline

```
Request → Rate Limiter → Auth Guard → Zod Validation → Service → Prisma → Response
```

### Image Upload Pipeline

```
Upload → MIME Validation → Size Check → Sharp Processing → S3/R2 Storage
         ↓
         Full (1920px) + Thumbnail (300px) + Blur Placeholder (16px)
```

### Notification Flow

```
User Action → API Route → Service (main logic) → Notification Service (async, non-blocking)
```

## Authentication

- NextAuth v5 with database session strategy
- Providers: Google OAuth, Email Magic Link
- Multi-role system: USER, ARTIST, SHOP_OWNER, ADMIN
- Role guards on protected endpoints
- Proxy middleware for route protection and onboarding enforcement

## Key Design Decisions

**Multi-role array**: Users have `roles: UserRole[]` instead of a single role, allowing artists who are also shop owners.

**Route separation**: Marketing pages at `/`, app pages at `/app/*`. Onboarding enforced only on `/app` routes.

**Feature flags**: AI, AR, messaging, and booking features gated by environment variables.

**Image processing**: All uploads processed through Sharp for consistent quality and format (WebP output).

**Rate limiting tiers**: Different limits for auth (10/min), AI (10/hr), uploads (20/min), messaging (20/min), general API (60/min).

## Environment Variables

See `.env.example` for all required variables. Key groups:

- `DATABASE_URL` — PostgreSQL connection
- `NEXTAUTH_*` — Auth configuration
- `GOOGLE_*` — OAuth credentials
- `AWS_*` or `R2_*` — File storage
- `MEILISEARCH_*` — Search engine
- `UPSTASH_*` — Redis rate limiting
- `OPENAI_API_KEY` — AI generation
- `FEATURE_*` — Feature flags

## Database

PostgreSQL with 23 tables and 7 enums. See `docs/database-schema.md` for full schema documentation.

Key relationships:

- User → Artist (1:1 optional)
- Artist → Tattoos (1:many)
- Artist → Shop (many:1 optional)
- User → Posts, Comments, Reviews, Bookings, Likes, Followers
- Conversation → Participants + Messages

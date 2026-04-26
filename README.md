## aetch

alright, so a freelance client recently asked me, "what if someone could see a tattoo on their body before actually getting it done?"
that one question turned into this. aetch is a tattoo platform: discovery, artist portfolios, bookings, social, ai generation, ar preview, all in one place. it started as a quick idea and kept growing because the problem space kept growing.

---

## what it does

three types of users, three different experiences:

- **users** browse tattoos, generate ideas with ai, preview them on their own body using ar, and book artists directly.
- **artists** build portfolios, manage their availability, and get discovered through the platform's recommendation and social layers.
- **shops** group multiple artists under one profile, aggregate portfolios, and handle bookings as a studio.

the platform stitches together ai generation, ar preview, social feeds, booking workflows, messaging, and analytics into a single system. none of these are bolted on: they share data and context.

---

## features worth mentioning

- **ai tattoo generator** — describe what you want in plain text. pick a style, placement, color preference, complexity. the system generates designs you can save, revisit, or send straight to ar preview. rate limited and validated, not a free-for-all.

- **ar preview** — the original spark for the project. upload a photo, overlay a tattoo, drag/scale/rotate it, adjust opacity. uses canvas blending so it actually looks placed on skin. previews are saved to history.

- **discovery** — search by style, placement, tags. filter, sort, scroll infinitely. there's a trending algorithm based on engagement and a recommendation layer that connects users to artists based on behavior.

- **artist profiles** — portfolio, bio, styles, location, availability. users can follow and book directly. not a landing page — a working profile tied into the rest of the system.

- **shops** — real-world studio structures represented digitally. artist lists, aggregated portfolios, booking entry points.

- **bookings** — request slots with artists or shops. availability checks, time slots, state tracking (pending, confirmed, rejected, completed, cancelled). handles double-booking prevention.

- **social feed** — posts, likes, comments, follows. turns the platform into something people come back to, not just use once.

- **messaging** — real-time conversations between users and artists. message history, unread indicators, access control.

- **notifications** — likes, comments, follows, bookings, messages. dropdown ui with read tracking.

- **image pipeline** — every upload gets processed server-side into full res, preview, thumbnail, and blur placeholder. format optimized.

- **analytics** — artists see views, likes, saves, booking activity. basic but useful feedback loop.

- **admin/moderation** — content removal, user management, report handling.

---

## tech

- next.js (app router) + react + tailwind on the frontend
- next.js api routes + prisma + postgresql on the backend
- ai integration for generation features
- sharp for image processing
- zod for validation
- rate limiting on sensitive endpoints

structured around modular services and reusable utilities. api layer, service layer, ui components; kept separate.

---

## architecture bits

roles are flexible. a user can be a regular user, an artist, a shop owner, or an admin; and can hold multiple roles at once.

data goes through prisma with proper indexing and relations. api responses follow a consistent structure throughout.

---

## security

- all inputs validated
- no raw html rendering
- file uploads restricted by type and size
- rate limiting on sensitive routes

not claiming it's bulletproof, but it's not an afterthought either. will keep improving this.

---

## performance

images are optimized, queries are indexed, n+1s are avoided, heavy ops run server-side, media is lazy loaded. the basics, done properly.

---

## current state

feature complete for what it set out to do. the recent work focused on stability, consistency, and making sure things actually work end-to-end rather than just existing as isolated features.

---

## why

people hesitate before getting tattoos because they can't visualize the result. artists struggle to get discovered outside of instagram. shops don't have great digital tooling.

aetch tries to close those gaps. it's a personal project, but it's built like it isn't.

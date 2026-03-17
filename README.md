## aetch

this is a personal project that started from a very real conversation,

a client once reached out with a simple but powerful idea
“what if someone could see a tattoo on their own body before getting it done”

that question ideated aetch

what began as a quick concept slowly turned into a full platform that combines design, discovery, ai, ar, and real artist workflows into one place

it is not just limited to be a gallery or a tool but rather an attempt to build a complete ecosystem around tattoos and/or art.

---

## what this actually is

aetch is a full stack platform where

-  users can explore tattoos, generate ideas using ai, preview them on their own body, and book artists.
- artists can showcase their work, manage bookings, and grow their presence.
- shops can operate as hubs with multiple artists and manage incoming work.

it blends

- ai generation
- ar preview
- social features
- marketplace logic
- booking workflows
- messaging
- analytics

into one system.

---

## core features

### ai tattoo generator

users can describe an idea in natural language and generate tattoo designs.

it supports:

- style selection
- placement context
- color type
- complexity levels

results are stored and can be reused later.
there is rate limiting, validation, and history tracking built in.

---

### ar tattoo preview

this is the original idea that sparked the project:
users upload a photo of their body and overlay tattoos on top of it.

they can:

- drag
- scale
- rotate
- adjust opacity

the preview blends using canvas techniques and can be exported or saved.
history is stored so users can revisit past previews.

---

### tattoo discovery

the gallery is not just a grid,
it includes:

- search by style, placement, tags
- filters and sorting
- trending algorithm based on engagement
- infinite scroll

there is also a recommendation system for artists based on user behavior.

---

### artist profiles

artists have full profiles with:

- portfolio
- bio
- styles
- location
- availability

users can follow artists and book them directly.

---

### shop system

shops can group multiple artists.
each shop has:

- a profile
- artist list
- portfolio aggregation
- booking entry point

this allows real world studio structures to exist in the platform.

---

### booking system

users can request bookings with artists or shops.
the system supports:

- availability
- time slots
- booking states
- timeline tracking

states include:

- pending
- confirmed
- rejected
- completed
- cancelled

double booking and invalid scheduling are prevented.

---

### social layer

there is a built in social feed.
users can:

- create posts
- like
- comment
- follow

this turns the platform into a discovery engine rather than just limited to utility.

---

### messaging

real time style messaging between users and artists.
supports:

- conversations
- message history
- unread indicators

with proper validation and access control.

---

### notifications

users receive notifications for:

- likes
- comments
- follows
- bookings
- messages

there is a dropdown ui and read tracking.

---

### admin controls

basic moderation tools exist.
admins can:

- remove content
- manage users
- handle reports

a report system is also included for users.

---

### image pipeline

images are processed server side.

every upload generates:

- full resolution
- preview
- thumbnail
- blur placeholder

formats are optimized for performance.

---

### analytics

artists can see:

- views
- likes
- saves
- booking activity

this gives feedback on performance and reach.

---

## technical overview

this is a modern full stack system.

frontend:
- next.js app router
- react
- tailwind

backend:
- next.js api routes
- prisma
- postgresql

services include:
 
- ai integration
- image processing with sharp
- rate limiting
- validation with zod

everything is structured around modular services and reusable utilities.

---

## architecture notes

the system is split into:
- api layer
- service layer
- ui components

data is handled through prisma with proper indexing and relations.

roles are flexible.

a user can be:
- user
- artist
- shop owner
- admin

and can hold multiple roles at once.

---

## security

security is treated quite seriously and would definitely be improved in future phases/versions.

- all inputs are validated
- no raw html rendering
- file uploads are restricted by type and size
- rate limiting is applied to sensitive endpoints

api responses follow a consistent structure.

---

## performance

- images are optimized
- queries are indexed
- n+1 queries are avoided
- heavy operations run only on server runtime
- lazy loading is used across media

---

## developer experience

scripts exist for:

- resetting dev environment
- checking system health
- generating schema documentation

the database schema is documented automatically.

---

## manual qa

a full checklist exists covering:

- auth
- gallery
- profiles
- bookings
- social features
- messaging
- ai
- ar preview
- security
- performance

this project was meant to be manually validated before any deployment.

---

## current state

the system is feature complete, it includes everything needed for a working product.

this phase focused heavily on:

- stability
- consistency
- real world usability

---

## why this project exists

this was never meant to be just another demo, it started with a very specific problem;
people hesitate before getting tattoos because they cannot visualize the outcome, this platform tries to reduce that gap,
at the same time it helps artists showcase their work and get discovered.

---

## final note

this is still a personal project;
but it is built with the intention of being real, usable, and extensible,
if you explore it, you will notice it is not just about features, it is about connecting ideas, tools, and people in one place.
thankyou.

---
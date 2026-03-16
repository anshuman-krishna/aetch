# Database Setup

## Prerequisites

- PostgreSQL 15+ installed
- Node.js 18+

## Install PostgreSQL

### macOS (Homebrew)

```bash
brew install postgresql@15
brew services start postgresql@15
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows

Download from https://www.postgresql.org/download/windows/

## Create the Database

```bash
# connect to postgres
psql -U postgres

# create database and user
CREATE DATABASE aetch;
CREATE USER aetch_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE aetch TO aetch_user;
\q
```

## Configure Environment

Copy `.env.example` to `.env` and set your database URL:

```
DATABASE_URL="postgresql://aetch_user:your_password@localhost:5432/aetch?schema=public"
```

## Run Migrations

```bash
# generate prisma client
npm run db:generate

# run migrations
npm run db:migrate

# seed database (if available)
npm run db:seed
```

## Prisma Studio

Launch the visual database editor:

```bash
npm run db:studio
```

Opens at http://localhost:5555

## Reset Database

To reset and re-run all migrations:

```bash
npx prisma migrate reset
```

## Troubleshooting

**Connection refused**: Ensure PostgreSQL is running.

```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql
```

**Permission denied**: Check your DATABASE_URL credentials match the user you created.

**Port conflict**: Default PostgreSQL port is 5432. If another instance is running, update the port in your DATABASE_URL.

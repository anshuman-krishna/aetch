#!/bin/bash
# developer diagnostics script

PASS="\033[32m✓\033[0m"
FAIL="\033[31m✗\033[0m"
WARN="\033[33m!\033[0m"

echo "=== AETCH Developer Diagnostics ==="
echo ""

# check node
if command -v node &>/dev/null; then
  echo -e "$PASS Node.js $(node -v)"
else
  echo -e "$FAIL Node.js not found"
fi

# check npm
if command -v npm &>/dev/null; then
  echo -e "$PASS npm $(npm -v)"
else
  echo -e "$FAIL npm not found"
fi

# check .env
if [ -f .env ]; then
  echo -e "$PASS .env file exists"
else
  echo -e "$FAIL .env file missing (copy from .env.example)"
fi

# check DATABASE_URL
if [ -f .env ] && grep -q "DATABASE_URL" .env; then
  DB_URL=$(grep "DATABASE_URL" .env | head -1 | cut -d= -f2- | tr -d '"')
  if [ -n "$DB_URL" ] && [ "$DB_URL" != "postgresql://user:password@localhost:5432/aetch?schema=public" ]; then
    echo -e "$PASS DATABASE_URL is configured"
  else
    echo -e "$WARN DATABASE_URL appears to be default/placeholder"
  fi
else
  echo -e "$FAIL DATABASE_URL not set in .env"
fi

# check NEXTAUTH_SECRET
if [ -f .env ] && grep -q "NEXTAUTH_SECRET" .env; then
  SECRET=$(grep "NEXTAUTH_SECRET" .env | head -1 | cut -d= -f2- | tr -d '"')
  if [ -n "$SECRET" ] && [ "$SECRET" != "generate-a-secret-with-openssl-rand-base64-32" ]; then
    echo -e "$PASS NEXTAUTH_SECRET is configured"
  else
    echo -e "$WARN NEXTAUTH_SECRET appears to be default"
  fi
else
  echo -e "$FAIL NEXTAUTH_SECRET not set"
fi

# check NEXTAUTH_URL
if [ -f .env ] && grep -q "NEXTAUTH_URL" .env; then
  echo -e "$PASS NEXTAUTH_URL is set"
else
  echo -e "$WARN NEXTAUTH_URL not set (defaults to localhost:3000)"
fi

# check google oauth
if [ -f .env ] && grep -q "GOOGLE_CLIENT_ID" .env; then
  GID=$(grep "GOOGLE_CLIENT_ID" .env | head -1 | cut -d= -f2- | tr -d '"')
  if [ -n "$GID" ]; then
    echo -e "$PASS Google OAuth configured"
  else
    echo -e "$WARN Google OAuth credentials empty"
  fi
else
  echo -e "$WARN Google OAuth not configured"
fi

echo ""

# check prisma client
if [ -d node_modules/.prisma/client ]; then
  echo -e "$PASS Prisma client generated"
else
  echo -e "$FAIL Prisma client not generated (run npm run db:generate)"
fi

# check database connection
if command -v npx &>/dev/null && [ -f .env ]; then
  DB_URL=$(grep "DATABASE_URL" .env | head -1 | cut -d= -f2- | tr -d '"')
  if [ -n "$DB_URL" ]; then
    if pg_isready -d "$DB_URL" &>/dev/null 2>&1; then
      echo -e "$PASS Database is reachable"
    else
      echo -e "$WARN Cannot verify database connection"
    fi
  fi
fi

echo ""

# check feature flags
echo "Feature Flags:"
if [ -f .env ]; then
  for flag in FF_AI_GENERATION FF_AR_PREVIEW FF_PRICE_ESTIMATOR FF_MESSAGING FF_SOCIAL_FEED FF_BOOKING; do
    val=$(grep "^$flag" .env 2>/dev/null | cut -d= -f2 | tr -d '"')
    if [ -n "$val" ]; then
      echo "  $flag = $val"
    else
      echo "  $flag = (not set)"
    fi
  done
else
  echo "  (no .env file)"
fi

echo ""

# check port 3000
PID=$(lsof -ti :3000 2>/dev/null)
if [ -n "$PID" ]; then
  echo -e "$WARN Port 3000 is in use (PID: $PID)"
else
  echo -e "$PASS Port 3000 is available"
fi

echo ""
echo "=== Done ==="

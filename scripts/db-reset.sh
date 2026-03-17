#!/usr/bin/env bash
set -euo pipefail
echo "=== AETCH Database Reset ==="
echo "WARNING: This will reset your database!"
read -p "Continue? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Cancelled."
  exit 0
fi
echo "Resetting database..."
npx prisma migrate reset --force
echo "Database reset complete."

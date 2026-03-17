#!/usr/bin/env bash
set -euo pipefail
echo "=== AETCH Dev Reset ==="
echo "Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
echo "Regenerating Prisma client..."
npx prisma generate
echo "Done! Run 'npm run dev' to start."

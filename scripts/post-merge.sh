#!/bin/bash
set -e

npm install --ignore-scripts --no-audit --no-fund 2>/dev/null || true

if [ -n "$DATABASE_URL" ]; then
  npm run db:schema 2>/dev/null || true
fi

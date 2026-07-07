#!/bin/sh
set -e

cd /app/backend
npx prisma db push --accept-data-loss
exec node dist/main

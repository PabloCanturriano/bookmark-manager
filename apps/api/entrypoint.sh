#!/bin/sh
set -e

echo "Running database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Seeding database..."
node prisma/dist/seed.js

echo "Starting API..."
exec node dist/main

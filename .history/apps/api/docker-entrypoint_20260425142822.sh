#!/usr/bin/env sh
set -eu

cd /app/apps/api

echo "Waiting for Postgres..."
until node -e "const { Client } = require('pg'); const c=new Client({connectionString: process.env.CONTROL_DATABASE_URL}); c.connect().then(()=>c.end()).then(()=>process.exit(0)).catch(()=>process.exit(1));"; do
  sleep 1
done

echo "Applying Control DB schema..."
./node_modules/.bin/prisma db push --schema prisma/control.prisma

echo "Starting API..."
exec node dist/main.js

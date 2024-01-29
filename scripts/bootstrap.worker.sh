#!/bin/bash
set -euo pipefail

# wait for redis ready
REDIS_HOST=redis
REDIS_PORT=6379
until nc -z $REDIS_HOST $REDIS_PORT; do
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] - waiting for $REDIS_HOST:$REDIS_PORT..."
  sleep 1
done

echo "[$(date '+%Y-%m-%d %H:%M:%S')] - $REDIS_HOST:$REDIS_PORT is available."



# wait for weaviate ready
WEAVIATE_HOST=redis
WEAVIATE_PORT=6379
until nc -z $WEAVIATE_HOST $WEAVIATE_PORT; do
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] - waiting for $WEAVIATE_HOST:$WEAVIATE_PORT..."
  sleep 1
done

echo "[$(date '+%Y-%m-%d %H:%M:%S')] - $WEAVIATE_HOST:$WEAVIATE_PORT is available."

echo "[$(date '+%Y-%m-%d %H:%M:%S')] - start worker"
# node server.js
npx tsx -r dotenv/config jobs/server.ts
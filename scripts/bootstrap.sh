#!/bin/sh
set -euo pipefail

# wait for mysql ready
MYSQL_HOST=mysql
MYSQL_PORT=3306
until nc -z $MYSQL_HOST $MYSQL_PORT; do
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] - waiting for $MYSQL_HOST:$MYSQL_PORT..."
  sleep 1
done

echo "[$(date '+%Y-%m-%d %H:%M:%S')] - $MYSQL_HOST:$MYSQL_PORT is available."

echo "[$(date '+%Y-%m-%d %H:%M:%S')] - start next.js"
node server.js
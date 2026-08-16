#!/usr/bin/env bash
# Poll a health endpoint until it returns 200, or fail after ATTEMPTS tries.
# Usage: wait-for-health.sh <url>
#   ATTEMPTS  number of tries       (default 20)
#   INTERVAL  seconds between tries (default 15)
set -euo pipefail

url="${1:?usage: wait-for-health.sh <url>}"
attempts="${ATTEMPTS:-20}"
interval="${INTERVAL:-15}"

for i in $(seq 1 "$attempts"); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url") || code="000"
  if [ "$code" = "200" ]; then
    echo "health ok after $i attempt(s)"
    exit 0
  fi
  echo "attempt $i/$attempts -> $code"
  sleep "$interval"
done

echo "health check failed: $url did not return 200 after $attempts attempts"
exit 1

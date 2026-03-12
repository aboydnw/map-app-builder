#!/bin/bash
# Verify that STAC API, TiTiler, and fileserver are running.

PASS=0
FAIL=0

check_service() {
  local name="$1" url="$2" expect="$3"
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [[ "$status" =~ $expect ]]; then
    echo "[OK]   $name ($url) — HTTP $status"
    ((PASS++))
  else
    echo "[FAIL] $name ($url) — HTTP $status (expected $expect)"
    ((FAIL++))
  fi
}

check_service "STAC API"    "http://localhost:8081"      "200"
check_service "TiTiler"     "http://localhost:8000/docs"  "200"
check_service "File server" "http://localhost:8080"       "200|403"

echo ""
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1

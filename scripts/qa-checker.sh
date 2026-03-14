#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob

WORKSPACE=$(pwd)
CONTENT_DIR="$WORKSPACE/content/articles"
TMP_DIR="$WORKSPACE/tmp"
VECTOR_DB="$WORKSPACE/vector-store/conversations.db"
mkdir -p "$TMP_DIR" "$(dirname "$VECTOR_DB")"

TARGET_URL="http://localhost:3000"
FAILURES=()
ARTICLE_TITLE="(unknown)"
QA_LOG="$WORKSPACE/qa-failures.log"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

SERVER_LOG="$TMP_DIR/qa-start.log"
BUILD_LOG="$TMP_DIR/qa-build.log"

if ! npm run build >"$BUILD_LOG" 2>&1; then
  FAILURES+=("Technical")
fi

npm run start >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!
sleep 5

ARTICLES=($CONTENT_DIR/*.md $CONTENT_DIR/*.mdx)
if [[ ${#ARTICLES[@]} -eq 0 ]]; then
  FAILURES+=("Structure")
else
  LATEST_ARTICLE=$(ls -t "${ARTICLES[@]}" 2>/dev/null | head -n1 || true)
  if [[ -z "$LATEST_ARTICLE" ]]; then
    FAILURES+=("Structure")
  else
    ARTICLE_TITLE=$(grep -m1 '^title:' "$LATEST_ARTICLE" | cut -d: -f2- | tr -d '" ')
    if [[ -z "$ARTICLE_TITLE" ]]; then
      ARTICLE_TITLE=$(basename "$LATEST_ARTICLE")
    fi
    if ! grep -q '^## ' "$LATEST_ARTICLE"; then
      FAILURES+=("Structure")
    fi
  fi
fi

PAGE_SOURCE=$(curl -sL "$TARGET_URL")
if ! echo "$PAGE_SOURCE" | grep -q 'application/ld+json'; then
  FAILURES+=("SEO")
fi
if ! echo "$PAGE_SOURCE" | grep -q '<meta name="description"'; then
  FAILURES+=("SEO")
fi
if ! curl -o /dev/null -sSf "$TARGET_URL"; then
  FAILURES+=("Technical")
fi

if [[ ${#FAILURES[@]} -gt 0 ]]; then
  CATEGORY=${FAILURES[0]}
  ERROR_SNIPPET=$(tail -n 20 "$SERVER_LOG" || true)
  TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  cat <<EOF >> "$QA_LOG"
[$TIMESTAMP] QA failure detected for ${ARTICLE_TITLE}
URL Tested: ${TARGET_URL}
Error Category: ${CATEGORY}
Console Excerpt:
${ERROR_SNIPPET}
---
EOF
  FAILURE_PAYLOAD="$TMP_DIR/qa-failure-payload.json"
  python3 - "$FAILURE_PAYLOAD" "$ARTICLE_TITLE" "$CATEGORY" "$TARGET_URL" "$ERROR_SNIPPET" <<'PY'
import json, pathlib, sys
failure_path, article_title, category, target_url, console_snippet = sys.argv[1:]
payload = {
  "learning": f"QA pipeline failure recorded for {article_title}.",
  "mistakes": "Build/QA checks failed before publishing the article.",
  "highlights": f"Failure occurred at {category} check when hitting {target_url}.",
  "decisions": "Investigate the logs, fix the underlying issue, and rerun the automation.",
  "extras": f"Console excerpt:\n{console_snippet}",
  "cleanedConversation": f"QA Checker detected failure flags: {category}."
}
pathlib.Path(failure_path).write_text(json.dumps(payload, indent=2))
PY
  python3 scripts/store_conversation_summary.py --payload "$FAILURE_PAYLOAD" --vector-db "$VECTOR_DB" --cleaned-path memory/last-cleaned-conversation.txt
  exit 1
fi

LATEST_ARTICLE_PATH="${ARTICLES[0]}"
if [[ ${#ARTICLES[@]} -gt 0 ]]; then
  LATEST_ARTICLE_PATH=$(ls -t "${ARTICLES[@]}" 2>/dev/null | head -n1 || true)
fi

SUCCESS_PAYLOAD="$TMP_DIR/qa-success-payload.json"
cat <<EOF > "$SUCCESS_PAYLOAD"
{
  "learning": "The content pipeline successfully generated and validated ${ARTICLE_TITLE}.",
  "mistakes": "No mistakes detected during this run.",
  "highlights": "Automated QA passed against ${TARGET_URL}, structure and SEO checks all green.",
  "decisions": "Keep the current automated pipeline schedule and reuse this QA template for future runs.",
  "cleanedConversation": "QA Checker completed without errors."
}
EOF
python3 scripts/store_conversation_summary.py --payload "$SUCCESS_PAYLOAD" --vector-db "$VECTOR_DB" --cleaned-path memory/last-cleaned-conversation.txt

conversation_summary=$(cat <<EOF
QA success summary for ${ARTICLE_TITLE}
Checks: build, structure, SEO schema, meta description, local URL reachability
EOF
)

echo "$conversation_summary"

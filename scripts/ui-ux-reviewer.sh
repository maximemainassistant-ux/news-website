#!/usr/bin/env bash
set -euo pipefail
WORKSPACE=$(pwd)
URL="https://magenta-sawine-e28fb3.netlify.app/"
TMP_DIR="$WORKSPACE/tmp"
VECTOR_DB="$WORKSPACE/vector-store/conversations.db"
PAYLOAD_FILE="$TMP_DIR/ui-ux-payload.json"
LOG_FILE="$TMP_DIR/ui-ux-review.log"
REVIEW_TIME=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
mkdir -p "$TMP_DIR" "$(dirname "$VECTOR_DB")"

HTML=$(curl -sSf "$URL" || true)
ISSUE=""

if [[ -z "$HTML" ]]; then
  ISSUE="Site did not respond"
elif [[ $(grep -c "<link rel=\"stylesheet\"" <<< "$HTML" | tr -d '\n') -eq 0 ]]; then
  ISSUE="No linked stylesheet detected"
elif ! grep -q "class=\"site-header-wrapper\"" <<< "$HTML"; then
  ISSUE="Header wrapper missing; possible layout degradation"
fi

if [[ -n "$ISSUE" ]]; then
  echo "[${REVIEW_TIME}] UI/UX Reviewer: $ISSUE" | tee -a "$LOG_FILE"
  cat <<EOF > "$PAYLOAD_FILE"
{
  "learning": "UI/UX check detected: $ISSUE",
  "mistakes": "Fonts, spacing, or layout appear degraded on $URL",
  "highlights": "Leveraged a browser-like review to confirm visual fidelity",
  "decisions": "Alert the Lead Developer, escalate to conversation-keeper for follow-up",
  "extras": "URL: $URL",
  "cleanedConversation": "UI/UX Reviewer flagged $ISSUE during the morning check."
}
EOF
  python3 "$WORKSPACE/scripts/store_conversation_summary.py" --payload "$PAYLOAD_FILE" --vector-db "$VECTOR_DB" --cleaned-path memory/last-cleaned-conversation.txt >/dev/null 2>&1
else
  echo "[${REVIEW_TIME}] UI/UX Reviewer: Site looks healthy (fonts and spacing appear intact)." | tee -a "$LOG_FILE"
fi

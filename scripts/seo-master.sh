#!/usr/bin/env bash
set -euo pipefail

WORKSPACE=$(pwd)
BRIEFS_DIR="$WORKSPACE/drafts/briefs"
mkdir -p "$BRIEFS_DIR"

HOMEPAGE=$(curl -sL https://magenta-sawine-e28fb3.netlify.app/)
PRIMARY_TOPIC=$(python3 - <<'PY'
import re, sys
text = sys.stdin.read()
match = re.search(r'<h1[^>]*>(?:\s*<a[^>]*>)*([^<]+)', text)
print(match.group(1).strip() if match else '')
PY
<<<"$HOMEPAGE")
PRIMARY_TOPIC=$(echo "$PRIMARY_TOPIC" | tr -d '\r' | xargs)
if [[ -z "$PRIMARY_TOPIC" ]]; then
  PRIMARY_TOPIC="Geo Blog Insight"
fi
KEYWORDS_PRIMARY=$(echo "$PRIMARY_TOPIC" | awk '{print tolower($1)}')
SLUG=$(echo "$PRIMARY_TOPIC" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:]- ' | tr ' ' '-')
SLUG=${SLUG:-geo-blog-insight}
TIMESTAMP=$(date +%Y%m%d%H%M%S)
FILENAME="seo-brief-${SLUG}-${TIMESTAMP}.md"
BRIEF_PATH="$BRIEFS_DIR/$FILENAME"

SECTIONS=$(python3 - <<'PY'
import re, sys
text = sys.stdin.read()
cats = re.findall(r'data-category="([^"]+)"', text)
unique = []
for c in cats:
    if c not in unique:
        unique.append(c)
print(', '.join(unique[:6]))
PY
<<<"$HOMEPAGE")
if [[ -z "$SECTIONS" ]]; then
  SECTIONS="Politics, Finance, Tech, Climate, Well+Being, Business"
fi

cat <<EOF > "$BRIEF_PATH"
# SEO Brief: ${PRIMARY_TOPIC}

**Primary Keyword:** ${KEYWORDS_PRIMARY}
**Secondary Keywords:** geo blog, ${SLUG}, ${PRIMARY_TOPIC,,}
**Proposed H1 Title:** ${PRIMARY_TOPIC}
**Target Audience:** Global readers interested in geopolitics, finance, tech, and climate intersections
**Content Length Target:** 1000-1300 words
**Competitor URLs:** https://www.bbc.com, https://www.theatlantic.com, https://www.washingtonpost.com

## Context
- Source: https://magenta-sawine-e28fb3.netlify.app/
- Observed sections: ${SECTIONS}
- Timestamp: $(date --utc)

## Notes
- Keep tone analytical and future-focused; mention monetization via ads without over-promising.
- Include at least two data-driven insights referencing recent geopolitical events.
EOF

echo "Generated brief: $BRIEF_PATH"

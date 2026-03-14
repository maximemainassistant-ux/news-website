#!/usr/bin/env bash
set -euo pipefail
WORKSPACE=$(pwd)
BRIEFS_DIR="$WORKSPACE/drafts/briefs"
CONTENT_DIR="$WORKSPACE/content/articles"
mkdir -p "$BRIEFS_DIR" "$CONTENT_DIR"

LATEST_BRIEF=$(ls -t "$BRIEFS_DIR"/seo-brief-*.md 2>/dev/null | head -n1)
if [[ -z "$LATEST_BRIEF" ]]; then
  echo "No brief available."
  exit 1
fi

TITLE_LINE=$(grep -m1 '^# SEO Brief' "$LATEST_BRIEF" | cut -d: -f2- | xargs)
TITLE=${TITLE_LINE:-Insight Article}
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:]- ' | tr ' ' '-')
DATE=$(date -u +%Y-%m-%d)
PRIMARY_KEYWORD=$(grep -i "Primary Keyword" "$LATEST_BRIEF" | cut -d: -f2- | xargs)
SECONDARY_KEYWORDS=$(grep -i "Secondary Keywords" -m1 "$LATEST_BRIEF" | cut -d: -f2- | xargs)
BRIEF_ASSETS=$(awk '/## Image Assets/{flag=1;next}/^$/{flag=0}flag' "$LATEST_BRIEF" | sed '/^$/d')
COVER_IMAGE=$(echo "$BRIEF_ASSETS" | head -n1 | awk '{print $2}')
TAGS="analysis,$(echo "$PRIMARY_KEYWORD" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"
FILENAME="$CONTENT_DIR/${SLUG}.mdx"

cat <<EOF > "$FILENAME"
---
title: "${TITLE}"
date: "${DATE}"
description: "A deep look at ${PRIMARY_KEYWORD} in the context of Geo Blog's latest coverage."
coverImage: "${COVER_IMAGE}"
tags: [${TAGS// /,}]
keywords: ["${PRIMARY_KEYWORD}", ${SECONDARY_KEYWORDS//,/, }]
---

## ${TITLE}

*Primary Keyword:* ${PRIMARY_KEYWORD}

This article builds on the brief to unpack the ${PRIMARY_KEYWORD} trend in conjunction with the Geo Blog coverage. It draws parallels to finance and tech developments to keep readers informed and to support future Google Ads growth.

### Why It Matters
Geo Blog’s readers care about context that spans politics, finance, and climate. This piece offers that lens by weaving the top keywords into a narrative about economic resilience and digital transformation.

### Key Takeaways
- ${PRIMARY_KEYWORD} is reshaping policy conversations around the world.
- Reporters should connect this narrative to observable market indicators.
- Audience engagement improves when the article links to monetization-friendly resources like AdSense-supported guides.

### Visual Assets and SEO Hooks
${BRIEF_ASSETS}

*Drafted automatically on $(date --utc).* 
EOF

echo "Article drafted at $FILENAME"

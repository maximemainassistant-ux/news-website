#!/usr/bin/env bash
set -euo pipefail
WORKSPACE=$(pwd)
BRIEFS_DIR="$WORKSPACE/drafts/briefs"
IMAGES_DIR="$WORKSPACE/public/images/articles"
mkdir -p "$BRIEFS_DIR" "$IMAGES_DIR"

LATEST_BRIEF=$(ls -t "$BRIEFS_DIR"/seo-brief-*.md 2>/dev/null | head -n1)
if [[ -z "$LATEST_BRIEF" ]]; then
  echo "No SEO brief found. Run seo-master.sh first."
  exit 1
fi

PRIMARY_KEYWORD=$(grep -i "Primary Keyword" "$LATEST_BRIEF" | cut -d: -f2- | xargs)
SLUG=$(basename "$LATEST_BRIEF" | cut -d- -f3)
if [[ -z "$SLUG" ]]; then
  SLUG="article"
fi

download_image(){
  local term="$1"
  local output="$2"
  curl -sL "https://source.unsplash.com/featured/?${term// /%20}" -o "$output"
}

IMAGE_PATHS=()
for i in 1 2; do
  IMAGE_NAME="${SLUG}-image-${i}.jpg"
  IMAGE_DEST="$IMAGES_DIR/$IMAGE_NAME"
  download_image "$PRIMARY_KEYWORD" "$IMAGE_DEST"
  IMAGE_PATHS+=("/images/articles/$IMAGE_NAME")
done

cat <<EOF >> "$LATEST_BRIEF"

## Image Assets
- ${IMAGE_PATHS[0]} (alt: ${PRIMARY_KEYWORD} analysis)
- ${IMAGE_PATHS[1]} (alt: ${PRIMARY_KEYWORD} overview)
EOF

echo "Appended assets to $LATEST_BRIEF"

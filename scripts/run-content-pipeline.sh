#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob

WORKSPACE=$(pwd)
cd "$WORKSPACE"

BRIEFS_DIR="$WORKSPACE/drafts/briefs"
LATEST_BRIEF=$(ls -t "$BRIEFS_DIR"/seo-brief-*.md 2>/dev/null | head -n1 || true)
if [[ -z "$LATEST_BRIEF" ]]; then
  echo "No SEO brief found; cannot determine topic slug."
  exit 1
fi

TOPIC_TITLE=$(grep -m1 '^# SEO Brief' "$LATEST_BRIEF" | cut -d: -f2- | xargs)
TOPIC_TITLE=${TOPIC_TITLE:-Insight Article}
TOPIC_SLUG=$(echo "$TOPIC_TITLE" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:]- ' | tr ' ' '-')
if [[ -z "$TOPIC_SLUG" ]]; then
  echo "Unable to compute topic slug from brief title."
  exit 1
fi

TIMESTAMP=$(date -u +%Y%m%d%H%M%S)
BRANCH_NAME="content/${TOPIC_SLUG}-${TIMESTAMP}"

echo "Creating feature branch $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"

echo "Running SEO, asset, and writer agents"
"$WORKSPACE/scripts/seo-master.sh"
"$WORKSPACE/scripts/asset-agent.sh"
"$WORKSPACE/scripts/writer-agent.sh"

CONTENT_DIR="$WORKSPACE/content/articles"
ARTICLES=($CONTENT_DIR/*.md $CONTENT_DIR/*.mdx)
if [[ ${#ARTICLES[@]} -eq 0 ]]; then
  echo "No article created, skipping QA/pr steps."
  exit 0
fi

LATEST_ARTICLE=$(ls -t "${ARTICLES[@]}" 2>/dev/null | head -n1 || true)
if [[ -z "$LATEST_ARTICLE" ]]; then
  echo "Failed to detect the latest article after generation."
  exit 1
fi

echo "Running QA checker"
if ! "$WORKSPACE/scripts/qa-checker.sh"; then
  echo "QA failed; issue was created by qa-checker.sh and no PR has been opened."
  exit 1
fi

ARTICLE_TITLE=$(grep -m1 '^title:' "$LATEST_ARTICLE" | cut -d: -f2- | sed -e 's/^ *"//' -e 's/"$//' | xargs)
ARTICLE_TITLE=${ARTICLE_TITLE:-Automated Article}

if [[ "${SKIP_POSTQA:-0}" == "1" ]]; then
  echo "Dry run: QA passed. Skipping commit, push, and PR creation."
  exit 0
fi

COMMIT_MESSAGE="feat: automated article ${TOPIC_SLUG}"
PR_TITLE="New Article: ${ARTICLE_TITLE}"
PR_BODY="Automated content generation and QA verified."

git add "$CONTENT_DIR"
git commit -m "$COMMIT_MESSAGE"

echo "Pushing $BRANCH_NAME to origin"
git push origin "$BRANCH_NAME"

echo "Creating PR"
gh pr create --title "$PR_TITLE" --body "$PR_BODY"

echo "Pipeline complete. You can reference PR from the GH CLI output above."

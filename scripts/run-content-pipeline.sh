#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob

WORKSPACE=$(pwd)
cd "$WORKSPACE"

# Load environment variables for Sanity & Azure
if [[ -f "$WORKSPACE/.env/sanity.env" ]]; then
  source "$WORKSPACE/.env/sanity.env"
fi
if [[ -f "$WORKSPACE/.env/azure.env" ]]; then
  source "$WORKSPACE/.env/azure.env"
fi

BRIEFS_DIR="$WORKSPACE/drafts/briefs"
LATEST_BRIEF=$(ls -t "$BRIEFS_DIR"/seo-brief-*.md 2>/dev/null | head -n1 || true)
if [[ -z "$LATEST_BRIEF" ]]; then
  echo "No SEO brief found—no topic to cover."
  exit 1
fi

TOPIC_TITLE=$(grep -m1 '^# SEO Brief' "$LATEST_BRIEF" | cut -d: -f2- | xargs)
TOPIC_TITLE=${TOPIC_TITLE:-Insight Article}
TOPIC_SLUG=$(echo "$TOPIC_TITLE" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:]- ' | tr ' ' '-')
if [[ -z "$TOPIC_SLUG" ]]; then
  echo "Unable to compute a topic slug from the brief."
  exit 1
fi

TIMESTAMP=$(date -u +%Y%m%d%H%M%S)
BRANCH_NAME="content/${TOPIC_SLUG}-${TIMESTAMP}"
TASK_DEADLINE=$(date -u -d '+15 minutes' '+%Y-%m-%dT%H:%M:%SZ')

orchestrator_log() {
  echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] Orchestrator: $*"
}

orchestrator_log "Assigning tasks to SEO, Asset, and Writer teams with deadline ${TASK_DEADLINE}."
# Ensure on main branch and up to date
orchestrator_log "Checking out main and ensuring up to date"
git checkout main
git pull origin main

orchestrator_log "Scheduling SEO & Asset agents"
"$WORKSPACE/scripts/seo-master.sh"
"$WORKSPACE/scripts/asset-agent.sh"

LATEST_ARTICLE=""
MAX_ATTEMPTS=3
attempt=0
ARTICLES_DIR="$WORKSPACE/content/articles"
DRAFT_APPROVED=false

while [[ $attempt -lt $MAX_ATTEMPTS ]]; do
  attempt=$((attempt + 1))
  orchestrator_log "Lead Journalist attempt #$attempt"
  "$WORKSPACE/scripts/writer-agent.sh"
  ARTICLES=($ARTICLES_DIR/*.md $ARTICLES_DIR/*.mdx)
  LATEST_ARTICLE=$(ls -t "${ARTICLES[@]}" 2>/dev/null | head -n1 || true)

  if [[ -z "$LATEST_ARTICLE" ]]; then
    orchestrator_log "Writer Agent did not produce a file."
    exit 1
  fi

  if match=$(grep -niE 'In conclusion|It is important to note|In the ever-evolving landscape' "$LATEST_ARTICLE"); then
    orchestrator_log "Draft smells AI-generated; requesting a rewrite. Matched: ${match//$'\n'/, }"
    rm -f "$LATEST_ARTICLE"
    continue
  fi

  DRAFT_APPROVED=true
  orchestrator_log "Draft approved by Managing Editor"
  break

done

if [[ "$DRAFT_APPROVED" != "true" ]]; then
  orchestrator_log "Unable to capture an acceptable draft after $MAX_ATTEMPTS attempts."
  exit 1
fi

if [[ -z "$LATEST_ARTICLE" || ! -f "$LATEST_ARTICLE" ]]; then
  orchestrator_log "Latest article missing after approval; aborting."
  exit 1
fi

orchestrator_log "Triggering QA"
if ! "$WORKSPACE/scripts/qa-checker.sh"; then
  orchestrator_log "QA failed; see qa-failures.log for the failure details."
  exit 1
fi

ARTICLE_TITLE=$(grep -m1 '^title:' "$LATEST_ARTICLE" | cut -d: -f2- | sed -e 's/^ *"//' -e 's/"$//' | xargs)
ARTICLE_TITLE=${ARTICLE_TITLE:-Automated Article}

if [[ "${SKIP_POSTQA:-0}" == "1" ]]; then
  orchestrator_log "Dry run mode enabled—skipping commit and PR creation."
  exit 0
fi

COMMIT_MESSAGE="feat: automated article ${TOPIC_SLUG}"
PR_TITLE="New Article: ${ARTICLE_TITLE}"
PR_BODY="Automated content generation and QA verified."

orchestrator_log "Committing article"
git add "$LATEST_ARTICLE"
# Only commit if there are staged changes
if git diff --cached --quiet; then
  orchestrator_log "No new article changes to commit; exiting gracefully."
  exit 0
fi
git commit -m "$COMMIT_MESSAGE"

orchestrator_log "Committing article to main"
git add "$LATEST_ARTICLE"
if git diff --cached --quiet; then
  orchestrator_log "No new article to commit; exiting gracefully."
  exit 0
fi
git commit -m "$COMMIT_MESSAGE"
orchestrator_log "Pushing to main"
git push origin main

orchestrator_log "Pipeline complete. Article committed to main and pushed."

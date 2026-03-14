import argparse
import json
from pathlib import Path
from datetime import datetime
import hashlib

parser = argparse.ArgumentParser()
parser.add_argument("--payload", required=True)
parser.add_argument("--vector-db", required=True)
parser.add_argument("--cleaned-path", required=True)
args = parser.parse_args()

payload_path = Path(args.payload)
payload = json.loads(payload_path.read_text())
now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

learning_file = Path("memory/conversation-learning.md")
mistakes_file = Path("memory/conversation-mistakes.md")
cleaned_path = Path(args.cleaned_path)
vector_db = Path(args.vector_db)

learning_file.parent.mkdir(parents=True, exist_ok=True)
mistakes_file.parent.mkdir(parents=True, exist_ok=True)
vector_db.parent.mkdir(parents=True, exist_ok=True)

with learning_file.open("a") as lf:
    lf.write(f"## {now}\n")
    lf.write(payload.get("learning", ""))
    lf.write("\n\n")

with mistakes_file.open("a") as mf:
    mf.write(f"## {now}\n")
    mf.write(payload.get("mistakes", ""))
    mf.write("\n\n")

cleaned_path.write_text(payload.get("cleanedConversation", ""))

summary_blob = "\n".join([
    payload.get("learning", ""),
    payload.get("highlights", ""),
    payload.get("decisions", ""),
])
hash_digest = hashlib.sha256(summary_blob.encode("utf-8")).hexdigest()
entry = {
    "timestamp": now,
    "learning": payload.get("learning"),
    "highlights": payload.get("highlights"),
    "decisions": payload.get("decisions"),
    "hash": hash_digest,
    "cleanedConversation": payload.get("cleanedConversation"),
}
with vector_db.open("a") as db:
    db.write(json.dumps(entry))
    db.write("\n")

print("Summary stored", now)

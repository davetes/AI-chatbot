import json
import os
import sys
import urllib.request

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
MESSAGE = os.getenv("TELEGRAM_MESSAGE", "Hello from integration script")

if not BOT_TOKEN or not CHAT_ID:
    print("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID", file=sys.stderr)
    sys.exit(1)

url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
body = {"chat_id": CHAT_ID, "text": MESSAGE}

req = urllib.request.Request(
    url,
    data=json.dumps(body).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST",
)

with urllib.request.urlopen(req) as resp:
    print(resp.read().decode("utf-8"))

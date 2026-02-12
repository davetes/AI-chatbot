import json
import os
import sys
import urllib.request

API_VERSION = os.getenv("META_API_VERSION", "v19.0")
PAGE_ACCESS_TOKEN = os.getenv("META_PAGE_ACCESS_TOKEN", "")
RECIPIENT_ID = os.getenv("FB_RECIPIENT_ID", "")
MESSAGE = os.getenv("FB_MESSAGE", "Hello from integration script")

if not PAGE_ACCESS_TOKEN or not RECIPIENT_ID:
    print("Missing META_PAGE_ACCESS_TOKEN or FB_RECIPIENT_ID", file=sys.stderr)
    sys.exit(1)

url = f"https://graph.facebook.com/{API_VERSION}/me/messages?access_token={PAGE_ACCESS_TOKEN}"
body = {
    "recipient": {"id": RECIPIENT_ID},
    "message": {"text": MESSAGE},
}

req = urllib.request.Request(
    url,
    data=json.dumps(body).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST",
)

with urllib.request.urlopen(req) as resp:
    print(resp.read().decode("utf-8"))

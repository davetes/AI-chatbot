import json
import os
import sys
import urllib.request

API_VERSION = os.getenv("META_API_VERSION", "v19.0")
ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN", "")
PHONE_NUMBER_ID = os.getenv("META_PHONE_NUMBER_ID", "")
TO_NUMBER = os.getenv("WA_TO", "")
MESSAGE = os.getenv("WA_MESSAGE", "Hello from integration script")

if not ACCESS_TOKEN or not PHONE_NUMBER_ID or not TO_NUMBER:
    print("Missing META_ACCESS_TOKEN, META_PHONE_NUMBER_ID, or WA_TO", file=sys.stderr)
    sys.exit(1)

url = f"https://graph.facebook.com/{API_VERSION}/{PHONE_NUMBER_ID}/messages"
body = {
    "messaging_product": "whatsapp",
    "to": TO_NUMBER,
    "type": "text",
    "text": {"body": MESSAGE},
}

req = urllib.request.Request(
    url,
    data=json.dumps(body).encode("utf-8"),
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ACCESS_TOKEN}",
    },
    method="POST",
)

with urllib.request.urlopen(req) as resp:
    print(resp.read().decode("utf-8"))

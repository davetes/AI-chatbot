import json
import os
import uuid
from typing import List

from app.config import settings


def _ensure_rules_file() -> None:
    os.makedirs(os.path.dirname(settings.workflow_rules_path), exist_ok=True)
    if not os.path.exists(settings.workflow_rules_path):
        with open(settings.workflow_rules_path, "w", encoding="utf-8") as handle:
            json.dump({"rules": []}, handle)


def list_rules() -> List[dict]:
    _ensure_rules_file()
    with open(settings.workflow_rules_path, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    return data.get("rules", [])


def save_rules(rules: List[dict]) -> List[dict]:
    _ensure_rules_file()
    with open(settings.workflow_rules_path, "w", encoding="utf-8") as handle:
        json.dump({"rules": rules}, handle, indent=2)
    return rules


def create_rule(name: str, keywords: List[str], action: str) -> dict:
    rule = {"id": uuid.uuid4().hex, "name": name, "keywords": keywords, "action": action}
    rules = list_rules()
    rules.append(rule)
    save_rules(rules)
    return rule


def match_rules(message: str) -> List[dict]:
    lowered = message.lower()
    return [rule for rule in list_rules() if any(keyword.lower() in lowered for keyword in rule.get("keywords", []))]

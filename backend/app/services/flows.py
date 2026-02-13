import json
import os
import uuid
from typing import List

from app.config import settings


def _ensure_flows_file() -> None:
    os.makedirs(os.path.dirname(settings.kb_path), exist_ok=True)
    path = os.path.join(os.path.dirname(settings.kb_path), "flows.json")
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as handle:
            json.dump({"flows": []}, handle)


def _flows_path() -> str:
    return os.path.join(os.path.dirname(settings.kb_path), "flows.json")


def list_flows() -> List[dict]:
    _ensure_flows_file()
    with open(_flows_path(), "r", encoding="utf-8") as handle:
        data = json.load(handle)
    return data.get("flows", [])


def save_flows(flows: List[dict]) -> List[dict]:
    _ensure_flows_file()
    with open(_flows_path(), "w", encoding="utf-8") as handle:
        json.dump({"flows": flows}, handle, indent=2)
    return flows


def create_flow(name: str, nodes: List[dict]) -> dict:
    flow = {"id": uuid.uuid4().hex, "name": name, "nodes": nodes}
    flows = list_flows()
    flows.append(flow)
    save_flows(flows)
    return flow


def delete_flow(flow_id: str) -> None:
    flows = [flow for flow in list_flows() if flow.get("id") != flow_id]
    save_flows(flows)

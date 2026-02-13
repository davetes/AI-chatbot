from pathlib import Path
from typing import Dict

ENV_PATH = Path(__file__).resolve().parents[2] / ".env"


def update_env_file(updates: Dict[str, str], env_path: Path = ENV_PATH) -> None:
    env_path.parent.mkdir(parents=True, exist_ok=True)
    existing_lines: list[str] = []
    existing: Dict[str, str] = {}

    if env_path.exists():
        existing_lines = env_path.read_text(encoding="utf-8").splitlines()
        for line in existing_lines:
            if not line or line.strip().startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            existing[key] = value

    for key, value in updates.items():
        existing[key] = value

    new_lines: list[str] = []
    seen_keys: set[str] = set()
    for line in existing_lines:
        if not line or line.strip().startswith("#") or "=" not in line:
            new_lines.append(line)
            continue
        key, _ = line.split("=", 1)
        if key in existing:
            new_lines.append(f"{key}={existing[key]}")
            seen_keys.add(key)
        else:
            new_lines.append(line)

    for key, value in existing.items():
        if key not in seen_keys:
            new_lines.append(f"{key}={value}")

    env_path.write_text("\n".join(new_lines) + "\n", encoding="utf-8")

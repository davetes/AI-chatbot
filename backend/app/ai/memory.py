from typing import Dict, List, Optional

class Memory:
    def __init__(self) -> None:
        self._store: Dict[str, List[dict]] = {}

    def add_turn(self, channel: str, user_message: str, bot_message: Optional[str]) -> None:
        self._store.setdefault(channel, []).append({
            "user": user_message,
            "bot": bot_message,
        })

    def update_last_bot_message(self, channel: str, bot_message: str) -> None:
        if channel in self._store and self._store[channel]:
            self._store[channel][-1]["bot"] = bot_message

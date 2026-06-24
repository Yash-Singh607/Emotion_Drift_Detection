from __future__ import annotations

from threading import RLock
from typing import Dict, List


class SessionStore:
    """Thread-safe in-memory session timeline storage."""

    def __init__(self, max_session_history: int = 250) -> None:
        self._lock = RLock()
        self._sessions: Dict[str, List[dict]] = {}
        self._max_session_history = max_session_history

    def get_timeline(self, session_id: str) -> List[dict]:
        with self._lock:
            return list(self._sessions.get(session_id, []))

    def append(self, session_id: str, item: dict) -> List[dict]:
        with self._lock:
            timeline = self._sessions.setdefault(session_id, [])
            timeline.append(item)
            if len(timeline) > self._max_session_history:
                timeline[:] = timeline[-self._max_session_history :]
            return list(timeline)

    def reset(self, session_id: str) -> None:
        with self._lock:
            self._sessions[session_id] = []


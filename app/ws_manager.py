from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}

    async def connect(self, room: str, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(room, []).append(websocket)

    def disconnect(self, room: str, websocket: WebSocket):
        if room in self.active and websocket in self.active[room]:
            self.active[room].remove(websocket)
            if not self.active[room]:
                del self.active[room]

    async def broadcast(self, room: str, message: str):
        conns = list(self.active.get(room, []))
        for conn in conns:
            try:
                await conn.send_text(message)
            except Exception:
                # remove broken connections
                self.disconnect(room, conn)
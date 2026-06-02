"""
房间模块数据传输对象(DTO)定义
"""

from typing import Optional
from pydantic import BaseModel

class RoomInfoRequest(BaseModel):
    player_id: Optional[int] = None
    room_id: int
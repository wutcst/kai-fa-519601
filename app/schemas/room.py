"""
房间模块数据传输对象(DTO)定义
"""

from typing import Optional
from pydantic import BaseModel

class RoomInfoRequest(BaseModel):
    player_id: Optional[int] = None  # 可选：当前操作的玩家 ID
    room_id: int                     # 必填：目标房间 ID

class ItemDTO(BaseModel):
    item_id: int
    item_name: str
    item_size: int
    item_value: int
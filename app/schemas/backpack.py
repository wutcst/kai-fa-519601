"""
背包系统数据传输对象 (DTO)
"""
from pydantic import BaseModel

class BackpackListRequest(BaseModel):
    player_id: int# 发起查询的玩家 ID

class BackpackItemActionRequest(BaseModel):
    """背包物品操作请求体（用于拾取、丢弃、使用等针对具体物品的行为）"""
    player_id: int
    item_id: int

class ItemDTO(BaseModel):
    item_id: int
    item_name: str
    item_size: int
    item_value: int

class BackpackResponse(BaseModel):
    backpack_id: int
    backpack_size: int
    items: list[ItemDTO] = []
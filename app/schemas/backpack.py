"""
背包系统数据传输对象 (DTO)
"""
from pydantic import BaseModel

class BackpackListRequest(BaseModel):
    player_id: int

class BackpackItemActionRequest(BaseModel):
    player_id: int
    item_id: int
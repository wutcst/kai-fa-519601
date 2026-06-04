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
    """背包物品详情数据传输模型"""
    item_id: int# 物品唯一标识
    item_name: str# 物品名称（如：魔法饼干、体力药水）
    item_size: int# 物品占用的背包容量大小
    item_value: int# 物品的基础价值或增益数值

class BackpackResponse(BaseModel):
    backpack_id: int
    backpack_size: int
    items: list[ItemDTO] = []
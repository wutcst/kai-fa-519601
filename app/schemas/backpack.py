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
    """背包状态完整响应体"""
    backpack_id: int# 玩家绑定的背包唯一标识
    backpack_size: int# 背包当前的最大容量上限
    items: list[ItemDTO] = []# 背包内包含的物品列表，默认为空列表
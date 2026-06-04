from sqlalchemy import select, delete as sa_delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.player import Player
from app.models.backpack import Backpack, BackpackItem
from app.models.item import Item
from app.models.room_item import RoomItem
from app.schemas.backpack import BackpackResponse, ItemDTO
from app.schemas.result import Result
from app.services.player_service import update_score

async def get_backpack_by_player_id(db: AsyncSession, player_id: int):
"""
    根据玩家 ID 查询其背包及其内含物品的详细信息。
    """
    # 1. 校验玩家实体及其是否绑定了背包
    player = await db.get(Player, player_id)
    if not player:
        return Result.error(404, "player not found")
    if not player.player_backpack_id:
        return Result.error(404, "player has no backpack")

    # 2. 校验背包实体是否存在于数据库
    backpack = await db.get(Backpack, player.player_backpack_id)
    if not backpack:
        return Result.error(404, "backpack not found")
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
    
    # 3. 关联查询：通过中间表 BackpackItem 获取该背包下所有的物品 ID
    relations = (await db.execute(
        select(BackpackItem).where(BackpackItem.backpack_id == backpack.backpack_id)
    )).scalars().all()

    item_ids = [r.item_id for r in relations]
    items = []
    if item_ids:
        # 4. 批量查询：根据物品 ID 列表，从 Item 表中拉取具体的物品信息
        items = (await db.execute(select(Item).where(Item.item_id.in_(item_ids)))).scalars().all()
    
    # 5. DTO 转换：将数据库实体映射为前端所需的数据传输对象
    item_dtos = [
        ItemDTO(item_id=i.item_id, item_name=i.item_name, item_size=i.item_size, item_value=i.item_value)
        for i in items
    ]

    # 6. 构造并返回最终的成功响应
    return Result.success(
        BackpackResponse(backpack_id=backpack.backpack_id, backpack_size=backpack.backpack_size, items=item_dtos),
        "success",
    )

async def pick_item(db: AsyncSession, player_id: int, item_id: int):

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
    """
    根据玩家 ID 查询其背包及其内含物品的详细信息。
    """
    # 1. 校验玩家状态及是否处于合法房间内
    player = await db.get(Player, player_id)
    if not player:
        return Result.error(404, "player not found")
    if not player.player_backpack_id:
        return Result.error(404, "player has no backpack")
    if not player.player_room_id:
        return Result.error(400, "player is not in a valid room")

    # 2. 校验目标物品本身是否存在
    item = await db.get(Item, item_id)
    if not item:
        return Result.error(404, "item not found")

    # 3. 场景校验：确认该物品确实存在于玩家当前所在的房间内
    room_item = (await db.execute(
        select(RoomItem).where(RoomItem.room_id == player.player_room_id, RoomItem.item_id == item_id)
    )).scalar_one_or_none()
    if not room_item:
        return Result.error(404, "item not found in current room")

    # 4. 防重复校验：防止同一物品被重复放入同一个背包
    existing = (await db.execute(
        select(BackpackItem).where(
            BackpackItem.backpack_id == player.player_backpack_id,
            BackpackItem.item_id == item_id,
        )
    )).scalar_one_or_none()
    if existing:
        return Result.error(409, "item already in backpack")

    # 5. 状态流转：将物品绑定至背包，同时从房间的物品列表中彻底移除
    db.add(BackpackItem(backpack_id=player.player_backpack_id, item_id=item_id))
    await db.execute(
        sa_delete(RoomItem).where(RoomItem.room_id == player.player_room_id, RoomItem.item_id == item_id)
    )

    # 6. 结算阶段：扣除交互动作所需的 2 点体力，提交事务并触发分数更新
    player.player_stamina -= 2
    await db.commit()
    await update_score(db, player_id)

    return Result.success(None, "item picked successfully")

async def throw_item(db: AsyncSession, player_id: int, item_id: int):
    """
    玩家将背包中的指定物品丢弃，物品将掉落至当前所在的房间内。
    """
    # 1. 基础环境校验
    player = await db.get(Player, player_id)
    if not player:
        return Result.error(404, "player not found")
    if not player.player_backpack_id:
        return Result.error(404, "player has no backpack")
    if not player.player_room_id:
        return Result.error(400, "player is not in a valid room")

    # 2. 状态剥离：尝试从背包关联表中删除该物品。若影响行数为 0 说明背包中无此物
    result = await db.execute(
        sa_delete(BackpackItem).where(
            BackpackItem.backpack_id == player.player_backpack_id,
            BackpackItem.item_id == item_id,
        )
    )
    if result.rowcount == 0:
        return Result.error(404, "item not found in backpack")
        
    # 3. 逆向流转：将剥离出的物品重新绑定至玩家当前所在的房间
    db.add(RoomItem(room_id=player.player_room_id, item_id=item_id))

    # 4. 结算阶段：操作同样消耗体力
    player.player_stamina -= 2
    await db.commit()
    await update_score(db, player_id)

    return Result.success(None, "item dropped to room successfully")

async def use_item(db: AsyncSession, player_id: int, item_id: int):
    
"""
房间业务逻辑层：处理房间信息查询与关联物品批量加载
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.room import Room
from app.models.item import Item
from app.models.room_item import RoomItem
from app.schemas.room import RoomInfoResponse, ItemDTO
from app.schemas.result import Result

async def get_room_info(db: AsyncSession, room_id: int):
    """
    查询指定房间的信息以及房间内的物品列表
    """
    # 1. 尝试获取房间基础信息
    room = await db.get(Room, room_id)
    if not room:
        return Result.error(404, "room not found")
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
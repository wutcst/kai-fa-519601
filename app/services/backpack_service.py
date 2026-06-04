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
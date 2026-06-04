from typing import Optional
from pydantic import BaseModel


class RoomInfoRequest(BaseModel):
    player_id: Optional[int] = None
    room_id: int


class ItemDTO(BaseModel):
    item_id: int
    item_name: str
    item_size: int
    item_value: int


class RoomInfoResponse(BaseModel):
    room_id: int
    room_name: str
    item_list: list[ItemDTO] = []
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ListRequest(BaseModel):
    player_id: int


class SaveRequest(BaseModel):
    player_id: int


class ReadRequest(BaseModel):
    save_id: int


class DeleteRequest(BaseModel):
    save_id: int


class StartGameRequest(BaseModel):
    player_id: int


class SaveRecordResponse(BaseModel):
    save_id: int
    player_id: int
    save_time: Optional[datetime] = None
    player_score: Optional[int] = None
    player_stamina: Optional[int] = None
    player_room_id: Optional[int] = None
    player_backpack_id: Optional[int] = None
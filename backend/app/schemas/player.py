from typing import Optional
from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    player_id: int


class PlayerInfoRequest(BaseModel):
    player_id: int


class PlayerInfoResponse(BaseModel):
    player_id: int
    player_name: str
    player_avatar_url: Optional[str] = None
    player_backpack_id: Optional[int] = None
    player_score: int
    player_room_id: Optional[int] = None
    player_stamina: int


class PlayerListResponse(BaseModel):
    player_id: int
    player_name: str
    player_avatar_url: Optional[str] = None
    player_score: int
    player_room_id: Optional[int] = None
    player_stamina: int


class MoveRequest(BaseModel):
    player_id: int
    direction: str


class MoveResponse(BaseModel):
    room_id: int


class TransRequest(BaseModel):
    player_id: int


class TransResponse(BaseModel):
    room_id: int
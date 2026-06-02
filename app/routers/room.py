from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.room import RoomInfoRequest
from app.services import room_service

router = APIRouter()
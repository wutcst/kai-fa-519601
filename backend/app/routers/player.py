from fastapi import APIRouter, Depends, UploadFile, File, Form
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.player import LoginRequest, PlayerInfoRequest
from app.services import player_service

router = APIRouter()


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await player_service.login(db, req.username, req.password)


@router.post("/register")
async def register(
    playerName: str = Form(...),
    password: str = Form(...),
    avatar: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
):
    avatar_bytes = await avatar.read() if avatar else None
    return await player_service.register(db, playerName, password, avatar_bytes)


@router.post("/info")
async def get_info(req: PlayerInfoRequest, db: AsyncSession = Depends(get_db)):
    return await player_service.get_player_info(db, req.player_id)


@router.get("/list")
async def list_players(db: AsyncSession = Depends(get_db)):
    return await player_service.list_all_players(db)
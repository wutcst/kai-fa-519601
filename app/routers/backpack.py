from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.backpack import BackpackListRequest, BackpackItemActionRequest
from app.services import backpack_service

router = APIRouter()

@router.post("/list", summary="查看背包")
async def get_backpack(req: BackpackListRequest, db: AsyncSession = Depends(get_db)):
    return await backpack_service.get_backpack_by_player_id(db, req.player_id)

@router.post("/pick", summary="拾取物品")
async def pick_item(req: BackpackItemActionRequest, db: AsyncSession = Depends(get_db)):
    return await backpack_service.pick_item(db, req.player_id, req.item_id)

@router.post("/throw", summary="丢弃物品")
async def throw_item(req: BackpackItemActionRequest, db: AsyncSession = Depends(get_db)):
    return await backpack_service.throw_item(db, req.player_id, req.item_id)
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.backpack import BackpackListRequest, BackpackItemActionRequest
from app.services import backpack_service

router = APIRouter()

@router.post("/list", summary="查看背包")
async def get_backpack(req: BackpackListRequest, db: AsyncSession = Depends(get_db)):
    return await backpack_service.get_backpack_by_player_id(db, req.player_id)
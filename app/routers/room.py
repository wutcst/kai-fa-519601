from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.room import RoomInfoRequest
from app.services import room_service

router = APIRouter()

@router.post("/info", summary="获取房间详情", description="根据房间ID查询房间基础信息及内部包含的物品列表")
async def get_room_info(req: RoomInfoRequest, db: AsyncSession = Depends(get_db)):
    return await room_service.get_room_info(db, req.room_id)
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.backpack import BackpackListRequest, BackpackItemActionRequest
from app.services import backpack_service

router = APIRouter()

@router.post("/list", summary="查看背包")
"""
    查询指定玩家的背包信息及背包内的所有物品详情。
    - **player_id**: 发起查询的玩家 ID
    """
async def get_backpack(req: BackpackListRequest, db: AsyncSession = Depends(get_db)):
    return await backpack_service.get_backpack_by_player_id(db, req.player_id)

@router.post("/pick", summary="拾取物品")
"""
    玩家从当前所在的房间中拾取指定物品到背包中。
    拾取操作将消耗 2 点体力，并实时更新玩家分数。
    
    - **player_id**: 玩家 ID
    - **item_id**: 欲拾取的物品 ID
    """
async def pick_item(req: BackpackItemActionRequest, db: AsyncSession = Depends(get_db)):
"""
    玩家将背包中的指定物品丢弃到当前所在的房间中。
    丢弃操作将消耗 2 点体力，并实时更新玩家分数。
    
    - **player_id**: 玩家 ID
    - **item_id**: 欲丢弃的物品 ID
    """
    return await backpack_service.pick_item(db, req.player_id, req.item_id)

@router.post("/throw", summary="丢弃物品")
async def throw_item(req: BackpackItemActionRequest, db: AsyncSession = Depends(get_db)):
    return await backpack_service.throw_item(db, req.player_id, req.item_id)

@router.post("/use", summary="使用物品")
async def use_item(req: BackpackItemActionRequest, db: AsyncSession = Depends(get_db)):
    return await backpack_service.use_item(db, req.player_id, req.item_id)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.player import Player
from app.models.backpack import Backpack
from app.schemas.player import (
    LoginResponse, PlayerInfoResponse, PlayerListResponse,
)
from app.schemas.result import Result
from app.utils.qiniu_upload import save_avatar


async def login(db: AsyncSession, username: str, password: str):
    stmt = select(Player).where(
        Player.player_name == username,
        Player.player_password == password,
    )
    player = (await db.execute(stmt)).scalar_one_or_none()
    if player:
        return Result.success(LoginResponse(player_id=player.player_id), "login successful")
    return Result.error(401, "invalid username or password")


async def register(db: AsyncSession, player_name: str, password: str, avatar_bytes: bytes | None):
    existing = (await db.execute(
        select(Player).where(Player.player_name == player_name)
    )).scalar_one_or_none()
    if existing:
        return Result.error(409, "player already exists")

    avatar_url = ""
    if avatar_bytes:
        try:
            avatar_url = save_avatar(avatar_bytes, player_name)
        except Exception as e:
            return Result.error(500, f"avatar upload failed: {e}")

    player = Player(
        player_name=player_name,
        player_password=password,
        player_avatar_url=avatar_url,
        player_score=0,
        player_stamina=200,
        player_room_id=1,
    )
    db.add(player)
    await db.flush()

    backpack = Backpack(player_id=player.player_id, backpack_size=100)
    db.add(backpack)
    await db.flush()

    player.player_backpack_id = backpack.backpack_id
    await db.commit()

    return Result.success(LoginResponse(player_id=player.player_id), "register successful")


async def get_player_info(db: AsyncSession, player_id: int):
    player = await db.get(Player, player_id)
    if not player:
        return Result.error(404, "player not found")
    return Result.success(PlayerInfoResponse(
        player_id=player.player_id,
        player_name=player.player_name,
        player_avatar_url=player.player_avatar_url,
        player_backpack_id=player.player_backpack_id,
        player_score=player.player_score,
        player_room_id=player.player_room_id,
        player_stamina=player.player_stamina,
    ), "success")


async def list_all_players(db: AsyncSession):
    result = await db.execute(select(Player))
    players = result.scalars().all()
    data = [
        PlayerListResponse(
            player_id=p.player_id,
            player_name=p.player_name,
            player_avatar_url=p.player_avatar_url,
            player_score=p.player_score,
            player_room_id=p.player_room_id,
            player_stamina=p.player_stamina,
        ) for p in players
    ]
    return Result.success(data, "success")
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.room import Room
from app.models.player import Player
from app.models.backpack import Backpack

pytestmark = pytest.mark.asyncio


async def _seed_room(db: AsyncSession) -> Room:
    room = Room(room_name="入口大厅")
    db.add(room)
    await db.flush()
    return room


async def _seed_player(db: AsyncSession, room_id: int, name: str = "test_user") -> tuple[Player, Backpack]:
    player = Player(
        player_name=name,
        player_password="pass123",
        player_score=0,
        player_stamina=200,
        player_room_id=room_id,
    )
    db.add(player)
    await db.flush()

    backpack = Backpack(player_id=player.player_id, backpack_size=100)
    db.add(backpack)
    await db.flush()

    player.player_backpack_id = backpack.backpack_id
    await db.commit()
    return player, backpack


# ---------------------------------------------------------------------------
# /player/register
# ---------------------------------------------------------------------------

async def test_register_success(client: AsyncClient, db: AsyncSession):
    await _seed_room(db)

    resp = await client.post("/player/register", data={"playerName": "alice", "password": "secret"})
    body = resp.json()

    assert resp.status_code == 200
    assert body["code"] == 200
    assert "playerId" in body["data"]


async def test_register_duplicate(client: AsyncClient, db: AsyncSession):
    room = await _seed_room(db)
    await _seed_player(db, room.room_id, name="bob")

    resp = await client.post("/player/register", data={"playerName": "bob", "password": "any"})
    assert resp.json()["code"] == 409


# ---------------------------------------------------------------------------
# /player/login
# ---------------------------------------------------------------------------

async def test_login_success(client: AsyncClient, db: AsyncSession):
    room = await _seed_room(db)
    await _seed_player(db, room.room_id, name="carol")

    resp = await client.post("/player/login", json={"username": "carol", "password": "pass123"})
    body = resp.json()

    assert body["code"] == 200
    assert "playerId" in body["data"]


async def test_login_wrong_password(client: AsyncClient, db: AsyncSession):
    room = await _seed_room(db)
    await _seed_player(db, room.room_id, name="dave")

    resp = await client.post("/player/login", json={"username": "dave", "password": "wrong"})
    assert resp.json()["code"] == 401


async def test_login_nonexistent_user(client: AsyncClient, db: AsyncSession):
    resp = await client.post("/player/login", json={"username": "nobody", "password": "x"})
    assert resp.json()["code"] == 401


# ---------------------------------------------------------------------------
# /player/info
# ---------------------------------------------------------------------------

async def test_get_info_success(client: AsyncClient, db: AsyncSession):
    room = await _seed_room(db)
    player, _ = await _seed_player(db, room.room_id, name="eve")

    resp = await client.post("/player/info", json={"player_id": player.player_id})
    body = resp.json()

    assert body["code"] == 200
    assert body["data"]["playerName"] == "eve"
    assert body["data"]["playerStamina"] == 200


async def test_get_info_not_found(client: AsyncClient, db: AsyncSession):
    resp = await client.post("/player/info", json={"player_id": 9999})
    assert resp.json()["code"] == 404


# ---------------------------------------------------------------------------
# /player/list
# ---------------------------------------------------------------------------

async def test_list_players(client: AsyncClient, db: AsyncSession):
    room = await _seed_room(db)
    await _seed_player(db, room.room_id, name="p1")
    await _seed_player(db, room.room_id, name="p2")

    resp = await client.get("/player/list")
    body = resp.json()

    assert body["code"] == 200
    names = [p["playerName"] for p in body["data"]]
    assert "p1" in names and "p2" in names


# ---------------------------------------------------------------------------
# /player/move
# ---------------------------------------------------------------------------

async def test_move_success(client: AsyncClient, db: AsyncSession):
    room_a = Room(room_name="A")
    room_b = Room(room_name="B")
    db.add(room_a)
    db.add(room_b)
    await db.flush()

    room_a.room_right_id = room_b.room_id
    await db.commit()

    player, _ = await _seed_player(db, room_a.room_id, name="mover")

    resp = await client.post("/player/move", json={"player_id": player.player_id, "direction": "right"})
    body = resp.json()

    assert body["code"] == 200
    assert body["data"]["roomId"] == room_b.room_id


async def test_move_no_exit(client: AsyncClient, db: AsyncSession):
    room = await _seed_room(db)
    player, _ = await _seed_player(db, room.room_id)

    resp = await client.post("/player/move", json={"player_id": player.player_id, "direction": "up"})
    assert resp.json()["code"] == 400


# ---------------------------------------------------------------------------
# /player/trans  /player/back  /player/home
# ---------------------------------------------------------------------------

async def test_teleport(client: AsyncClient, db: AsyncSession):
    room = await _seed_room(db)
    player, _ = await _seed_player(db, room.room_id, name="traveler")

    resp = await client.post("/player/trans", json={"player_id": player.player_id})
    assert resp.json()["code"] == 200


async def test_back_no_history(client: AsyncClient, db: AsyncSession):
    room = await _seed_room(db)
    player, _ = await _seed_player(db, room.room_id, name="backman")

    resp = await client.post("/player/back", json={"player_id": player.player_id})
    assert resp.json()["code"] == 404


async def test_home(client: AsyncClient, db: AsyncSession):
    room = await _seed_room(db)
    player, _ = await _seed_player(db, room.room_id, name="homer")

    resp = await client.post("/player/home", json={"player_id": player.player_id})
    assert resp.json()["code"] == 200
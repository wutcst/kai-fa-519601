import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.room import Room
from app.models.player import Player
from app.models.backpack import Backpack

pytestmark = pytest.mark.asyncio


async def _setup(db: AsyncSession, name: str = "gamer") -> Player:
    room = Room(room_name="大厅")
    db.add(room)
    await db.flush()

    player = Player(
        player_name=name,
        player_password="pw",
        player_score=50,
        player_stamina=180,
        player_room_id=room.room_id,
    )
    db.add(player)
    await db.flush()

    bp = Backpack(player_id=player.player_id, backpack_size=100)
    db.add(bp)
    await db.flush()

    player.player_backpack_id = bp.backpack_id
    await db.commit()
    return player


# ---------------------------------------------------------------------------
# /game/save  /game/list
# ---------------------------------------------------------------------------

async def test_save_and_list(client: AsyncClient, db: AsyncSession):
    player = await _setup(db, "saver")

    save_resp = await client.post("/game/save", json={"player_id": player.player_id})
    assert save_resp.json()["code"] == 200

    list_resp = await client.post("/game/list", json={"player_id": player.player_id})
    body = list_resp.json()
    assert body["code"] == 200
    assert len(body["data"]) == 1
    assert body["data"][0]["playerScore"] == 50


async def test_save_player_not_found(client: AsyncClient, db: AsyncSession):
    resp = await client.post("/game/save", json={"player_id": 9999})
    assert resp.json()["code"] == 404


async def test_list_empty(client: AsyncClient, db: AsyncSession):
    player = await _setup(db, "empty_lister")

    resp = await client.post("/game/list", json={"player_id": player.player_id})
    body = resp.json()
    assert body["code"] == 200
    assert body["data"] == []


# ---------------------------------------------------------------------------
# /game/read
# ---------------------------------------------------------------------------

async def test_read_restores_state(client: AsyncClient, db: AsyncSession):
    player = await _setup(db, "loader")
    original_stamina = player.player_stamina

    save_resp = await client.post("/game/save", json={"player_id": player.player_id})
    save_id = save_resp.json()  # code 200, data None — get save_id from list

    list_resp = await client.post("/game/list", json={"player_id": player.player_id})
    save_id = list_resp.json()["data"][0]["saveId"]

    # mutate player state
    player.player_stamina = 10
    await db.commit()

    read_resp = await client.post("/game/read", json={"save_id": save_id})
    body = read_resp.json()

    assert body["code"] == 200
    assert body["data"]["playerStamina"] == original_stamina


async def test_read_not_found(client: AsyncClient, db: AsyncSession):
    resp = await client.post("/game/read", json={"save_id": 9999})
    assert resp.json()["code"] == 404


# ---------------------------------------------------------------------------
# /game/delete
# ---------------------------------------------------------------------------

async def test_delete_save(client: AsyncClient, db: AsyncSession):
    player = await _setup(db, "deleter")

    await client.post("/game/save", json={"player_id": player.player_id})
    list_resp = await client.post("/game/list", json={"player_id": player.player_id})
    save_id = list_resp.json()["data"][0]["saveId"]

    del_resp = await client.post("/game/delete", json={"save_id": save_id})
    assert del_resp.json()["code"] == 200

    list_after = await client.post("/game/list", json={"player_id": player.player_id})
    assert list_after.json()["data"] == []


async def test_delete_not_found(client: AsyncClient, db: AsyncSession):
    resp = await client.post("/game/delete", json={"save_id": 9999})
    assert resp.json()["code"] == 404


# ---------------------------------------------------------------------------
# /game/new
# ---------------------------------------------------------------------------

async def test_new_game_resets_state(client: AsyncClient, db: AsyncSession):
    player = await _setup(db, "newbie")

    player.player_stamina = 50
    player.player_score = 999
    await db.commit()

    resp = await client.post("/game/new", json={"player_id": player.player_id})
    assert resp.json()["code"] == 200

    await db.refresh(player)
    assert player.player_stamina == 200
    assert player.player_score == 0
    assert player.player_room_id == 1


async def test_new_game_player_not_found(client: AsyncClient, db: AsyncSession):
    resp = await client.post("/game/new", json={"player_id": 9999})
    assert resp.json()["code"] == 404


# ---------------------------------------------------------------------------
# extra coverage: multiple saves ordering + read with orphan player
# ---------------------------------------------------------------------------

async def test_list_saves_ordered_desc(client: AsyncClient, db: AsyncSession):
    player = await _setup(db, "multi_saver")

    await client.post("/game/save", json={"player_id": player.player_id})
    player.player_score = 100
    await db.commit()
    await client.post("/game/save", json={"player_id": player.player_id})

    resp = await client.post("/game/list", json={"player_id": player.player_id})
    records = resp.json()["data"]
    assert len(records) == 2
    # most recent first — score 100 should be first
    assert records[0]["playerScore"] == 100


async def test_read_game_player_deleted(client: AsyncClient, db: AsyncSession):
    player = await _setup(db, "ghost")

    await client.post("/game/save", json={"player_id": player.player_id})
    list_resp = await client.post("/game/list", json={"player_id": player.player_id})
    save_id = list_resp.json()["data"][0]["saveId"]

    # delete the player directly
    await db.delete(player)
    await db.commit()

    resp = await client.post("/game/read", json={"save_id": save_id})
    assert resp.json()["code"] == 404


async def test_new_game_creates_fresh_backpack(client: AsyncClient, db: AsyncSession):
    player = await _setup(db, "fresh")
    old_bp_id = player.player_backpack_id

    await client.post("/game/new", json={"player_id": player.player_id})
    await db.refresh(player)

    assert player.player_backpack_id != old_bp_id
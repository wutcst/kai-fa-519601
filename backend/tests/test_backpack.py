import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.room import Room
from app.models.player import Player
from app.models.backpack import Backpack, BackpackItem
from app.models.item import Item
from app.models.room_item import RoomItem

pytestmark = pytest.mark.asyncio


async def _setup(db: AsyncSession, player_name: str = "tester"):
    """Create one room + one player with backpack, return (player, backpack, room)."""
    room = Room(room_name="测试间")
    db.add(room)
    await db.flush()

    player = Player(
        player_name=player_name,
        player_password="pw",
        player_score=0,
        player_stamina=200,
        player_room_id=room.room_id,
    )
    db.add(player)
    await db.flush()

    bp = Backpack(player_id=player.player_id, backpack_size=100)
    db.add(bp)
    await db.flush()

    player.player_backpack_id = bp.backpack_id
    await db.commit()
    return player, bp, room


# ---------------------------------------------------------------------------
# /backpack/list
# ---------------------------------------------------------------------------

async def test_backpack_list_empty(client: AsyncClient, db: AsyncSession):
    player, _, _ = await _setup(db, "lister")

    resp = await client.post("/backpack/list", json={"player_id": player.player_id})
    body = resp.json()

    assert body["code"] == 200
    assert body["data"]["itemList"] == []


async def test_backpack_list_with_items(client: AsyncClient, db: AsyncSession):
    player, bp, _ = await _setup(db, "holder")

    item = Item(item_name="火把", item_size=10, item_value=5)
    db.add(item)
    await db.flush()
    db.add(BackpackItem(backpack_id=bp.backpack_id, item_id=item.item_id))
    await db.commit()

    resp = await client.post("/backpack/list", json={"player_id": player.player_id})
    body = resp.json()

    assert body["code"] == 200
    names = [i["itemName"] for i in body["data"]["itemList"]]
    assert "火把" in names


async def test_backpack_list_player_not_found(client: AsyncClient, db: AsyncSession):
    resp = await client.post("/backpack/list", json={"player_id": 9999})
    assert resp.json()["code"] == 404


# ---------------------------------------------------------------------------
# /backpack/pick
# ---------------------------------------------------------------------------

async def test_pick_item_success(client: AsyncClient, db: AsyncSession):
    player, _, room = await _setup(db, "picker")

    item = Item(item_name="钥匙", item_size=10, item_value=20)
    db.add(item)
    await db.flush()
    db.add(RoomItem(room_id=room.room_id, item_id=item.item_id))
    await db.commit()

    resp = await client.post("/backpack/pick", json={"player_id": player.player_id, "item_id": item.item_id})
    assert resp.json()["code"] == 200


async def test_pick_item_not_in_room(client: AsyncClient, db: AsyncSession):
    player, _, _ = await _setup(db, "picker2")

    item = Item(item_name="宝石", item_size=10, item_value=200)
    db.add(item)
    await db.commit()

    resp = await client.post("/backpack/pick", json={"player_id": player.player_id, "item_id": item.item_id})
    assert resp.json()["code"] == 404


async def test_pick_item_already_in_backpack(client: AsyncClient, db: AsyncSession):
    player, bp, room = await _setup(db, "picker3")

    item = Item(item_name="古书", item_size=20, item_value=50)
    db.add(item)
    await db.flush()
    db.add(RoomItem(room_id=room.room_id, item_id=item.item_id))
    db.add(BackpackItem(backpack_id=bp.backpack_id, item_id=item.item_id))
    await db.commit()

    resp = await client.post("/backpack/pick", json={"player_id": player.player_id, "item_id": item.item_id})
    assert resp.json()["code"] == 409


# ---------------------------------------------------------------------------
# /backpack/throw
# ---------------------------------------------------------------------------

async def test_throw_item_success(client: AsyncClient, db: AsyncSession):
    player, bp, _ = await _setup(db, "thrower")

    item = Item(item_name="盾牌", item_size=40, item_value=70)
    db.add(item)
    await db.flush()
    db.add(BackpackItem(backpack_id=bp.backpack_id, item_id=item.item_id))
    await db.commit()

    resp = await client.post("/backpack/throw", json={"player_id": player.player_id, "item_id": item.item_id})
    assert resp.json()["code"] == 200


async def test_throw_item_not_in_backpack(client: AsyncClient, db: AsyncSession):
    player, _, _ = await _setup(db, "thrower2")

    item = Item(item_name="金币", item_size=10, item_value=100)
    db.add(item)
    await db.commit()

    resp = await client.post("/backpack/throw", json={"player_id": player.player_id, "item_id": item.item_id})
    assert resp.json()["code"] == 404


# ---------------------------------------------------------------------------
# /backpack/use
# ---------------------------------------------------------------------------

async def test_use_item_stamina_potion(client: AsyncClient, db: AsyncSession):
    player, bp, _ = await _setup(db, "user1")

    item = Item(item_name="体力药水", item_size=0, item_value=10)
    db.add(item)
    await db.flush()
    db.add(BackpackItem(backpack_id=bp.backpack_id, item_id=item.item_id))
    await db.commit()

    original_stamina = player.player_stamina
    resp = await client.post("/backpack/use", json={"player_id": player.player_id, "item_id": item.item_id})
    assert resp.json()["code"] == 200

    await db.refresh(player)
    assert player.player_stamina == original_stamina + 10


async def test_use_item_magic_cookie(client: AsyncClient, db: AsyncSession):
    player, bp, _ = await _setup(db, "user2")

    item = Item(item_name="魔法饼干", item_size=0, item_value=10)
    db.add(item)
    await db.flush()
    db.add(BackpackItem(backpack_id=bp.backpack_id, item_id=item.item_id))
    await db.commit()

    original_size = bp.backpack_size
    resp = await client.post("/backpack/use", json={"player_id": player.player_id, "item_id": item.item_id})
    assert resp.json()["code"] == 200

    await db.refresh(bp)
    assert bp.backpack_size == original_size + 10


async def test_use_item_not_found(client: AsyncClient, db: AsyncSession):
    player, _, _ = await _setup(db, "user3")

    resp = await client.post("/backpack/use", json={"player_id": player.player_id, "item_id": 9999})
    assert resp.json()["code"] == 404
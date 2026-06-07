import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.room import Room
from app.models.item import Item
from app.models.room_item import RoomItem

pytestmark = pytest.mark.asyncio


async def test_room_info_with_items(client: AsyncClient, db: AsyncSession):
    room = Room(room_name="宝库")
    db.add(room)
    await db.flush()

    item = Item(item_name="宝剑", item_size=30, item_value=80)
    db.add(item)
    await db.flush()

    db.add(RoomItem(room_id=room.room_id, item_id=item.item_id))
    await db.commit()

    resp = await client.post("/room/info", json={"room_id": room.room_id})
    body = resp.json()

    assert body["code"] == 200
    assert body["data"]["roomName"] == "宝库"
    item_names = [i["itemName"] for i in body["data"]["items"]]
    assert "宝剑" in item_names


async def test_room_info_empty_room(client: AsyncClient, db: AsyncSession):
    room = Room(room_name="空房间")
    db.add(room)
    await db.commit()

    resp = await client.post("/room/info", json={"room_id": room.room_id})
    body = resp.json()

    assert body["code"] == 200
    assert body["data"]["items"] == []


async def test_room_info_not_found(client: AsyncClient, db: AsyncSession):
    resp = await client.post("/room/info", json={"room_id": 9999})
    assert resp.json()["code"] == 404
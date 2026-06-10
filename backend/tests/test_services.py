"""
直接调用 service 函数的单元测试，覆盖 HTTP 测试无法追踪到的 service 层代码。
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.player import Player
from app.models.backpack import Backpack, BackpackItem
from app.models.room import Room
from app.models.item import Item
from app.models.room_item import RoomItem
from app.services import player_service, backpack_service, room_service, game_service
from app.utils import room_history_store

pytestmark = pytest.mark.asyncio


async def _make_room(db: AsyncSession, name: str = "hall") -> Room:
    room = Room(room_name=name)
    db.add(room)
    await db.flush()
    return room


async def _make_player(
    db: AsyncSession, room_id: int, name: str = "u"
) -> tuple[Player, Backpack]:
    p = Player(
        player_name=name,
        player_password="pw",
        player_score=0,
        player_stamina=200,
        player_room_id=room_id,
    )
    db.add(p)
    await db.flush()
    bp = Backpack(player_id=p.player_id, backpack_size=100)
    db.add(bp)
    await db.flush()
    p.player_backpack_id = bp.backpack_id
    await db.commit()
    return p, bp


# ---------------------------------------------------------------------------
# player_service
# ---------------------------------------------------------------------------


async def test_service_login_success(db: AsyncSession):
    room = await _make_room(db)
    await _make_player(db, room.room_id, "alice")

    result = await player_service.login(db, "alice", "pw")
    assert result.code == 200
    assert result.data.player_id is not None


async def test_service_login_fail(db: AsyncSession):
    result = await player_service.login(db, "nobody", "x")
    assert result.code == 401


async def test_service_register_no_avatar(db: AsyncSession):
    await _make_room(db)  # room id=1 exists for register to set player_room_id=1
    result = await player_service.register(db, "bob", "pw", None)
    assert result.code == 200
    assert result.data.player_id is not None


async def test_service_register_duplicate(db: AsyncSession):
    room = await _make_room(db)
    await _make_player(db, room.room_id, "carol")

    result = await player_service.register(db, "carol", "pw", None)
    assert result.code == 409


async def test_service_get_player_info(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "dave")

    result = await player_service.get_player_info(db, p.player_id)
    assert result.code == 200
    assert result.data.player_name == "dave"


async def test_service_get_player_info_not_found(db: AsyncSession):
    result = await player_service.get_player_info(db, 9999)
    assert result.code == 404


async def test_service_list_all_players(db: AsyncSession):
    room = await _make_room(db)
    await _make_player(db, room.room_id, "p1")
    await _make_player(db, room.room_id, "p2")

    result = await player_service.list_all_players(db)
    assert result.code == 200
    assert len(result.data) >= 2


async def test_service_move_success(db: AsyncSession):
    room_a = Room(room_name="A")
    room_b = Room(room_name="B")
    db.add(room_a)
    db.add(room_b)
    await db.flush()
    room_a.room_right_id = room_b.room_id
    await db.commit()

    p, _ = await _make_player(db, room_a.room_id, "mover")
    result = await player_service.move_player(db, p.player_id, "right")
    assert result.code == 200
    assert result.data.room_id == room_b.room_id


async def test_service_move_no_exit(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "stuck")

    result = await player_service.move_player(db, p.player_id, "up")
    assert result.code == 400


async def test_service_move_player_not_found(db: AsyncSession):
    result = await player_service.move_player(db, 9999, "up")
    assert result.code == 404


async def test_service_teleport(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "traveler")

    result = await player_service.teleport_player(db, p.player_id)
    assert result.code == 200


async def test_service_teleport_not_found(db: AsyncSession):
    result = await player_service.teleport_player(db, 9999)
    assert result.code == 404


async def test_service_home(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "homer")

    result = await player_service.home_player(db, p.player_id)
    assert result.code == 200


async def test_service_home_not_found(db: AsyncSession):
    result = await player_service.home_player(db, 9999)
    assert result.code == 404


async def test_service_back_with_history(db: AsyncSession):
    room_a = Room(room_name="X")
    room_b = Room(room_name="Y")
    db.add(room_a)
    db.add(room_b)
    await db.flush()
    room_a.room_right_id = room_b.room_id
    await db.commit()

    p, bp = await _make_player(db, room_a.room_id, "backer")
    await player_service.move_player(db, p.player_id, "right")

    result = await player_service.back_player(db, p.player_id)
    assert result.code == 200


async def test_service_back_no_history(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "backer2")

    result = await player_service.back_player(db, p.player_id)
    assert result.code == 404


async def test_service_back_not_found(db: AsyncSession):
    result = await player_service.back_player(db, 9999)
    assert result.code == 404


async def test_service_update_score(db: AsyncSession):
    room = await _make_room(db)
    p, bp = await _make_player(db, room.room_id, "scorer")

    item = Item(item_name="宝石", item_size=10, item_value=200)
    db.add(item)
    await db.flush()
    db.add(BackpackItem(backpack_id=bp.backpack_id, item_id=item.item_id))
    await db.commit()

    await player_service.update_score(db, p.player_id)
    await db.refresh(p)
    assert p.player_score == 200


# ---------------------------------------------------------------------------
# backpack_service
# ---------------------------------------------------------------------------


async def test_service_get_backpack(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "bp_getter")

    result = await backpack_service.get_backpack_by_player_id(db, p.player_id)
    assert result.code == 200
    assert result.data.item_list == []


async def test_service_get_backpack_not_found(db: AsyncSession):
    result = await backpack_service.get_backpack_by_player_id(db, 9999)
    assert result.code == 404


async def test_service_pick_item(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "picker")

    item = Item(item_name="钥匙", item_size=10, item_value=20)
    db.add(item)
    await db.flush()
    db.add(RoomItem(room_id=room.room_id, item_id=item.item_id))
    await db.commit()

    result = await backpack_service.pick_item(db, p.player_id, item.item_id)
    assert result.code == 200


async def test_service_pick_item_player_not_found(db: AsyncSession):
    result = await backpack_service.pick_item(db, 9999, 1)
    assert result.code == 404


async def test_service_pick_item_item_not_found(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "picker2")

    result = await backpack_service.pick_item(db, p.player_id, 9999)
    assert result.code == 404


async def test_service_pick_not_in_room(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "picker3")

    item = Item(item_name="古书", item_size=20, item_value=50)
    db.add(item)
    await db.commit()

    result = await backpack_service.pick_item(db, p.player_id, item.item_id)
    assert result.code == 404


async def test_service_pick_already_in_backpack(db: AsyncSession):
    room = await _make_room(db)
    p, bp = await _make_player(db, room.room_id, "picker4")

    item = Item(item_name="盾牌", item_size=40, item_value=70)
    db.add(item)
    await db.flush()
    db.add(RoomItem(room_id=room.room_id, item_id=item.item_id))
    db.add(BackpackItem(backpack_id=bp.backpack_id, item_id=item.item_id))
    await db.commit()

    result = await backpack_service.pick_item(db, p.player_id, item.item_id)
    assert result.code == 409


async def test_service_throw_item(db: AsyncSession):
    room = await _make_room(db)
    p, bp = await _make_player(db, room.room_id, "thrower")

    item = Item(item_name="金币", item_size=10, item_value=100)
    db.add(item)
    await db.flush()
    db.add(BackpackItem(backpack_id=bp.backpack_id, item_id=item.item_id))
    await db.commit()

    result = await backpack_service.throw_item(db, p.player_id, item.item_id)
    assert result.code == 200


async def test_service_throw_player_not_found(db: AsyncSession):
    result = await backpack_service.throw_item(db, 9999, 1)
    assert result.code == 404


async def test_service_throw_not_in_backpack(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "thrower2")

    result = await backpack_service.throw_item(db, p.player_id, 9999)
    assert result.code == 404


async def test_service_use_item_stamina_potion(db: AsyncSession):
    room = await _make_room(db)
    p, bp = await _make_player(db, room.room_id, "user1")

    item = Item(item_name="体力药水", item_size=0, item_value=10)
    db.add(item)
    await db.flush()
    db.add(BackpackItem(backpack_id=bp.backpack_id, item_id=item.item_id))
    await db.commit()

    original = p.player_stamina
    result = await backpack_service.use_item(db, p.player_id, item.item_id)
    assert result.code == 200
    await db.refresh(p)
    assert p.player_stamina == original + 10


async def test_service_use_item_magic_cookie(db: AsyncSession):
    room = await _make_room(db)
    p, bp = await _make_player(db, room.room_id, "user2")

    item = Item(item_name="魔法饼干", item_size=0, item_value=10)
    db.add(item)
    await db.flush()
    db.add(BackpackItem(backpack_id=bp.backpack_id, item_id=item.item_id))
    await db.commit()

    original_size = bp.backpack_size
    result = await backpack_service.use_item(db, p.player_id, item.item_id)
    assert result.code == 200
    await db.refresh(bp)
    assert bp.backpack_size == original_size + 10


async def test_service_use_item_other(db: AsyncSession):
    room = await _make_room(db)
    p, bp = await _make_player(db, room.room_id, "user3")

    item = Item(item_name="武器（短剑）", item_size=30, item_value=80)
    db.add(item)
    await db.flush()
    db.add(BackpackItem(backpack_id=bp.backpack_id, item_id=item.item_id))
    await db.commit()

    original = p.player_stamina
    result = await backpack_service.use_item(db, p.player_id, item.item_id)
    assert result.code == 200
    await db.refresh(p)
    assert p.player_stamina == original - 2


async def test_service_use_item_player_not_found(db: AsyncSession):
    result = await backpack_service.use_item(db, 9999, 1)
    assert result.code == 404


async def test_service_use_item_not_in_backpack(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "user4")

    item = Item(item_name="宝石", item_size=10, item_value=200)
    db.add(item)
    await db.commit()

    result = await backpack_service.use_item(db, p.player_id, item.item_id)
    assert result.code == 404


async def test_service_use_item_not_found(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "user5")

    result = await backpack_service.use_item(db, p.player_id, 9999)
    assert result.code == 404


# ---------------------------------------------------------------------------
# room_service
# ---------------------------------------------------------------------------


async def test_service_get_room_info(db: AsyncSession):
    room = await _make_room(db, "宝库")
    item = Item(item_name="宝剑", item_size=30, item_value=80)
    db.add(item)
    await db.flush()
    db.add(RoomItem(room_id=room.room_id, item_id=item.item_id))
    await db.commit()

    result = await room_service.get_room_info(db, room.room_id)
    assert result.code == 200
    assert result.data.room_name == "宝库"
    assert any(i.item_name == "宝剑" for i in result.data.items)


async def test_service_get_room_info_empty(db: AsyncSession):
    room = await _make_room(db, "空")
    result = await room_service.get_room_info(db, room.room_id)
    assert result.code == 200
    assert result.data.items == []


async def test_service_get_room_info_not_found(db: AsyncSession):
    result = await room_service.get_room_info(db, 9999)
    assert result.code == 404


# ---------------------------------------------------------------------------
# game_service
# ---------------------------------------------------------------------------


async def test_service_save_and_list(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "saver")

    await game_service.save_game(db, p.player_id)
    result = await game_service.list_saves(db, p.player_id)
    assert result.code == 200
    assert len(result.data) == 1


async def test_service_save_not_found(db: AsyncSession):
    result = await game_service.save_game(db, 9999)
    assert result.code == 404


async def test_service_read_game(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "loader")

    await game_service.save_game(db, p.player_id)
    saves = await game_service.list_saves(db, p.player_id)
    save_id = saves.data[0].save_id

    result = await game_service.read_game(db, save_id)
    assert result.code == 200


async def test_service_read_not_found(db: AsyncSession):
    result = await game_service.read_game(db, 9999)
    assert result.code == 404


async def test_service_read_player_deleted(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "ghost")

    await game_service.save_game(db, p.player_id)
    saves = await game_service.list_saves(db, p.player_id)
    save_id = saves.data[0].save_id

    await db.delete(p)
    await db.commit()

    result = await game_service.read_game(db, save_id)
    assert result.code == 404


async def test_service_delete_game(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "deleter")

    await game_service.save_game(db, p.player_id)
    saves = await game_service.list_saves(db, p.player_id)
    save_id = saves.data[0].save_id

    result = await game_service.delete_game(db, save_id)
    assert result.code == 200

    after = await game_service.list_saves(db, p.player_id)
    assert after.data == []


async def test_service_delete_not_found(db: AsyncSession):
    result = await game_service.delete_game(db, 9999)
    assert result.code == 404


async def test_service_new_game(db: AsyncSession):
    room = await _make_room(db)
    p, _ = await _make_player(db, room.room_id, "newbie")
    p.player_stamina = 50
    await db.commit()

    result = await game_service.start_new_game(db, p.player_id)
    assert result.code == 200

    await db.refresh(p)
    assert p.player_stamina == 200
    assert p.player_score == 0


async def test_service_new_game_not_found(db: AsyncSession):
    result = await game_service.start_new_game(db, 9999)
    assert result.code == 404


# ---------------------------------------------------------------------------
# room_history_store
# ---------------------------------------------------------------------------


async def test_room_history_push_pop(db: AsyncSession):
    room = await _make_room(db)
    p, bp = await _make_player(db, room.room_id, "hist")

    await room_history_store.push_room_history(
        db, p.player_id, bp.backpack_id, room.room_id
    )
    await db.flush()

    assert await room_history_store.has_room_history(db, p.player_id, bp.backpack_id)

    popped = await room_history_store.pop_room_history(db, p.player_id, bp.backpack_id)
    assert popped == room.room_id

    assert not await room_history_store.has_room_history(
        db, p.player_id, bp.backpack_id
    )


async def test_room_history_pop_empty(db: AsyncSession):
    result = await room_history_store.pop_room_history(db, 9999, 9999)
    assert result is None

import redis.asyncio as redis

from app.config import settings

redis_client = redis.Redis(
    host=settings.redis_host,
    port=settings.redis_port,
    decode_responses=True,
)


def room_history_key(player_id: int, backpack_id: int) -> str:
    return f"player:{player_id}:backpack:{backpack_id}:roomHistory"
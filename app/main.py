from app.routers import player, room  # 引入 player 和新开发的 room 路由

app.include_router(room.router, prefix="/room", tags=["room"])
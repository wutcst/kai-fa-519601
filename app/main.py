from app.routers import player, room  # 引入 player 和新开发的 room 路由

app.include_router(room.router, prefix="/room", tags=["room"])

# 房间路由模块挂载，用于支撑游戏内场景和物品的渲染数据交互
app.include_router(room.router, prefix="/room", tags=["room"])
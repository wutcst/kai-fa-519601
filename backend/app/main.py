from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers import player, room  # ✅ 这里加上了 room 路由
from app.utils.init_data import init_game_data


@asynccontextmanager
async def lifespan(application: FastAPI):
    await init_db()
    await init_game_data()
    yield


app = FastAPI(title="Zuulventurers Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_path = Path(settings.upload_dir)
upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")

app.include_router(player.router, prefix="/player", tags=["player"])
# ✅ 房间路由模块挂载，用于支撑游戏内场景和物品的渲染数据交互
app.include_router(room.router, prefix="/room", tags=["room"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True)
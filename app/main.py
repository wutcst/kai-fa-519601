from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers import player, room, backpack
from app.utils.init_data import init_game_data

@asynccontextmanager
async def lifespan(application: FastAPI):
    """
    FastAPI 全局生命周期管理器。
    在应用启动前 (yield 之前) 初始化数据库连接池并加载基础游戏数据；
    在应用关闭时 (yield 之后) 自动执行资源清理。
    """
    await init_db()
    await init_game_data()
    yield


app = FastAPI(title="Zuulventurers Backend", lifespan=lifespan)
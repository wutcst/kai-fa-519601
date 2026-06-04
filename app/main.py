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

# 挂载 CORS (跨域资源共享) 中间件
# 允许前端应用 (如 Vue/React) 在不同域名或端口下安全地请求后端 API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # 允许所有域名跨域（生产环境建议配置具体白名单）
    allow_credentials=True,  # 允许携带 Cookie 等凭证信息
    allow_methods=["*"],     # 允许所有 HTTP 方法 (GET, POST, PUT, DELETE 等)
    allow_headers=["*"],     # 允许所有的请求头
)

# 初始化并配置静态文件上传目录
upload_path = Path(settings.upload_dir)
upload_path.mkdir(parents=True, exist_ok=True)  # 若目录不存在则递归创建，防止启动报错
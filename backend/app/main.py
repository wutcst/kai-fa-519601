from fastapi import FastAPI

<<<<<<< HEAD
app = FastAPI(title="Zuulventurers Backend")


@app.get("/health")
async def health():
    return {"status": "ok"}
=======
from app.config import settings
from app.database import init_db
from app.routers import player, room, backpack, game
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
app.include_router(room.router, prefix="/room", tags=["room"])
app.include_router(backpack.router, prefix="/backpack", tags=["backpack"])
app.include_router(game.router, prefix="/game", tags=["game"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True)
>>>>>>> master

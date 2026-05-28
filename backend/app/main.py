from fastapi import FastAPI

app = FastAPI(title="Zuulventurers Backend")


@app.get("/health")
async def health():
    return {"status": "ok"}
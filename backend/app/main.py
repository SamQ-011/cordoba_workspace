from fastapi import FastAPI
from app.core.config import settings
from app.core.database import engine, Base
from app.models import models
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import auth, creditors, logs, updates, admin

Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="Cordoba API Professional",
    description="Backend de alta disponibilidad para gestión de auditoría",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # El puerto de tu React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(creditors.router, prefix="/creditors", tags=["Creditors"])
app.include_router(logs.router, prefix="/logs", tags=["Audit Logs"])
app.include_router(updates.router, prefix="/updates", tags=["Updates"])
app.include_router(admin.router, prefix="/admin", tags=["Admin Panel"])

@app.get("/")
async def health_check():
    return {"status": "online", "system": "Cordoba Pro"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
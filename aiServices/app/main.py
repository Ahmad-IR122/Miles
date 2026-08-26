from fastapi import FastAPI

from app.routers import health, itinerary, rag

app = FastAPI()
app.include_router(health.router)
app.include_router(rag.router)
app.include_router(itinerary.router)

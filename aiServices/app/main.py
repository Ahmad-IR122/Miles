from fastapi import FastAPI

from app.routers import itinerary, rag, recommendations

app = FastAPI()
app.include_router(rag.router)
app.include_router(itinerary.router)
app.include_router(recommendations.router)

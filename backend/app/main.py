from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import activity, conversation, health, itinerary, test_db, trip

load_dotenv()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# Allowed origins come from CORS_ORIGINS so deployed environments can add their
# own frontend URL without a code change.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversation.router)
app.include_router(health.router)
app.include_router(itinerary.router)
app.include_router(trip.router)
app.include_router(test_db.router)
app.include_router(activity.router)

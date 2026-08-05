import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import health, itinerary, trip

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing from the .env file")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# Enable CORS for local frontend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(itinerary.router)
app.include_router(trip.router)

@app.get("/")
def root():
    return {"message": "FastAPI is running"}


@app.get("/test-database")
def test_database():
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("SELECT 1")
            )

            value = result.scalar()

        return {
            "connected": True,
            "message": "Successfully connected to Supabase",
            "result": value,
        }

    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(error)}",
        )
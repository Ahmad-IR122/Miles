from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.db.db import engine

router = APIRouter(prefix="/test-db", tags=["test-db"])


@router.get("")
def test_database():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))

            value = result.scalar()

        return {
            "connected": True,
            "message": "Successfully connected to Supabase",
            "result": value,
        }

    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {error!s}",
        )


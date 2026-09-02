from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core import settings

if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        # DATABASE_URL points at Supabase's pooler on port 6543, which runs
        # PgBouncer in "transaction" mode: each query can land on a
        # different physical Postgres connection behind the scenes, so
        # server-side state can't survive between them. psycopg3 normally
        # switches a statement to a named, server-side prepared statement
        # after it's been run a few times (`prepare_threshold`, default 5) —
        # under transaction pooling that statement can end up prepared on
        # one backend connection and then reused (or collide with a
        # same-named one) on another, which is exactly the
        # `DuplicatePreparedStatement` error this caused on /itinerary.
        # Setting prepare_threshold to None disables that and always uses
        # plain (unprepared) queries, which is what PgBouncer transaction
        # mode requires.
        connect_args={"prepare_threshold": None},
    )

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

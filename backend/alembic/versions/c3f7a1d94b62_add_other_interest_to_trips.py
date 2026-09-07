"""add other interest to trips

The custom "Other" interest is free text, so it gets no row in the shared,
globally-unique interests table. It still has to persist on the trip: both
generation and regeneration rebuild the AI service's interest list from the
trip, and without this column the traveler's own interest never reaches the
dataset search.

Revision ID: c3f7a1d94b62
Revises: d05126d76008
Create Date: 2026-09-07
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "c3f7a1d94b62"
down_revision: str | Sequence[str] | None = "d05126d76008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "trips",
        sa.Column("other_interest", sa.String(length=100), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("trips", "other_interest")

"""add additional notes to trips

Revision ID: f4b5987fbd21
Revises: 14d1ecb3d024
Create Date: 2026-09-01
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "f4b5987fbd21"
down_revision: str | Sequence[str] | None = "14d1ecb3d024"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("trips", sa.Column("additional_notes", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("trips", "additional_notes")

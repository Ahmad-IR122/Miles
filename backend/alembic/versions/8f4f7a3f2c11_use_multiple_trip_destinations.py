"""store multiple destinations per trip

Revision ID: 8f4f7a3f2c11
Revises: ff20b28a4d93
Create Date: 2026-08-27

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "8f4f7a3f2c11"
down_revision: str | Sequence[str] | None = "ff20b28a4d93"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("trips", sa.Column("destinations", sa.JSON(), nullable=True))
    op.execute(
        sa.text(
            "UPDATE trips SET destinations = "
            "json_build_array(json_build_object('country', destination, "
            "'city', '', 'days', 1))"
        )
    )
    op.alter_column("trips", "destinations", nullable=False)
    op.drop_column("trips", "destination")


def downgrade() -> None:
    op.add_column(
        "trips", sa.Column("destination", sa.String(length=150), nullable=True)
    )
    op.execute(sa.text("UPDATE trips SET destination = destinations->0->>'country'"))
    op.alter_column("trips", "destination", nullable=False)
    op.drop_column("trips", "destinations")

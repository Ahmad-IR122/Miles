"""add adults and children to trips

Revision ID: d05126d76008
Revises: f4b5987fbd21
Create Date: 2026-09-02 10:55:39.782842

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'd05126d76008'
down_revision: Union[str, Sequence[str], None] = 'f4b5987fbd21'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column(
        "trips",
        sa.Column("adults", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column(
        "trips",
        sa.Column("children", sa.Integer(), nullable=False, server_default="0"),
    )

def downgrade() -> None:
    op.drop_column("trips", "children")
    op.drop_column("trips", "adults")
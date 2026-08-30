"""merge heads

Revision ID: 14d1ecb3d024
Revises: 7c4a9b2d1f80, 8f4f7a3f2c11
Create Date: 2026-08-30 10:48:55.215085

"""
from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = '14d1ecb3d024'
down_revision: Union[str, Sequence[str], None] = ('7c4a9b2d1f80', '8f4f7a3f2c11')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

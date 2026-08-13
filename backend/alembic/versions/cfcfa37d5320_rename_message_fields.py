"""restore messages table with query and answer fields

Revision ID: cfcfa37d5320
Revises: d040c736ae8e
Create Date: 2026-08-12 10:59:23.247012

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "cfcfa37d5320"
down_revision: str | Sequence[str] | None = "d040c736ae8e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column(
        "messages",
        "role",
        new_column_name="user_query",
    )

    op.alter_column(
        "messages",
        "content",
        new_column_name="answer",
    )


def downgrade() -> None:
    op.alter_column(
        "messages",
        "user_query",
        new_column_name="role",
    )

    op.alter_column(
        "messages",
        "answer",
        new_column_name="content",
    )

"""rename message fields

Revision ID: bfa5321e2a92
Revises: cfcfa37d5320
Create Date: 2026-08-12 11:03:41.468366

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "bfa5321e2a92"
down_revision: str | Sequence[str] | None = "cfcfa37d5320"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'messages'
                  AND column_name = 'role'
            )
            AND NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'messages'
                  AND column_name = 'user_query'
            )
            THEN
                ALTER TABLE messages RENAME COLUMN role TO user_query;
            END IF;

            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'messages'
                  AND column_name = 'content'
            )
            AND NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'messages'
                  AND column_name = 'answer'
            )
            THEN
                ALTER TABLE messages RENAME COLUMN content TO answer;
            END IF;
        END $$;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'messages'
                  AND column_name = 'user_query'
            )
            AND NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'messages'
                  AND column_name = 'role'
            )
            THEN
                ALTER TABLE messages RENAME COLUMN user_query TO role;
            END IF;

            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'messages'
                  AND column_name = 'answer'
            )
            AND NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'messages'
                  AND column_name = 'content'
            )
            THEN
                ALTER TABLE messages RENAME COLUMN answer TO content;
            END IF;
        END $$;
        """
    )

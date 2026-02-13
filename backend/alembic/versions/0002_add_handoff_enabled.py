"""add handoff flag to conversations

Revision ID: 0002_add_handoff_enabled
Revises: 0001_create_messages
Create Date: 2026-02-13
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_add_handoff_enabled"
down_revision = "0001_create_messages"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("conversations", sa.Column("handoff_enabled", sa.Boolean(), server_default=sa.false(), nullable=False))


def downgrade() -> None:
    op.drop_column("conversations", "handoff_enabled")

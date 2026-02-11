"""create messages table

Revision ID: 0001
Revises: 
Create Date: 2026-02-11
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("channel", sa.String(length=50), nullable=False),
        sa.Column("user_id", sa.String(length=128), nullable=True),
        sa.Column("user_message", sa.Text(), nullable=False),
        sa.Column("bot_message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_messages_channel", "messages", ["channel"])


def downgrade() -> None:
    op.drop_index("ix_messages_channel", table_name="messages")
    op.drop_table("messages")

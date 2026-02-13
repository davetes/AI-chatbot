"""create core tables

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
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("users"):
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("platform", sa.String(length=50), nullable=False),
            sa.Column("external_id", sa.String(length=128), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
        )
    user_indexes = {idx["name"] for idx in inspector.get_indexes("users")} if inspector.has_table("users") else set()
    if "ix_users_platform" not in user_indexes:
        op.create_index("ix_users_platform", "users", ["platform"])
    if "ix_users_external_id" not in user_indexes:
        op.create_index("ix_users_external_id", "users", ["external_id"])

    if not inspector.has_table("conversations"):
        op.create_table(
            "conversations",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("platform", sa.String(length=50), nullable=False),
            sa.Column("status", sa.String(length=20), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
        )
    conversation_indexes = {idx["name"] for idx in inspector.get_indexes("conversations")} if inspector.has_table("conversations") else set()
    if "ix_conversations_user_id" not in conversation_indexes:
        op.create_index("ix_conversations_user_id", "conversations", ["user_id"])
    if "ix_conversations_platform" not in conversation_indexes:
        op.create_index("ix_conversations_platform", "conversations", ["platform"])

    if not inspector.has_table("messages"):
        op.create_table(
            "messages",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("conversation_id", sa.Integer(), sa.ForeignKey("conversations.id"), nullable=False),
            sa.Column("sender", sa.String(length=10), nullable=False),
            sa.Column("content", sa.Text(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
        )
    message_indexes = {idx["name"] for idx in inspector.get_indexes("messages")} if inspector.has_table("messages") else set()
    if "ix_messages_conversation_id" not in message_indexes:
        op.create_index("ix_messages_conversation_id", "messages", ["conversation_id"])

    if not inspector.has_table("leads"):
        op.create_table(
            "leads",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("name", sa.String(length=128), nullable=True),
            sa.Column("phone", sa.String(length=64), nullable=True),
            sa.Column("email", sa.String(length=128), nullable=True),
            sa.Column("platform", sa.String(length=50), nullable=False),
            sa.Column("intent", sa.String(length=256), nullable=True),
            sa.Column("conversation_id", sa.Integer(), sa.ForeignKey("conversations.id"), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
        )
    lead_indexes = {idx["name"] for idx in inspector.get_indexes("leads")} if inspector.has_table("leads") else set()
    if "ix_leads_platform" not in lead_indexes:
        op.create_index("ix_leads_platform", "leads", ["platform"])


def downgrade() -> None:
    op.drop_index("ix_leads_platform", table_name="leads")
    op.drop_table("leads")
    op.drop_index("ix_messages_conversation_id", table_name="messages")
    op.drop_table("messages")
    op.drop_index("ix_conversations_platform", table_name="conversations")
    op.drop_index("ix_conversations_user_id", table_name="conversations")
    op.drop_table("conversations")
    op.drop_index("ix_users_external_id", table_name="users")
    op.drop_index("ix_users_platform", table_name="users")
    op.drop_table("users")

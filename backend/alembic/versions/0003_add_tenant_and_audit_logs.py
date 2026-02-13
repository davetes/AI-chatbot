"""add tenant id and audit logs

Revision ID: 0003_add_tenant_and_audit_logs
Revises: 0002_add_handoff_enabled
Create Date: 2026-02-13
"""

from alembic import op
import sqlalchemy as sa

revision = "0003_add_tenant_and_audit_logs"
down_revision = "0002_add_handoff_enabled"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("tenant_id", sa.String(length=64), server_default="default", nullable=False))
    op.add_column("conversations", sa.Column("tenant_id", sa.String(length=64), server_default="default", nullable=False))
    op.add_column("messages", sa.Column("tenant_id", sa.String(length=64), server_default="default", nullable=False))
    op.add_column("leads", sa.Column("tenant_id", sa.String(length=64), server_default="default", nullable=False))
    op.create_index("ix_users_tenant_id", "users", ["tenant_id"], unique=False)
    op.create_index("ix_conversations_tenant_id", "conversations", ["tenant_id"], unique=False)
    op.create_index("ix_messages_tenant_id", "messages", ["tenant_id"], unique=False)
    op.create_index("ix_leads_tenant_id", "leads", ["tenant_id"], unique=False)

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("actor", sa.String(length=128), nullable=False, server_default="system"),
        sa.Column("action", sa.String(length=128), nullable=False),
        sa.Column("detail", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_audit_logs_tenant_id", "audit_logs", ["tenant_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_audit_logs_tenant_id", table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index("ix_leads_tenant_id", table_name="leads")
    op.drop_index("ix_messages_tenant_id", table_name="messages")
    op.drop_index("ix_conversations_tenant_id", table_name="conversations")
    op.drop_index("ix_users_tenant_id", table_name="users")
    op.drop_column("leads", "tenant_id")
    op.drop_column("messages", "tenant_id")
    op.drop_column("conversations", "tenant_id")
    op.drop_column("users", "tenant_id")

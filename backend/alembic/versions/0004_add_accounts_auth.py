"""add accounts table for auth

Revision ID: 0004_add_accounts_auth
Revises: 0003_add_tenant_and_audit_logs
Create Date: 2026-02-14
"""

from alembic import op
import sqlalchemy as sa

revision = "0004_add_accounts_auth"
down_revision = "0003_add_tenant_and_audit_logs"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("accounts"):
        op.create_table(
            "accounts",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("tenant_id", sa.String(length=64), nullable=False, server_default="default"),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("password_hash", sa.String(length=255), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
        )

    indexes = {idx["name"] for idx in inspector.get_indexes("accounts")} if inspector.has_table("accounts") else set()
    if "ix_accounts_tenant_id" not in indexes:
        op.create_index("ix_accounts_tenant_id", "accounts", ["tenant_id"], unique=False)
    if "ix_accounts_email" not in indexes:
        op.create_index("ix_accounts_email", "accounts", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_accounts_email", table_name="accounts")
    op.drop_index("ix_accounts_tenant_id", table_name="accounts")
    op.drop_table("accounts")

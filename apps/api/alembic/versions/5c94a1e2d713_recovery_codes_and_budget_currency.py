"""add recovery codes and budget currency

Revision ID: 5c94a1e2d713
Revises: 419e7a76e62a
Create Date: 2026-11-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "5c94a1e2d713"
down_revision: Union[str, Sequence[str], None] = "419e7a76e62a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "budgets",
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="USD"),
    )
    op.create_table(
        "recovery_codes",
        sa.Column("code_hash", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("code_hash"),
    )
    op.create_index(
        op.f("ix_recovery_codes_user_id"),
        "recovery_codes",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_recovery_codes_user_id"), table_name="recovery_codes")
    op.drop_table("recovery_codes")
    op.drop_column("budgets", "currency")

"""switch auth identity from email to name

Revision ID: 9f2e1d4c5b6a
Revises: 5c94a1e2d713
Create Date: 2026-11-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9f2e1d4c5b6a"
down_revision: Union[str, Sequence[str], None] = "5c94a1e2d713"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make email nullable and drop its unique index
    op.alter_column("users", "email", existing_type=sa.String(length=255), nullable=True)
    op.drop_index(op.f("ix_users_email"), table_name="users")
    # Name becomes the unique lookup key
    op.create_index(op.f("ix_users_name"), "users", ["name"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_name"), table_name="users")
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.alter_column("users", "email", existing_type=sa.String(length=255), nullable=False)

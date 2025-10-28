"""rename_hashed_password_to_password

Revision ID: 854c4d053c91
Revises: e09b65d366e4
Create Date: 2025-10-28 00:32:38.318285

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '854c4d053c91'
down_revision = 'e09b65d366e4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rename hashed_password column to password
    op.alter_column('users', 'hashed_password', new_column_name='password')


def downgrade() -> None:
    # Rename password column back to hashed_password
    op.alter_column('users', 'password', new_column_name='hashed_password')
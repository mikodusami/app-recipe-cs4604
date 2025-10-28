"""remove_password_column

Revision ID: d7b538646a35
Revises: 854c4d053c91
Create Date: 2025-10-28 12:28:15.378157

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd7b538646a35'
down_revision = '854c4d053c91'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Remove password column from users table
    op.drop_column('users', 'password')


def downgrade() -> None:
    # Add password column back (for rollback)
    op.add_column('users', sa.Column('password', sa.String(), nullable=False, server_default=''))
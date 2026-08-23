"""subscriber double opt-in

Revision ID: d7f3a9c1b2e4
Revises: c5024cdcaeef
Create Date: 2026-08-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd7f3a9c1b2e4'
down_revision: Union[str, None] = 'c5024cdcaeef'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('subscribers', sa.Column('confirm_token', sa.String(length=64), nullable=True))
    op.add_column('subscribers', sa.Column('confirmed_at', sa.DateTime(timezone=True), nullable=True))
    op.create_index(
        op.f('ix_subscribers_confirm_token'), 'subscribers', ['confirm_token'], unique=True
    )
    # Existing subscribers predate double opt-in: treat them as already confirmed.
    op.execute("UPDATE subscribers SET confirmed_at = created_at WHERE status = 'active'")


def downgrade() -> None:
    op.drop_index(op.f('ix_subscribers_confirm_token'), table_name='subscribers')
    op.drop_column('subscribers', 'confirmed_at')
    op.drop_column('subscribers', 'confirm_token')

import enum
import secrets
from datetime import datetime, UTC

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from server import Base


def _token() -> str:
    """Opaque token for the self-service links sent by email."""
    return secrets.token_urlsafe(32)


class SubscriberStatus(str, enum.Enum):
    active = "active"              # no TV: receives the reminders
    exited = "exited"             # declared they now own a TV -> guided exit
    unsubscribed = "unsubscribed"  # cancelled the subscription


class ReminderResponse(str, enum.Enum):
    still_eligible = "still_eligible"  # confirmed: still without a TV set
    now_has_tv = "now_has_tv"          # now owns a TV set


class Subscriber(Base):
    __tablename__ = "subscribers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    # True = confirmed their situation at signup time.
    initial_attestation: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Selected exemption cases (ids from server.cases), e.g. ["non_detenzione", "over75"].
    cases: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=SubscriberStatus.active.value
    )

    # Opaque token for self-service unsubscribe from the email links.
    unsubscribe_token: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, default=_token
    )

    # --- Evidence trail of the initial self-declaration ---
    # A boolean is not enough: we need who/when/from where/on which exact text.
    attestation_text_version: Mapped[str] = mapped_column(String(20), nullable=False, default="v1")
    signup_ip: Mapped[str | None] = mapped_column(String(64))
    signup_user_agent: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )

    reminders: Mapped[list["ReminderEvent"]] = relationship(
        back_populates="subscriber", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Subscriber {self.email} status={self.status}>"


class ReminderEvent(Base):
    __tablename__ = "reminder_events"
    # One reminder per subscriber per declaration year.
    __table_args__ = (UniqueConstraint("subscriber_id", "year", name="uq_reminder_subscriber_year"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subscriber_id: Mapped[int] = mapped_column(
        ForeignKey("subscribers.id", ondelete="CASCADE"), index=True, nullable=False
    )

    # Declaration year the reminder refers to.
    year: Mapped[int] = mapped_column(Integer, nullable=False)

    # Opaque token used in the confirmation links inside the email.
    token: Mapped[str] = mapped_column(String(64), unique=True, index=True, default=_token)

    sent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    text_version: Mapped[str] = mapped_column(String(20), nullable=False, default="v1")

    # --- Citizen's active response (yearly re-attestation) ---
    response: Mapped[str | None] = mapped_column(String(20))
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    responded_ip: Mapped[str | None] = mapped_column(String(64))
    responded_user_agent: Mapped[str | None] = mapped_column(Text)

    subscriber: Mapped["Subscriber"] = relationship(back_populates="reminders")

    def __repr__(self) -> str:
        return f"<ReminderEvent sub={self.subscriber_id} year={self.year} response={self.response}>"

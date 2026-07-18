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
    """Token opaco per i link self-service inviati via email."""
    return secrets.token_urlsafe(32)


class SubscriberStatus(str, enum.Enum):
    active = "active"              # senza TV: riceve i promemoria
    exited = "exited"             # ha dichiarato di possedere una TV -> uscita guidata
    unsubscribed = "unsubscribed"  # ha annullato l'iscrizione


class ReminderResponse(str, enum.Enum):
    still_eligible = "still_eligible"  # confermato: ancora senza apparecchio TV
    now_has_tv = "now_has_tv"          # ora possiede un apparecchio TV


class Subscriber(Base):
    __tablename__ = "subscribers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    # True = ha confermato la propria situazione al momento dell'iscrizione.
    initial_attestation: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Casi di esonero selezionati (id da server.cases), es. ["no_tv", "over75"].
    cases: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=SubscriberStatus.active.value
    )

    # Token opaco per l'annullamento self-service dai link email.
    unsubscribe_token: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, default=_token
    )

    # --- Traccia probatoria dell'autocertificazione iniziale ---
    # Non basta un booleano: serve chi/quando/da dove/su quale testo esatto.
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
    # Un solo promemoria per iscritto per anno di dichiarazione.
    __table_args__ = (UniqueConstraint("subscriber_id", "year", name="uq_reminder_subscriber_year"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subscriber_id: Mapped[int] = mapped_column(
        ForeignKey("subscribers.id", ondelete="CASCADE"), index=True, nullable=False
    )

    # Anno della dichiarazione a cui si riferisce il promemoria.
    year: Mapped[int] = mapped_column(Integer, nullable=False)

    # Token opaco usato nei link di conferma dentro l'email.
    token: Mapped[str] = mapped_column(String(64), unique=True, index=True, default=_token)

    sent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    text_version: Mapped[str] = mapped_column(String(20), nullable=False, default="v1")

    # --- Risposta attiva del cittadino (ri-attestazione annuale) ---
    response: Mapped[str | None] = mapped_column(String(20))
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    responded_ip: Mapped[str | None] = mapped_column(String(64))
    responded_user_agent: Mapped[str | None] = mapped_column(Text)

    subscriber: Mapped["Subscriber"] = relationship(back_populates="reminders")

    def __repr__(self) -> str:
        return f"<ReminderEvent sub={self.subscriber_id} year={self.year} response={self.response}>"

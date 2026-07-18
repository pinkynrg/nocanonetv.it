"""Invia il promemoria annuale del canone TV agli iscritti attivi.

Non è un daemon: lo si lancia a mano (o via cron) nella finestra utile,
tipicamente a dicembre per l'esonero dell'intero anno successivo.

Esempi (dalla root del repo):

    # anteprima a schermo, nessun invio reale
    PYTHONPATH=$(pwd) uv run --project server python -m server.send_reminders --dry-run

    # invio reale (usa EMAIL_BACKEND dalle settings, es. resend)
    PYTHONPATH=$(pwd) uv run --project server python -m server.send_reminders

    # simula una data / forza un anno (test)
    PYTHONPATH=$(pwd) uv run --project server python -m server.send_reminders \
        --today 2026-12-15 --dry-run
"""
from __future__ import annotations

import argparse
import logging
from datetime import date

from sqlalchemy import select

from server import SessionLocal
from server.canone import deadline_note, reference_year, window_open
from server.cases import has_yearly
from server.email_sender import ConsoleEmailSender, get_email_sender
from server.emails import TEXT_VERSION, build_reminder
from server.models import ReminderEvent, Subscriber, SubscriberStatus

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("norai.send_reminders")


def run(today: date, year: int, dry_run: bool, limit: int | None) -> None:
    sender = ConsoleEmailSender() if dry_run else get_email_sender()

    if not window_open(today, year):
        logger.warning(
            "Fuori dalla finestra utile per il %s (oggi=%s). Proseguo comunque.",
            year,
            today.isoformat(),
        )

    note = deadline_note(year, today)
    db = SessionLocal()
    sent = already = failed = 0
    try:
        active = db.scalars(
            select(Subscriber).where(Subscriber.status == SubscriberStatus.active.value)
        ).all()
        # Solo chi ha almeno un caso di non detenzione (Quadro A) va rinnovato
        # ogni anno; i casi una tantum non ricevono il promemoria annuale.
        active = [s for s in active if has_yearly(s.cases)]
        logger.info(
            "Iscritti con promemoria annuale: %d | anno di riferimento: %d",
            len(active),
            year,
        )

        for sub in active:
            if limit is not None and sent >= limit:
                logger.info("Raggiunto --limit %d, stop.", limit)
                break

            existing = db.scalar(
                select(ReminderEvent).where(
                    ReminderEvent.subscriber_id == sub.id, ReminderEvent.year == year
                )
            )
            if existing is not None:
                already += 1
                continue

            event = ReminderEvent(
                subscriber_id=sub.id, year=year, text_version=TEXT_VERSION
            )
            db.add(event)
            db.flush()  # genera token e sent_at prima di costruire l'email

            try:
                sender.send(build_reminder(sub, event, note))
            except Exception:
                db.rollback()  # non registrare l'evento se l'invio è fallito
                failed += 1
                logger.exception("Invio fallito per %s", sub.email)
                continue

            db.commit()
            sent += 1

        logger.info(
            "Fatto. Inviati: %d | già inviati quest'anno: %d | falliti: %d",
            sent,
            already,
            failed,
        )
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Invia i promemoria del canone TV.")
    parser.add_argument(
        "--today",
        type=date.fromisoformat,
        default=None,
        help="Sovrascrive la data odierna (YYYY-MM-DD), per test.",
    )
    parser.add_argument(
        "--year",
        type=int,
        default=None,
        help="Forza l'anno di dichiarazione (default: calcolato dalla finestra).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Stampa le email a schermo senza inviarle (forza backend console).",
    )
    parser.add_argument(
        "--limit", type=int, default=None, help="Invia al massimo N promemoria."
    )
    args = parser.parse_args()

    today = args.today or date.today()
    year = args.year or reference_year(today)
    run(today=today, year=year, dry_run=args.dry_run, limit=args.limit)


if __name__ == "__main__":
    main()

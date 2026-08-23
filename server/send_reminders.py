"""Send the yearly TV licence reminder to active subscribers.

Not a daemon: run it by hand (or via cron) inside the useful window, typically
in December for the next full year's exemption.

Examples (from the repo root):

    # preview to stdout, no real send
    PYTHONPATH=$(pwd) uv run --project server python -m server.send_reminders --dry-run

    # real send (uses EMAIL_BACKEND from settings, e.g. resend)
    PYTHONPATH=$(pwd) uv run --project server python -m server.send_reminders

    # simulate a date / force a year (testing)
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
logger = logging.getLogger("nocanonetv.send_reminders")


def run(today: date, year: int, dry_run: bool, limit: int | None) -> None:
    sender = ConsoleEmailSender() if dry_run else get_email_sender()

    if not window_open(today, year):
        logger.warning(
            "Outside the useful window for %s (today=%s). Proceeding anyway.",
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
        # Only subscribers with at least one non-detention case (Quadro A) must
        # re-file every year; one-off cases don't get the yearly reminder.
        active = [s for s in active if has_yearly(s.cases)]
        logger.info(
            "Subscribers with yearly reminder: %d | reference year: %d",
            len(active),
            year,
        )

        for sub in active:
            if limit is not None and sent >= limit:
                logger.info("Reached --limit %d, stopping.", limit)
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
            db.flush()  # generate token and sent_at before building the email

            try:
                sender.send(build_reminder(sub, event, note))
            except Exception:
                db.rollback()  # don't record the event if the send failed
                failed += 1
                logger.exception("Send failed for %s", sub.email)
                continue

            db.commit()
            sent += 1

        logger.info(
            "Done. Sent: %d | already sent this year: %d | failed: %d",
            sent,
            already,
            failed,
        )
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Send the TV licence reminders.")
    parser.add_argument(
        "--today",
        type=date.fromisoformat,
        default=None,
        help="Override today's date (YYYY-MM-DD), for testing.",
    )
    parser.add_argument(
        "--year",
        type=int,
        default=None,
        help="Force the declaration year (default: computed from the window).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the emails to stdout without sending (forces the console backend).",
    )
    parser.add_argument(
        "--limit", type=int, default=None, help="Send at most N reminders."
    )
    args = parser.parse_args()

    today = args.today or date.today()
    year = args.year or reference_year(today)
    run(today=today, year=year, dry_run=args.dry_run, limit=args.limit)


if __name__ == "__main__":
    main()

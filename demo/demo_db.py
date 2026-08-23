"""Database side of the demo recording.

demo/record.mjs drives the browser; the two things it cannot get from the
browser are the opaque tokens that normally arrive by email. They are read
here straight from the database rather than scraped out of the console email
backend's stdout, so the tape does not depend on how logging happens to be
plumbed when it runs.

    python demo/demo_db.py reset            # forget the demo subscriber
    python demo/demo_db.py confirm-token    # double opt-in token
    python demo/demo_db.py reminder-token   # latest yearly reminder token

Run from the repo root with PYTHONPATH set, the way the Makefile does it.
"""
from __future__ import annotations

import argparse
import sys

from sqlalchemy import delete, select

from server import SessionLocal
from server.models import ReminderEvent, Subscriber

# The subscriber the tape signs up. Fixed, so a re-record starts from the same
# state as the last one, and example.com is reserved by RFC 2606 so no real
# address can ever end up in the recording.
DEMO_EMAIL = "giulia.rossi@example.com"


def reset(db) -> None:
    """Remove the demo subscriber and, by cascade, its reminder events."""
    db.execute(delete(Subscriber).where(Subscriber.email == DEMO_EMAIL))
    db.commit()


def confirm_token(db) -> str:
    subscriber = db.scalar(select(Subscriber).where(Subscriber.email == DEMO_EMAIL))
    if subscriber is None:
        raise SystemExit(f"no subscriber {DEMO_EMAIL}: has the tape signed up yet?")
    if subscriber.confirm_token is None:
        raise SystemExit(f"{DEMO_EMAIL} is already confirmed, so it has no token left")
    return subscriber.confirm_token


def reminder_token(db) -> str:
    event = db.scalar(
        select(ReminderEvent)
        .join(Subscriber)
        .where(Subscriber.email == DEMO_EMAIL)
        .order_by(ReminderEvent.year.desc())
    )
    if event is None:
        raise SystemExit(f"no reminder for {DEMO_EMAIL}: has send_reminders run?")
    return event.token


COMMANDS = {
    "reset": reset,
    "confirm-token": confirm_token,
    "reminder-token": reminder_token,
}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=sorted(COMMANDS))
    args = parser.parse_args()

    db = SessionLocal()
    try:
        result = COMMANDS[args.command](db)
    finally:
        db.close()

    # Only the token, with no trailing newline noise around it: record.mjs
    # reads this straight into a URL.
    if result is not None:
        sys.stdout.write(result)


if __name__ == "__main__":
    main()

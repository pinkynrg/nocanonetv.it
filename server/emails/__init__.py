"""Builds the emails from file templates.

Templates live in this folder as .html and .txt files. Placeholders use the
{{name}} syntax (compatible with BeeFree merge tags): you can regenerate the
.html with BeeFree keeping the same {{tag}}s and the backend keeps working with
no changes. See README.md in this folder.
"""
from __future__ import annotations

from pathlib import Path

from server.cases import doc_url_for, has_yearly
from server.config import settings
from server.email_sender import EmailMessage
from server.models import ReminderEvent, Subscriber

# Version of the text shown to the user. Bump on any substantial change: it is
# stored with every attestation as an evidence trail (who accepted EXACTLY
# what). See brief 5.b.
TEXT_VERSION = "v1"

# OFFICIAL Agenzia delle Entrate channel. nocanonetv.it NEVER collects nor
# transmits the declaration: always link here. See brief 8.1.
OFFICIAL_ADE_URL = (
    "https://www.agenziaentrate.gov.it/portale/it/web/guest/schede/"
    "agevolazioni/canone-tv/dichiarazione-sostitutiva-canone-tv-cittadini"
)

_TEMPLATES_DIR = Path(__file__).resolve().parent


def _base() -> str:
    return settings.app_base_url.rstrip("/")


def unsubscribe_url(subscriber: Subscriber) -> str:
    return f"{_base()}/annulla/{subscriber.unsubscribe_token}"


def confirm_url(event: ReminderEvent) -> str:
    return f"{_base()}/conferma/{event.token}"


def _render(template_name: str, context: dict[str, str]) -> str:
    text = (_TEMPLATES_DIR / template_name).read_text(encoding="utf-8")
    for key, value in context.items():
        text = text.replace("{{" + key + "}}", value)
    return text


def build_welcome(subscriber: Subscriber) -> EmailMessage:
    if has_yearly(subscriber.cases):
        # At least one non-detention case: yearly reminder is active.
        context = {
            "name": subscriber.name,
            "official_url": OFFICIAL_ADE_URL,
            "unsubscribe_url": unsubscribe_url(subscriber),
        }
        return EmailMessage(
            to=subscriber.email,
            subject="nocanonetv.it — sei iscritto al promemoria del canone TV",
            html=_render("welcome.html", context),
            text=_render("welcome.txt", context),
        )
    # One-off cases only: no yearly reminder, just the initial guide, with the
    # official link specific to the chosen case.
    context = {
        "name": subscriber.name,
        "official_url": doc_url_for(subscriber.cases, OFFICIAL_ADE_URL),
        "unsubscribe_url": unsubscribe_url(subscriber),
    }
    return EmailMessage(
        to=subscriber.email,
        subject="nocanonetv.it — come ottenere l'esonero dal canone TV",
        html=_render("welcome_onetime.html", context),
        text=_render("welcome_onetime.txt", context),
    )


def build_reminder(
    subscriber: Subscriber, event: ReminderEvent, deadline_note: str
) -> EmailMessage:
    context = {
        "name": subscriber.name,
        "year": str(event.year),
        "deadline_note": deadline_note,
        "confirm_url": confirm_url(event),
        "unsubscribe_url": unsubscribe_url(subscriber),
        "official_url": OFFICIAL_ADE_URL,
    }
    return EmailMessage(
        to=subscriber.email,
        subject=f"nocanonetv.it — rinnova la dichiarazione canone TV per il {event.year}",
        html=_render("reminder.html", context),
        text=_render("reminder.txt", context),
    )

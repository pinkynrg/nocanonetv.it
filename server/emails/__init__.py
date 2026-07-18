"""Costruzione delle email a partire da template su file.

I template vivono in questa cartella come file .html e .txt. I segnaposto
usano la sintassi {{nome}} (compatibile con i merge tag di BeeFree): puoi
rigenerare gli .html con BeeFree mantenendo gli stessi {{tag}} e il backend
continuerà a funzionare senza modifiche. Vedi README.md in questa cartella.
"""
from __future__ import annotations

from pathlib import Path

from server.cases import doc_url_for, has_yearly
from server.config import settings
from server.email_sender import EmailMessage
from server.models import ReminderEvent, Subscriber

# Versione del testo mostrato all'utente. Va incrementata a ogni modifica
# sostanziale: viene salvata insieme a ogni attestazione come traccia
# probatoria (chi ha accettato ESATTAMENTE cosa). Vedi brief 5.b.
TEXT_VERSION = "v1"

# Canale UFFICIALE dell'Agenzia delle Entrate. nocanonetv.it NON raccoglie mai la
# dichiarazione né la trasmette: rimanda sempre qui. Vedi brief 8.1.
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
        # Almeno un caso di non detenzione: promemoria annuale attivo.
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
    # Solo casi una tantum: nessun promemoria annuale, solo la guida iniziale,
    # con il link ufficiale specifico del caso scelto.
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

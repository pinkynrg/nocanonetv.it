from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Protocol

import httpx

from server.config import settings

logger = logging.getLogger("nocanonetv.email")


@dataclass
class EmailMessage:
    to: str
    subject: str
    html: str
    text: str


class EmailSender(Protocol):
    def send(self, message: EmailMessage) -> None: ...


class ConsoleEmailSender:
    """Prints the email to stdout. No real send (dev / dry-run)."""

    def send(self, message: EmailMessage) -> None:
        print("\n" + "=" * 72)
        print(f"[EMAIL -> {message.to}]  from: {settings.email_from}")
        print(f"Subject: {message.subject}")
        print("-" * 72)
        print(message.text)
        print("=" * 72 + "\n")


class ResendEmailSender:
    """Real send via the Resend API (https://resend.com/docs/api-reference)."""

    API_URL = "https://api.resend.com/emails"

    def __init__(self, api_key: str, sender: str) -> None:
        if not api_key:
            raise RuntimeError(
                "RESEND_API_KEY missing: cannot use the 'resend' email backend."
            )
        self._api_key = api_key
        self._sender = sender

    def send(self, message: EmailMessage) -> None:
        resp = httpx.post(
            self.API_URL,
            headers={"Authorization": f"Bearer {self._api_key}"},
            json={
                "from": self._sender,
                "to": [message.to],
                "subject": message.subject,
                "html": message.html,
                "text": message.text,
            },
            timeout=15.0,
        )
        resp.raise_for_status()
        logger.info("Email sent to %s (id=%s)", message.to, resp.json().get("id"))


def get_email_sender() -> EmailSender:
    """Return the sender configured via EMAIL_BACKEND (console | resend)."""
    backend = settings.email_backend.lower()
    if backend == "resend":
        return ResendEmailSender(settings.resend_api_key, settings.email_from)
    if backend == "console":
        return ConsoleEmailSender()
    raise RuntimeError(
        f"Unknown EMAIL_BACKEND: {settings.email_backend!r} (use 'console' or 'resend')."
    )

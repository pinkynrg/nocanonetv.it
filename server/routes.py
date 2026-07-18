import logging
from datetime import date, datetime, UTC

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from server import get_db
from server.canone import deadline_note, reference_year
from server.emails import OFFICIAL_ADE_URL, TEXT_VERSION, build_welcome
from server.email_sender import get_email_sender
from server.models import ReminderEvent, ReminderResponse, Subscriber, SubscriberStatus
from server.schemas import (
    ReminderContext,
    RespondRequest,
    RespondResponse,
    SubscribeRequest,
    SubscribeResponse,
    UnsubscribeContext,
    UnsubscribeResponse,
)

logger = logging.getLogger("norai.routes")

router = APIRouter(prefix="/api")


def _client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


@router.get("/")
def server_up():
    return "server is up!"


@router.post("/subscribe", response_model=SubscribeResponse)
def subscribe(payload: SubscribeRequest, request: Request, db: Session = Depends(get_db)):
    email = payload.email.lower()
    ip = _client_ip(request)
    ua = request.headers.get("user-agent")

    subscriber = db.scalar(select(Subscriber).where(Subscriber.email == email))
    if subscriber is None:
        subscriber = Subscriber(name=payload.name, email=email)
        db.add(subscriber)

    # Iscrizione o ri-attivazione: aggiorna sempre la traccia dell'autocertificazione.
    subscriber.name = payload.name
    subscriber.status = SubscriberStatus.active.value
    subscriber.initial_attestation = True
    subscriber.cases = payload.cases
    subscriber.attestation_text_version = TEXT_VERSION
    subscriber.signup_ip = ip
    subscriber.signup_user_agent = ua

    db.commit()
    db.refresh(subscriber)

    try:
        get_email_sender().send(build_welcome(subscriber))
    except Exception:  # l'iscrizione resta valida anche se l'email fallisce
        logger.exception("Invio email di benvenuto fallito per %s", subscriber.email)

    return SubscribeResponse(
        ok=True,
        message="Iscrizione confermata. Ti abbiamo mandato una mail di conferma.",
    )


@router.get("/reminder/{token}", response_model=ReminderContext)
def reminder_context(token: str, db: Session = Depends(get_db)):
    event = db.scalar(select(ReminderEvent).where(ReminderEvent.token == token))
    if event is None:
        raise HTTPException(status_code=404, detail="Promemoria non trovato.")

    return ReminderContext(
        subscriber_name=event.subscriber.name,
        year=event.year,
        subscriber_status=event.subscriber.status,
        already_responded=event.response is not None,
        response=event.response,
        deadline_note=deadline_note(event.year, date.today()),
        official_url=OFFICIAL_ADE_URL,
    )


@router.post("/reminder/{token}/respond", response_model=RespondResponse)
def reminder_respond(
    token: str, payload: RespondRequest, request: Request, db: Session = Depends(get_db)
):
    event = db.scalar(select(ReminderEvent).where(ReminderEvent.token == token))
    if event is None:
        raise HTTPException(status_code=404, detail="Promemoria non trovato.")

    # Traccia probatoria della ri-attestazione attiva (ultima risposta vince).
    event.response = payload.response
    event.responded_at = datetime.now(UTC)
    event.responded_ip = _client_ip(request)
    event.responded_user_agent = request.headers.get("user-agent")

    subscriber = event.subscriber
    if payload.response == ReminderResponse.now_has_tv.value:
        # Cambio di stato: uscita guidata, niente più promemoria.
        subscriber.status = SubscriberStatus.exited.value
        message = (
            "Grazie per averlo detto. Dato che ora possiedi un apparecchio TV non devi "
            "presentare la dichiarazione di non detenzione: se l'avevi già presentata per "
            "un anno precedente valuta una dichiarazione di variazione. Ti abbiamo tolto "
            "dai promemoria."
        )
        official_url = None
    else:
        subscriber.status = SubscriberStatus.active.value
        message = (
            "Perfetto. Presenta ora la dichiarazione sul canale ufficiale dell'Agenzia "
            "delle Entrate — ricorda: la firmi e la invii tu."
        )
        official_url = OFFICIAL_ADE_URL

    db.commit()

    return RespondResponse(
        response=event.response,
        subscriber_status=subscriber.status,
        official_url=official_url,
        message=message,
    )


@router.get("/unsubscribe/{token}", response_model=UnsubscribeContext)
def unsubscribe_context(token: str, db: Session = Depends(get_db)):
    subscriber = db.scalar(
        select(Subscriber).where(Subscriber.unsubscribe_token == token)
    )
    if subscriber is None:
        raise HTTPException(status_code=404, detail="Iscrizione non trovata.")
    return UnsubscribeContext(email=subscriber.email, status=subscriber.status)


@router.post("/unsubscribe/{token}", response_model=UnsubscribeResponse)
def unsubscribe(token: str, db: Session = Depends(get_db)):
    subscriber = db.scalar(
        select(Subscriber).where(Subscriber.unsubscribe_token == token)
    )
    if subscriber is None:
        raise HTTPException(status_code=404, detail="Iscrizione non trovata.")

    subscriber.status = SubscriberStatus.unsubscribed.value
    db.commit()
    return UnsubscribeResponse(
        ok=True, message="Iscrizione annullata. Non riceverai più promemoria."
    )

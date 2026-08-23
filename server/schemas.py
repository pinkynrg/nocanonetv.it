from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from server.cases import normalize


class SubscribeRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    # Selected exemption cases (at least one valid).
    cases: list[str] = Field(min_length=1)

    @field_validator("name")
    @classmethod
    def _strip_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Il nome è obbligatorio.")
        return v

    @field_validator("cases")
    @classmethod
    def _check_cases(cls, v: list[str]) -> list[str]:
        v = normalize(v)
        if not v:
            raise ValueError("Seleziona almeno un caso valido.")
        return v


class SubscribeResponse(BaseModel):
    ok: bool
    message: str


class ReminderContext(BaseModel):
    subscriber_name: str
    year: int
    subscriber_status: str
    already_responded: bool
    response: Optional[str]
    deadline_note: str
    official_url: str


class RespondRequest(BaseModel):
    response: Literal["still_eligible", "now_has_tv"]


class RespondResponse(BaseModel):
    response: str
    subscriber_status: str
    official_url: Optional[str]
    message: str


class UnsubscribeContext(BaseModel):
    email: str
    status: str


class UnsubscribeResponse(BaseModel):
    ok: bool
    message: str

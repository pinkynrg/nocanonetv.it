"""TV licence exemption cases the user can select.

Key distinction:
- YEARLY: NON-detention cases (Quadro A). The declaration must be re-filed
  EVERY YEAR -> these need the yearly reminder.
- ONETIME: over 75, licence already paid by a family member (Quadro B),
  foreign diplomats/military. One-off (or auto-renewing) -> no yearly reminder,
  just an initial how-to guide.
"""
from __future__ import annotations

# 3 cases aligned with the official Agenzia delle Entrate pages.
# case id -> must re-file every year?
#   non_detenzione (Quadro A: no TV / PC-monitor only / Quadro B licence
#     already paid within the family) -> YEARLY
#   over75, diplomat -> one-off
YEARLY_CASES = {"non_detenzione"}
ONETIME_CASES = {"over75", "diplomat"}
ALLOWED_CASES = YEARLY_CASES | ONETIME_CASES

# Official Agenzia delle Entrate page for each case.
CASE_DOC_URLS = {
    "non_detenzione": "https://www.agenziaentrate.gov.it/portale/aree-tematiche/canone-tv/casi-di-esonero/cittadini-che-non-detengono-tv",
    "over75": "https://www.agenziaentrate.gov.it/portale/aree-tematiche/canone-tv/casi-di-esonero/ultrasettantacinquenni",
    "diplomat": "https://www.agenziaentrate.gov.it/portale/web/guest/aree-tematiche/canone-tv/casi-di-esonero/diplomatici-e-militari-stranieri",
}


def doc_url_for(cases: list[str], fallback: str) -> str:
    """Official URL of the first selected case that has a dedicated page."""
    for c in cases:
        if c in CASE_DOC_URLS:
            return CASE_DOC_URLS[c]
    return fallback


def normalize(cases: list[str]) -> list[str]:
    """Keep only valid cases, no duplicates, stable order."""
    seen = []
    for c in cases:
        if c in ALLOWED_CASES and c not in seen:
            seen.append(c)
    return seen


def has_yearly(cases: list[str]) -> bool:
    """True if at least one case requires yearly re-filing."""
    return bool(set(cases) & YEARLY_CASES)

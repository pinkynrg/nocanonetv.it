"""Casi di esonero dal canone TV selezionabili dall'utente.

Distinzione chiave:
- YEARLY: casi di NON detenzione (Quadro A). La dichiarazione va ripresentata
  OGNI ANNO -> per questi serve il promemoria annuale.
- ONETIME: over 75, canone già assolto da familiare (Quadro B), diplomatici/
  militari stranieri. Una tantum (o si rinnovano da soli) -> nessun promemoria
  annuale, solo una guida iniziale su come fare.
"""
from __future__ import annotations

# 3 casi allineati alle pagine ufficiali dell'Agenzia delle Entrate.
# id caso -> deve ripresentare ogni anno?
#   non_detenzione (Quadro A: nessuna TV / solo PC-monitor / Quadro B canone
#     già assolto in famiglia) -> ANNUALE
#   over75, diplomat -> una tantum
YEARLY_CASES = {"non_detenzione"}
ONETIME_CASES = {"over75", "diplomat"}
ALLOWED_CASES = YEARLY_CASES | ONETIME_CASES

# Pagina ufficiale dell'Agenzia delle Entrate per ciascun caso.
CASE_DOC_URLS = {
    "non_detenzione": "https://www.agenziaentrate.gov.it/portale/aree-tematiche/canone-tv/casi-di-esonero/cittadini-che-non-detengono-tv",
    "over75": "https://www.agenziaentrate.gov.it/portale/aree-tematiche/canone-tv/casi-di-esonero/ultrasettantacinquenni",
    "diplomat": "https://www.agenziaentrate.gov.it/portale/web/guest/aree-tematiche/canone-tv/casi-di-esonero/diplomatici-e-militari-stranieri",
}


def doc_url_for(cases: list[str], fallback: str) -> str:
    """URL ufficiale del primo caso selezionato con una pagina dedicata."""
    for c in cases:
        if c in CASE_DOC_URLS:
            return CASE_DOC_URLS[c]
    return fallback


def normalize(cases: list[str]) -> list[str]:
    """Tiene solo i casi validi, senza duplicati, in ordine stabile."""
    seen = []
    for c in cases:
        if c in ALLOWED_CASES and c not in seen:
            seen.append(c)
    return seen


def has_yearly(cases: list[str]) -> bool:
    """True se almeno un caso richiede la ripresentazione annuale."""
    return bool(set(cases) & YEARLY_CASES)

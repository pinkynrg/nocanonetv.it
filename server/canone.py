from __future__ import annotations

from datetime import date

# Strict deadlines for the non-detention declaration (Quadro A):
#   - window opens on 1 July of the previous year
#   - by 31 January of the reference year -> exemption for the WHOLE year
#   - from 1 February to 30 June          -> exemption for the 2nd HALF only (Jul-Dec)
# The declaration must be RE-FILED every year while non-detention persists.


def reference_year(today: date) -> int:
    """Declaration year a reminder sent 'today' points to.

    From July onward the next year's window is open, so we already target the
    following year (reminders go out in December for the full-year exemption).
    """
    return today.year + 1 if today.month >= 7 else today.year


def deadline_note(year: int, today: date) -> str:
    """User-facing deadline sentence for the given year, relative to 'today'."""
    if today <= date(year, 1, 31):
        return f"Presentala entro il 31 gennaio {year} per essere esonerato per tutto l'anno."
    if today <= date(year, 6, 30):
        return (
            f"Attenzione: sei oltre il 31 gennaio {year}. Presentandola entro il "
            f"30 giugno {year} ottieni l'esonero per il solo secondo semestre (luglio-dicembre)."
        )
    return (
        f"La finestra utile per il {year} è chiusa. Ti riscriveremo a dicembre per l'anno prossimo."
    )


def window_open(today: date, year: int) -> bool:
    """True if 'today' falls within the useful window for the given year
    (from 1 July of the previous year to 30 June of the reference year)."""
    return date(year - 1, 7, 1) <= today <= date(year, 6, 30)

from __future__ import annotations

from datetime import date

# Scadenze rigide della dichiarazione di non detenzione (Quadro A):
#   - finestra aperta dal 1° luglio dell'anno precedente
#   - entro il 31 gennaio dell'anno di riferimento -> esonero INTERO anno
#   - dal 1° febbraio al 30 giugno              -> esonero SOLO 2° semestre (lug-dic)
# La dichiarazione va RIPRESENTATA ogni anno finché persiste la non detenzione.


def reference_year(today: date) -> int:
    """Anno di dichiarazione a cui punta un promemoria inviato 'oggi'.

    Da luglio in poi la finestra dell'anno successivo è aperta, quindi si punta
    già all'anno dopo (i promemoria partono a dicembre per l'esonero pieno).
    """
    return today.year + 1 if today.month >= 7 else today.year


def deadline_note(year: int, today: date) -> str:
    """Frase sulla scadenza per l'anno dato, relativa a 'oggi'."""
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
    """True se 'oggi' rientra nella finestra utile per l'anno dato
    (dal 1° luglio dell'anno precedente al 30 giugno dell'anno di riferimento)."""
    return date(year - 1, 7, 1) <= today <= date(year, 6, 30)

# nocanonetv.it

Promemoria per la dichiarazione di non detenzione del canone TV, più gli altri casi di esonero.

## Commit & PR
- Messaggi di commit: **one-liner**, descrivono cosa fa il commit.
- **Non firmare mai** commit, PR, issue o altro: niente `Co-Authored-By`, niente footer "Generated with…", nessuna firma o menzione di Claude/AI di alcun tipo.

## Stack
- **Backend** (`server/`): FastAPI + SQLAlchemy + Alembic + Postgres. Gestito con `uv`, Python 3.12.
- **Frontend** (`client/`): React + Vite + TypeScript, styling con **SCSS modules** (`*.module.scss`).
- **Email**: template su file in `server/emails/` (`.html` + `.txt`, segnaposto `{{...}}` compatibili BeeFree). Backend di invio configurabile via `EMAIL_BACKEND` (`console` | `resend`).

## Modello prodotto
- Solo promemoria: l'utente presenta e firma **sempre lui** la dichiarazione sul sito ufficiale dell'Agenzia delle Entrate. Rimandare sempre al canale ufficiale, mai a un modulo nostro.
- 3 casi di esonero (`server/cases.py`): `non_detenzione` (annuale → promemoria), `over75` e `diplomat` (una tantum → solo guida iniziale).

## Comandi
- `make start` — frontend + backend + db insieme.
- `make migrate` — applica le migrazioni Alembic.
- `make make_migrations name=<nome>` — genera una migrazione.
- `make send_reminders args="--dry-run"` — invio promemoria (window-aware, non un daemon).

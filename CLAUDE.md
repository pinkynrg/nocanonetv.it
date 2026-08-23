# nocanonetv.it

Reminder for the Italian TV licence ("canone TV") non-detention declaration, plus the other exemption cases.

## Language
- **Code, comments, docstrings, logs, commit messages and docs: always English.**
- **User-facing app copy stays Italian** (site text, emails, API messages shown to users, route slugs like `/conferma` `/annulla`): the audience is Italian.
- **No long dashes (em/en dash `—` `–`) in user-facing copy**: they read as AI-generated. Use `:`, `.`, `,`, a plain hyphen `-`, or the middot `·` as a separator.

## Commit & PR
- Commit messages: **one-liner**, describing what the commit does.
- **Never sign** commits, PRs, issues or anything else: no `Co-Authored-By`, no "Generated with…" footer, no mention of Claude/AI.

## Stack
- **Backend** (`server/`): FastAPI + SQLAlchemy + Alembic + Postgres. Managed with `uv`, Python 3.12.
- **Frontend** (`client/`): React + Vite + TypeScript, styling with **SCSS modules** (`*.module.scss`).
- **Email**: file templates in `server/emails/` (`.html` + `.txt`, `{{...}}` placeholders, BeeFree-compatible). Send backend via `EMAIL_BACKEND` (`console` | `resend`).

## Product model
- Reminder only: the user always files and signs the declaration themselves on the official Agenzia delle Entrate site. Always link the official channel, never our own form.
- 3 exemption cases (`server/cases.py`): `non_detenzione` (yearly → reminder), `over75` and `diplomat` (one-off → initial guidance only).
- **Double opt-in**: signup creates a `pending` subscriber and sends `confirm.*`; the subscriber becomes `active` (and eligible for reminders) only after clicking the confirm link. Re-subscribing an already-active email re-confirms only if the selected cases changed (otherwise it stays active).

## Commands
- `make start` — frontend + backend + db together.
- `make migrate` — apply Alembic migrations.
- `make make_migrations name=<name>` — generate a migration.
- `make send_reminders args="--dry-run"` — send reminders (window-aware, not a daemon).
- `make demo` — re-record the README demo (needs `make start` running in another terminal).

## Demo
- `demo/record.mjs` drives a real browser through the whole arc and writes `docs/media/nocanonetv-demo.{gif,mp4}` plus a poster frame. The mp4 and the poster are also what francescomeli.com embeds, so refresh the copies there after a re-record.
- It runs against the **real stack**, not fixtures: the confirm and reminder links carry tokens minted by the API and by `send_reminders`, and faking them would film something the product does not do. `demo/demo_db.py` forgets the demo subscriber before each take and reads those tokens out of the database, which is what makes the tape repeatable.
- Viewport 1440x900 (16:10), to match the other demos on francescomeli.com; the gif is 720 wide, the mp4 1100. `playwright` is pinned to an exact version so a re-record uses the browser build the tape was written against.

## Scheduling
- In production the `cron` service in `docker-compose.yml` runs the backend image under **supercronic** (`TZ=Europe/Rome`) with the schedule in `crontab`: months `12,1` (full-year, 31 Jan deadline) and `5,6` (2nd-semester fallback, 30 Jun deadline).
- `send_reminders` dedups per `(subscriber, year)`, so daily runs are idempotent (one email per subscriber per reference year; failed day retries next). The message text is chosen by `deadline_note()` in `server/canone.py`.
- supercronic binary is pinned by version + SHA1 in `Dockerfile.backend` (amd64); `RUN supercronic -test /app/crontab` validates the crontab at build time.

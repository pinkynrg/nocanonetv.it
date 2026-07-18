# nocanonetv.it

Promemoria per non pagare il canone RAI quando hai diritto all'esonero.

Chi rientra in un caso di esonero (nessuna TV, over 75 con reddito basso, diplomatici/militari
stranieri) può evitare l'addebito in bolletta. Per la non detenzione la dichiarazione va
**rinnovata ogni anno**: nocanonetv.it te lo ricorda nella finestra utile. La dichiarazione la
presenti e la firmi sempre tu sul sito ufficiale dell'Agenzia delle Entrate.

## Sviluppo

- Backend: FastAPI + Postgres in `server/` (uv, Python 3.12).
- Frontend: React + Vite + TypeScript in `client/`.

```bash
make start          # frontend + backend + db
make migrate        # migrazioni Alembic
make send_reminders args="--dry-run"
```

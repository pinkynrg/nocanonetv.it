# Template email

Ogni email è una coppia di file in questa cartella:

| Email                                   | HTML                   | Testo (fallback)      |
| --------------------------------------- | ---------------------- | --------------------- |
| Benvenuto (casi "senza TV", annuale)    | `welcome.html`         | `welcome.txt`         |
| Benvenuto (casi una tantum, guida)      | `welcome_onetime.html` | `welcome_onetime.txt` |
| Promemoria annuale                      | `reminder.html`        | `reminder.txt`        |

La welcome inviata dipende dai casi scelti in iscrizione: se c'è almeno un caso di
non detenzione (`no_tv`/`only_pc`) parte `welcome.html`; se sono tutti una tantum
(over 75, familiare, diplomatici) parte `welcome_onetime.html`.

Il backend (`server/emails/__init__.py`) legge il file a ogni invio e sostituisce
i **segnaposto** `{{nome}}`. Puoi rigenerare gli `.html` con BeeFree: esporta
l'HTML, incolla i merge tag `{{...}}` dove servono, salva col nome giusto qui.
Nessun riavvio necessario, i file vengono riletti a ogni invio.

## Segnaposto disponibili

**welcome.html / welcome.txt** e **welcome_onetime.html / welcome_onetime.txt**
- `{{name}}` — nome dell'iscritto
- `{{official_url}}` — pagina ufficiale Agenzia delle Entrate
- `{{unsubscribe_url}}` — link per annullare l'iscrizione

**reminder.html / reminder.txt**
- `{{name}}` — nome dell'iscritto
- `{{year}}` — anno della dichiarazione
- `{{deadline_note}}` — frase sulla scadenza (calcolata in base alla data)
- `{{confirm_url}}` — link alla pagina di riconferma
- `{{unsubscribe_url}}` — link per annullare l'iscrizione
- `{{official_url}}` — pagina ufficiale Agenzia delle Entrate (usata dalla pagina di conferma)

## Regole da non rompere (vedi brief)
- Rimanda **sempre** al canale ufficiale dell'Agenzia (`{{official_url}}` / la pagina di conferma), mai a un modulo nostro.
- Il promemoria chiede **attivamente** "sei ancora senza TV?": non dare per scontato nulla.
- Tieni sempre un link di annullamento (`{{unsubscribe_url}}`).

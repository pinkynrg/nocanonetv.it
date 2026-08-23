# Email templates

Each email is a pair of files in this folder:

| Email                                    | HTML                   | Text (fallback)       |
| ---------------------------------------- | ---------------------- | --------------------- |
| Welcome ("no TV" cases, yearly)          | `welcome.html`         | `welcome.txt`         |
| Welcome (one-off cases, guide)           | `welcome_onetime.html` | `welcome_onetime.txt` |
| Yearly reminder                          | `reminder.html`        | `reminder.txt`        |

Which welcome is sent depends on the cases chosen at signup: if there is at least one
non-detention case (`non_detenzione`), `welcome.html` goes out; if they are all one-off
(`over75`, `diplomat`), `welcome_onetime.html` goes out.

The backend (`server/emails/__init__.py`) reads the file on every send and replaces the
**placeholders** `{{name}}`. You can regenerate the `.html` with BeeFree: export the HTML,
paste the `{{...}}` merge tags where needed, save under the right name here. No restart
needed — files are re-read on every send.

## Available placeholders

**welcome.html / welcome.txt** and **welcome_onetime.html / welcome_onetime.txt**
- `{{name}}` — subscriber name
- `{{official_url}}` — official Agenzia delle Entrate page
- `{{unsubscribe_url}}` — unsubscribe link

**reminder.html / reminder.txt**
- `{{name}}` — subscriber name
- `{{year}}` — declaration year
- `{{deadline_note}}` — deadline sentence (computed from the date)
- `{{confirm_url}}` — link to the re-confirmation page
- `{{unsubscribe_url}}` — unsubscribe link
- `{{official_url}}` — official Agenzia delle Entrate page (used by the confirm page)

## Rules not to break (see brief)
- **Always** point to the official Agenzia channel (`{{official_url}}` / the confirm page), never our own form.
- The reminder **actively** asks "are you still without a TV?": never assume anything.
- Always keep an unsubscribe link (`{{unsubscribe_url}}`).

import type { ReactNode } from 'react'
import type { ReminderContext } from '../lib/api'
import { ConfirmView } from './ConfirmPage'
import { ConfirmSubscriptionView } from './ConfirmSubscriptionPage'
import { FaqPage } from './FaqPage'
import { NotFoundPage } from './NotFoundPage'
import { PrivacyPage } from './PrivacyPage'
import { SubscribePage } from './SubscribePage'
import { UnsubscribeView } from './UnsubscribePage'

// Shared story list used by the dev-only /preview gallery and /preview/:id.
// Presentational views get mock props; real pages render as-is.
const OFFICIAL =
  'https://www.agenziaentrate.gov.it/portale/it/web/guest/schede/agevolazioni/canone-tv/dichiarazione-sostitutiva-canone-tv-cittadini'

const reminder: ReminderContext = {
  subscriber_name: 'Mario Rossi',
  year: 2027,
  subscriber_status: 'active',
  already_responded: false,
  response: null,
  deadline_note: 'Presentala entro il 31 gennaio 2027 per essere esonerato per tutto l’anno.',
  official_url: OFFICIAL,
}

export interface Story {
  id: string
  label: string
  node: ReactNode
}

export const STORIES: Story[] = [
  { id: 'home', label: 'Home', node: <SubscribePage /> },
  { id: 'faq', label: 'FAQ', node: <FaqPage /> },
  { id: 'privacy', label: 'Privacy', node: <PrivacyPage /> },
  { id: 'notfound', label: '404', node: <NotFoundPage /> },
  {
    id: 'conferma',
    label: 'Conferma promemoria',
    node: (
      <ConfirmView
        ctx={reminder}
        loadError=""
        result={null}
        submitting={false}
        onRespond={() => {}}
      />
    ),
  },
  {
    id: 'conferma-iscrizione',
    label: 'Conferma iscrizione',
    node: (
      <ConfirmSubscriptionView
        status="done"
        message="Iscrizione confermata. Ti scriveremo il promemoria nella finestra utile."
        officialUrl={OFFICIAL}
      />
    ),
  },
  {
    id: 'annulla',
    label: 'Annulla iscrizione',
    node: (
      <UnsubscribeView
        ctx={{ email: 'mario@example.com', status: 'active' }}
        error=""
        done=""
        submitting={false}
        onConfirm={() => {}}
      />
    ),
  },
  {
    id: 'conferma-errore',
    label: 'Conferma promemoria (errore)',
    node: (
      <ConfirmView
        ctx={null}
        loadError="Promemoria non trovato o link scaduto."
        result={null}
        submitting={false}
        onRespond={() => {}}
      />
    ),
  },
  {
    id: 'conferma-iscrizione-errore',
    label: 'Conferma iscrizione (errore)',
    node: (
      <ConfirmSubscriptionView
        status="error"
        message="Link di conferma non valido o già usato."
        officialUrl={null}
      />
    ),
  },
  {
    id: 'annulla-errore',
    label: 'Annulla iscrizione (errore)',
    node: (
      <UnsubscribeView
        ctx={null}
        error="Iscrizione non trovata."
        done=""
        submitting={false}
        onConfirm={() => {}}
      />
    ),
  },
]

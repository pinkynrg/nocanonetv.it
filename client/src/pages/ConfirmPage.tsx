import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import {
  type ReminderAnswer,
  type ReminderContext,
  type RespondResponse,
  errorMessage,
  getReminder,
  respondReminder,
} from '../lib/api'
import styles from './Page.module.scss'

export const ConfirmPage = () => {
  const { token = '' } = useParams()
  const [ctx, setCtx] = useState<ReminderContext | null>(null)
  const [loadError, setLoadError] = useState('')
  const [result, setResult] = useState<RespondResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getReminder(token)
      .then(setCtx)
      .catch((err) =>
        setLoadError(errorMessage(err, 'Promemoria non trovato o link scaduto.')),
      )
  }, [token])

  const respond = async (answer: ReminderAnswer) => {
    setSubmitting(true)
    try {
      setResult(await respondReminder(token, answer))
    } catch (err) {
      setLoadError(errorMessage(err, 'Non è stato possibile registrare la risposta.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loadError) {
    return (
      <Card>
        <div className={styles.stack}>
          <h1 className={styles.title}>Ops</h1>
          <p className={styles.error}>{loadError}</p>
        </div>
      </Card>
    )
  }

  if (result) {
    return (
      <Card>
        <div className={styles.stack}>
          <h1 className={styles.title}>
            {result.official_url ? 'Ci siamo quasi' : 'Tutto chiaro'}
          </h1>
          <p className={styles.lead}>{result.message}</p>
          {result.official_url && (
            <a
              className={styles.officialLink}
              href={result.official_url}
              target="_blank"
              rel="noreferrer"
            >
              Vai al sito dell&apos;Agenzia delle Entrate →
            </a>
          )}
        </div>
      </Card>
    )
  }

  if (!ctx) {
    return (
      <Card>
        <p className={styles.muted}>Carico il promemoria…</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className={styles.stack}>
        <h1 className={styles.title}>Ciao {ctx.subscriber_name}</h1>
        <p className={styles.lead}>
          È ora di rinnovare la dichiarazione di non detenzione per il{' '}
          <strong>{ctx.year}</strong>. Prima di tutto:{' '}
          <strong>sei ancora senza apparecchio TV?</strong>
        </p>
        <p className={styles.notice}>{ctx.deadline_note}</p>

        {ctx.already_responded && (
          <p className={styles.muted}>
            Avevi già risposto a questo promemoria. Puoi aggiornare la risposta qui sotto.
          </p>
        )}

        <div className={styles.actions}>
          <Button
            variant="primary"
            disabled={submitting}
            onClick={() => respond('still_eligible')}
          >
            Sì, sono ancora senza TV
          </Button>
          <Button
            variant="secondary"
            disabled={submitting}
            onClick={() => respond('now_has_tv')}
          >
            No, ora ho una TV
          </Button>
        </div>
        <p className={styles.muted}>
          Confermando, ti mandiamo al canale ufficiale dell&apos;Agenzia delle Entrate.
          La dichiarazione la firmi e la invii tu.
        </p>
      </div>
    </Card>
  )
}

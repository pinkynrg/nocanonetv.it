import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import {
  type UnsubscribeContext,
  errorMessage,
  getUnsubscribe,
  unsubscribe,
} from '../lib/api'
import styles from './Page.module.scss'

export const UnsubscribePage = () => {
  const { token = '' } = useParams()
  const [ctx, setCtx] = useState<UnsubscribeContext | null>(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getUnsubscribe(token)
      .then(setCtx)
      .catch((err) => setError(errorMessage(err, 'Iscrizione non trovata.')))
  }, [token])

  const confirm = async () => {
    setSubmitting(true)
    try {
      const res = await unsubscribe(token)
      setDone(res.message)
    } catch (err) {
      setError(errorMessage(err, 'Non è stato possibile annullare l’iscrizione.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (error) {
    return (
      <Card>
        <div className={styles.stack}>
          <h1 className={styles.title}>Ops</h1>
          <p className={styles.error}>{error}</p>
        </div>
      </Card>
    )
  }

  if (done) {
    return (
      <Card>
        <div className={styles.stack}>
          <h1 className={styles.title}>Iscrizione annullata</h1>
          <p className={styles.lead}>{done}</p>
          <p className={styles.muted}>Puoi reiscriverti quando vuoi dalla home.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className={styles.stack}>
        <h1 className={styles.title}>Annullare il promemoria?</h1>
        <p className={styles.lead}>
          Non ti manderemo più il promemoria annuale{ctx ? ` a ${ctx.email}` : ''}.
        </p>
        <div className={styles.actions}>
          <Button variant="danger" disabled={submitting} onClick={confirm}>
            Sì, annulla l&apos;iscrizione
          </Button>
        </div>
      </div>
    </Card>
  )
}

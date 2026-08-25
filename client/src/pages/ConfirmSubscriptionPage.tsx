import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { confirmSubscription, errorMessage } from '../lib/api'
import styles from './Page.module.scss'

interface ConfirmSubscriptionViewProps {
  status: 'loading' | 'done' | 'error'
  message: string
  officialUrl: string | null
}

// Presentational: renders purely from props (used by the route and by /preview).
export const ConfirmSubscriptionView = ({
  status,
  message,
  officialUrl,
}: ConfirmSubscriptionViewProps) => {
  if (status === 'loading') {
    return (
      <Card>
        <p className={styles.muted}>Confermo l&apos;iscrizione…</p>
      </Card>
    )
  }

  if (status === 'error') {
    return (
      <Card>
        <div className={styles.stack}>
          <h1 className={styles.title}>Ops</h1>
          <p className={styles.lead}>Non riusciamo a confermare la tua iscrizione.</p>
          <p className={styles.error}>{message}</p>
          <Link to="/">Torna alla home</Link>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className={styles.stack}>
        <h1 className={styles.title}>Iscrizione confermata</h1>
        <p className={styles.lead}>{message}</p>
        {officialUrl && (
          <a
            className={styles.officialLink}
            href={officialUrl}
            target="_blank"
            rel="noreferrer"
          >
            Vai al sito dell&apos;Agenzia delle Entrate →
          </a>
        )}
        <Link to="/">Torna alla home</Link>
      </div>
    </Card>
  )
}

// Container: confirms the double opt-in on load, then renders the view.
export const ConfirmSubscriptionPage = () => {
  const { token = '' } = useParams()
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [officialUrl, setOfficialUrl] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return // single POST (guards React StrictMode double-invoke)
    ran.current = true
    confirmSubscription(token)
      .then((res) => {
        setMessage(res.message)
        setOfficialUrl(res.official_url)
        setStatus('done')
      })
      .catch((err) => {
        setMessage(errorMessage(err, 'Link di conferma non valido o già usato.'))
        setStatus('error')
      })
  }, [token])

  return <ConfirmSubscriptionView status={status} message={message} officialUrl={officialUrl} />
}

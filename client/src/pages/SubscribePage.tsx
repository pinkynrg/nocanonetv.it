import { type FormEvent, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EligibilityCases } from '../components/EligibilityCases'
import { errorMessage, subscribe } from '../lib/api'
import styles from './Page.module.scss'

type Status = 'idle' | 'loading' | 'done' | 'error'

export const SubscribePage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [errorNonce, setErrorNonce] = useState(0)

  const toggle = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate one step at a time, in order: case, name, email.
    let firstError = ''
    if (selected.length === 0) firstError = 'Seleziona almeno un caso di esonero qui sopra.'
    else if (name.trim() === '') firstError = 'Inserisci il tuo nome.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      firstError = 'Inserisci un indirizzo email valido.'
    if (firstError) {
      setErrors([firstError])
      setErrorNonce((n) => n + 1)
      return
    }

    setErrors([])
    setStatus('loading')
    try {
      const res = await subscribe(name, email, selected)
      setMessage(res.message)
      setStatus('done')
    } catch (err) {
      setMessage(errorMessage(err, 'Qualcosa è andato storto. Riprova.'))
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className={styles.home}>
        <Card>
          <div className={styles.stack}>
            <h1 className={styles.title}>Grazie</h1>
            <p className={styles.lead}>{message}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.home}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Se hai i requisiti, il canone RAI non lo paghi</h1>
      </div>

      <EligibilityCases selected={selected} onToggle={toggle} />

      <div className={styles.formCard}>
        <form onSubmit={onSubmit} noValidate>
          <h2 className={styles.cardHeading}>Iscriviti al promemoria</h2>

          <div className={styles.signupRow}>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Nome"
              placeholder="Nome"
            />
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
              placeholder="La tua email"
            />
            <Button
              type="submit"
              className={styles.rowButton}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Attendi…' : 'Iscrivimi'}
            </Button>
          </div>

          <div className={styles.formFoot}>
            {errors.length > 0 && (
              <div key={errorNonce} className={styles.errorBanner} role="alert">
                <span className={styles.errorIcon} aria-hidden="true">!</span>
                <span>{errors[0]}</span>
              </div>
            )}
            {status === 'error' && (
              <div className={styles.errorBanner} role="alert">
                <span className={styles.errorIcon} aria-hidden="true">!</span>
                <span>{message}</span>
              </div>
            )}
            <p className={styles.disclaimer}>
              Dichiari di rientrare nei casi scelti. La dichiarazione la presenti e firmi tu
              sul sito dell&apos;Agenzia delle Entrate.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

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

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
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
            <h1 className={styles.title}>Fatto 🎉</h1>
            <p className={styles.lead}>{message}</p>
            <p className={styles.muted}>Controlla la tua email: ti abbiamo scritto cosa fare.</p>
          </div>
        </Card>
      </div>
    )
  }

  const noneSelected = selected.length === 0

  return (
    <div className={styles.home}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Non pagare il canone RAI, senza dimenticartene</h1>
        <p className={styles.lead}>
          Se va rinnovato ogni anno, te lo ricordiamo noi.
        </p>
      </div>

      <EligibilityCases selected={selected} onToggle={toggle} />

      <div className={styles.formCard}>
        <form onSubmit={onSubmit}>
          <h2 className={styles.cardHeading}>Iscriviti al promemoria</h2>

          <div className={styles.signupRow}>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-label="Nome"
              placeholder="Nome"
            />
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email"
              placeholder="La tua email"
            />
            <Button
              type="submit"
              className={styles.rowButton}
              disabled={status === 'loading' || noneSelected}
            >
              {status === 'loading' ? 'Attendi…' : 'Iscrivimi'}
            </Button>
          </div>

          <div className={styles.formFoot}>
            {status === 'error' && <p className={styles.error}>{message}</p>}
            {noneSelected && (
              <p className={styles.hint}>Seleziona almeno un caso qui sopra per continuare.</p>
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

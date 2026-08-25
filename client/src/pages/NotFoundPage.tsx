import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import styles from './Page.module.scss'

export const NotFoundPage = () => (
  <Card>
    <div className={styles.stack}>
      <h1 className={styles.title}>Pagina non trovata</h1>
      <p className={styles.lead}>L&apos;indirizzo che hai aperto non esiste o il link è scaduto.</p>
      <p className={styles.error}>Errore 404: pagina non trovata.</p>
      <Link to="/">Torna alla home</Link>
    </div>
  </Card>
)

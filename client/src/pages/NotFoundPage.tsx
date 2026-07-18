import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import styles from './Page.module.scss'

export const NotFoundPage = () => (
  <Card>
    <div className={styles.stack}>
      <h1 className={styles.title}>Pagina non trovata</h1>
      <p className={styles.lead}>Il link potrebbe essere scaduto o errato.</p>
      <Link to="/">Torna alla home</Link>
    </div>
  </Card>
)

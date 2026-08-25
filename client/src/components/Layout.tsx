import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from '../App.module.scss'

// App chrome: header + main + footer. Reused by the routes and by the dev
// /preview gallery so thumbnails look like complete pages. `contained` makes the
// shell fill its parent (fixed-height preview tile) instead of the viewport.
export const Layout = ({
  children,
  contained,
}: {
  children: ReactNode
  contained?: boolean
}) => (
  <div className={contained ? `${styles.shell} ${styles.shellContained}` : styles.shell}>
    <header className={styles.header}>
      <Link to="/" className={styles.brand} aria-label="nocanonetv.it home">
        <span className={styles.logo} aria-hidden="true">
          <img src="/logo.png" alt="" width="36" height="36" />
        </span>
        <span className={styles.wordmark}>
          nocanonetv<span className={styles.tld}>.it</span>
        </span>
      </Link>
      <nav className={styles.nav}>
        <Link to="/faq" className={styles.navLink}>
          FAQ
        </Link>
      </nav>
    </header>
    <main className={styles.main}>{children}</main>
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        nocanonetv.it è solo un promemoria: la dichiarazione la presenti e firmi tu.
        <Link to="/privacy" className={styles.footerLink}>
          Informativa sulla privacy
        </Link>
      </div>
    </footer>
  </div>
)

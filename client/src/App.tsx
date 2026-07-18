import type { ReactNode } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import styles from './App.module.scss'
import { ConfirmPage } from './pages/ConfirmPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SubscribePage } from './pages/SubscribePage'
import { UnsubscribePage } from './pages/UnsubscribePage'

const Layout = ({ children }: { children: ReactNode }) => (
  <div className={styles.shell}>
    <header className={styles.header}>
      <Link to="/" className={styles.brand} aria-label="nocanonetv.it — home">
        <span className={styles.logo} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 7l4-4 4 4" />
            <rect x="3" y="7" width="18" height="12" rx="2" />
            <line x1="4" y1="21" x2="20" y2="4" />
          </svg>
        </span>
        <span className={styles.wordmark}>
          nocanonetv<span className={styles.tld}>.it</span>
        </span>
      </Link>
    </header>
    <main className={styles.main}>{children}</main>
    <footer className={styles.footer}>
      nocanonetv.it è solo un promemoria: la dichiarazione la presenti e firmi tu, sul sito
      dell'Agenzia delle Entrate.
    </footer>
  </div>
)

export const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<SubscribePage />} />
        <Route path="/conferma/:token" element={<ConfirmPage />} />
        <Route path="/annulla/:token" element={<UnsubscribePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  </BrowserRouter>
)

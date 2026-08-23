import type { ReactNode } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import styles from './App.module.scss'
import { ConfirmPage } from './pages/ConfirmPage'
import { ConfirmSubscriptionPage } from './pages/ConfirmSubscriptionPage'
import { FaqPage } from './pages/FaqPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { SubscribePage } from './pages/SubscribePage'
import { UnsubscribePage } from './pages/UnsubscribePage'

const Layout = ({ children }: { children: ReactNode }) => (
  <div className={styles.shell}>
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
        <Link to="/faq" className={styles.navLink}>FAQ</Link>
      </nav>
    </header>
    <main className={styles.main}>{children}</main>
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        nocanonetv.it è solo un promemoria: la dichiarazione la presenti e firmi tu.
        <Link to="/privacy" className={styles.footerLink}>Informativa sulla privacy</Link>
      </div>
    </footer>
  </div>
)

export const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<SubscribePage />} />
        <Route path="/conferma/:token" element={<ConfirmPage />} />
        <Route path="/conferma-iscrizione/:token" element={<ConfirmSubscriptionPage />} />
        <Route path="/annulla/:token" element={<UnsubscribePage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  </BrowserRouter>
)

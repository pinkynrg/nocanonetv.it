import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ConfirmPage } from './pages/ConfirmPage'
import { ConfirmSubscriptionPage } from './pages/ConfirmSubscriptionPage'
import { FaqPage } from './pages/FaqPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PreviewPage } from './pages/PreviewPage'
import { PreviewStoryPage } from './pages/PreviewStoryPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { SubscribePage } from './pages/SubscribePage'
import { UnsubscribePage } from './pages/UnsubscribePage'

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
        {import.meta.env.DEV && <Route path="/preview" element={<PreviewPage />} />}
        {import.meta.env.DEV && <Route path="/preview/:id" element={<PreviewStoryPage />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  </BrowserRouter>
)

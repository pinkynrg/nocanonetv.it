import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import styles from './Page.module.scss'

// User-facing copy stays Italian (see CLAUDE.md).
// NOTE: data controller (titolare) is WONE di Meli Francesco. Keep the "last
// updated" date in sync on any substantive change, and have the text reviewed
// by legal before relying on it.
export const PrivacyPage = () => (
  <Card>
    <div className={styles.stack}>
      <h1 className={styles.title}>Informativa sulla privacy</h1>
      <p className={styles.muted}>Ultimo aggiornamento: 23 agosto 2026</p>

      <p className={styles.lead}>
        nocanonetv.it ti invia un promemoria per rinnovare la dichiarazione di non
        detenzione dell'apparecchio TV (canone RAI). Per farlo trattiamo alcuni tuoi
        dati personali, come descritto qui sotto.
      </p>

      <h2 className={styles.subTitle}>Titolare del trattamento</h2>
      <p className={styles.prose}>
        WONE di Meli Francesco, impresa individuale — P.IVA IT05375660288, Reggio Emilia
        (Italia). Per qualsiasi richiesta sui tuoi dati scrivi a{' '}
        <a href="mailto:info@nocanonetv.it">info@nocanonetv.it</a>.
      </p>

      <h2 className={styles.subTitle}>Dati che raccogliamo</h2>
      <ul className={styles.proseList}>
        <li>Nome e indirizzo email inseriti al momento dell'iscrizione.</li>
        <li>Il caso di esonero che selezioni (es. non detenzione).</li>
        <li>
          Indirizzo IP, browser (user-agent) e data/ora dell'iscrizione e delle
          risposte ai promemoria, conservati come prova della tua autocertificazione.
        </li>
      </ul>

      <h2 className={styles.subTitle}>Perché li trattiamo</h2>
      <p className={styles.prose}>
        Solo per inviarti il promemoria annuale e tenere traccia della tua iscrizione.
        Non compiliamo né inviamo la dichiarazione al posto tuo: la presenti e firmi
        sempre tu, sul sito dell'Agenzia delle Entrate.
      </p>

      <h2 className={styles.subTitle}>Base giuridica</h2>
      <p className={styles.prose}>
        Il tuo consenso, prestato al momento dell'iscrizione (art. 6, par. 1, lett. a
        del GDPR). Puoi revocarlo in qualsiasi momento annullando l'iscrizione.
      </p>

      <h2 className={styles.subTitle}>Per quanto tempo</h2>
      <p className={styles.prose}>
        Finché resti iscritto al promemoria. Quando annulli l'iscrizione i tuoi dati
        vengono rimossi dagli invii; conserviamo solo il minimo necessario a
        documentare le autocertificazioni già effettuate.
      </p>

      <h2 className={styles.subTitle}>A chi li comunichiamo</h2>
      <p className={styles.prose}>
        Ci appoggiamo a Resend (servizio di invio email) come responsabile del
        trattamento. Non vendiamo né cediamo i tuoi dati a terzi per finalità di
        marketing. L'invio delle email può comportare un trasferimento verso gli Stati
        Uniti, coperto da adeguate garanzie contrattuali.
      </p>

      <h2 className={styles.subTitle}>I tuoi diritti</h2>
      <p className={styles.prose}>
        Puoi chiedere accesso, rettifica, cancellazione, limitazione, opposizione e
        portabilità dei tuoi dati, e proporre reclamo al Garante per la protezione dei
        dati personali. Per esercitarli scrivi a{' '}
        <a href="mailto:info@nocanonetv.it">info@nocanonetv.it</a> oppure annulla
        l'iscrizione dal link presente in ogni email.
      </p>

      <Link to="/">Torna alla home</Link>
    </div>
  </Card>
)

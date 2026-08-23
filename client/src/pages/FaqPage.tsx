import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Page.module.scss'

// User-facing copy stays Italian (see CLAUDE.md). This page is informational
// only: nocanonetv.it never files the declaration for the user.
interface QA {
  id: string
  q: string
  a: ReactNode
}

const OFFICIAL_URL =
  'https://www.agenziaentrate.gov.it/portale/it/web/guest/schede/agevolazioni/canone-tv/dichiarazione-sostitutiva-canone-tv-cittadini'

const FAQS: QA[] = [
  {
    id: 'canone',
    q: 'Cos’è il canone TV (canone RAI)?',
    a: (
      <>
        È l’imposta annuale sul possesso di un apparecchio televisivo. Si paga a rate
        addebitate direttamente nella bolletta dell’elettricità di chi ha un’utenza
        residenziale.
      </>
    ),
  },
  {
    id: 'chi-esonerato',
    q: 'Chi può essere esonerato?',
    a: (
      <>
        Tre casi principali: chi <strong>non detiene alcun televisore</strong>, chi ha{' '}
        <strong>più di 75 anni</strong> con reddito basso, e i{' '}
        <strong>diplomatici o militari stranieri</strong> di stanza in Italia. I requisiti
        esatti di ogni caso sono spiegati nella home, con il link alla pagina ufficiale.
      </>
    ),
  },
  {
    id: 'dichiarazione',
    q: 'Cos’è la dichiarazione di non detenzione?',
    a: (
      <>
        È l’autocertificazione con cui dichiari di non possedere una TV in nessuna delle
        abitazioni della tua famiglia anagrafica. Serve a non farti addebitare il canone in
        bolletta.
      </>
    ),
  },
  {
    id: 'ogni-quanto',
    q: 'Ogni quanto va presentata?',
    a: (
      <>
        Per la non detenzione vale <strong>un solo anno</strong>: va ripresentata ogni anno
        finché la condizione resta valida. Gli altri casi (over 75, diplomatici) sono una
        tantum.
      </>
    ),
  },
  {
    id: 'scadenze',
    q: 'Entro quando va presentata?',
    a: (
      <>
        Presentata entro il <strong>31 gennaio</strong> vale per tutto l’anno. Presentata tra
        il <strong>1° febbraio e il 30 giugno</strong> vale solo per il secondo semestre
        (luglio-dicembre). La finestra si apre dal 1° luglio dell’anno precedente.
      </>
    ),
  },
  {
    id: 'televisore',
    q: 'Cosa conta come «televisore»?',
    a: (
      <>
        Conta solo la presenza di un <strong>sintonizzatore</strong> (il componente che riceve
        e decodifica il segnale TV, digitale terrestre o satellitare), integrato o tramite
        decoder esterno. Il criterio è il sintonizzatore, <strong>non l’antenna</strong>:
        staccare l’antenna non basta e una normale smart TV conta anche se spenta o scollegata.
        <br />
        <br />
        Indizio pratico: la <strong>presa d’antenna</strong>. I dispositivi che non ce l’hanno
        di solito sono privi di sintonizzatore e <strong>non</strong> pagano il canone: PC,
        tablet, smartphone, monitor e proiettori, ma anche alcune «TV senza sintonizzatore» e
        smart monitor venduti apposta.
        <br />
        <br />
        Su un normale televisore il sintonizzatore si può anche{' '}
        <strong>far rimuovere da un tecnico</strong>, con certificazione (fattura): così diventa
        un monitor e non è più soggetto al canone, a patto che in casa non resti nessun altro
        apparecchio con sintonizzatore (altrimenti la dichiarazione è falsa).
      </>
    ),
  },
  {
    id: 'cosa-facciamo',
    q: 'Cosa fa esattamente nocanonetv.it?',
    a: (
      <>
        Solo un promemoria. <strong>Non compiliamo né inviamo la dichiarazione al posto tuo</strong>:
        la presenti e la firmi sempre tu sul canale ufficiale dell’Agenzia delle Entrate. Noi
        ti ricordiamo di farlo nella finestra utile.
      </>
    ),
  },
  {
    id: 'come-presentare',
    q: 'Come e dove si presenta?',
    a: (
      <>
        Sul sito ufficiale dell’Agenzia delle Entrate.{' '}
        <a href={OFFICIAL_URL} target="_blank" rel="noreferrer">
          Vai alla pagina ufficiale ↗
        </a>
        . Si può inviare online con le credenziali (SPID/CIE), tramite intermediario, o per
        raccomandata/PEC.
      </>
    ),
  },
  {
    id: 'gratuito',
    q: 'Il servizio è gratuito?',
    a: <>Sì. nocanonetv.it è un promemoria gratuito. L’unico canale ufficiale resta l’Agenzia delle Entrate.</>,
  },
  {
    id: 'annullare',
    q: 'Come annullo il promemoria?',
    a: (
      <>
        Dal link di annullamento presente in fondo a ogni email che ti inviamo. I tuoi dati
        vengono rimossi dagli invii. Vedi anche l’
        <Link to="/privacy">informativa sulla privacy</Link>.
      </>
    ),
  },
  {
    id: 'perche',
    q: 'Perché esiste nocanonetv.it?',
    a: (
      <>
        L’ho creato per me. Mi sono sempre scordato di presentare la dichiarazione di non
        detenzione, tranne un anno. A casa ho solo un proiettore senza sintonizzatore, quindi
        ne ho diritto: da qui in poi voglio ricordarmene. Ho fatto questo sito per me stesso e
        spero che possa servire anche a te.
      </>
    ),
  },
]

export const FaqPage = () => {
  const location = useLocation()
  const [openId, setOpenId] = useState<string | null>(null)
  const [flashId, setFlashId] = useState<string | null>(null)

  // Deep link: /faq#<id> opens that question, scrolls to it and flashes it.
  useEffect(() => {
    const id = location.hash.replace('#', '')
    if (id && FAQS.some((f) => f.id === id)) {
      setOpenId(id)
      setFlashId(id)
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
      const t = setTimeout(() => setFlashId(null), 1600)
      return () => clearTimeout(t)
    }
  }, [location.hash])

  return (
    <div className={styles.faq}>
      <div className={styles.faqHead}>
        <h1 className={styles.title}>Domande frequenti</h1>
        <p className={styles.lead}>
          Il canone TV è una faccenda delicata: qui trovi le risposte essenziali. Per i dettagli
          ufficiali fai sempre riferimento all’Agenzia delle Entrate.
        </p>
      </div>

      <div className={styles.faqList}>
        {FAQS.map((item) => {
          const open = openId === item.id
          return (
            <div
              key={item.id}
              id={item.id}
              className={styles.faqItem}
              data-open={open}
              data-flash={item.id === flashId}
            >
              <button
                type="button"
                className={styles.faqQ}
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : item.id)}
              >
                {item.q}
              </button>
              {open && <div className={styles.faqA}>{item.a}</div>}
            </div>
          )
        })}
      </div>

      <Link to="/">← Torna alla home</Link>
    </div>
  )
}

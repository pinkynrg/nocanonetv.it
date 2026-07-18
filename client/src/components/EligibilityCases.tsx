import type { JSX } from 'react'
import styles from './EligibilityCases.module.scss'

export interface CaseInfo {
  id: string
  title: string
  points: string[]
  tag: string
  docUrl: string
}

const ICONS: Record<string, JSX.Element> = {
  // TV sbarrata (non detenzione)
  non_detenzione: (
    <>
      <path d="M8 7l4-4 4 4" />
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <line x1="4" y1="21" x2="20" y2="4" />
    </>
  ),
  // persona (over 75)
  over75: (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  // globo (diplomatici / militari stranieri)
  diplomat: (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
    </>
  ),
}

const CaseIcon = ({ id }: { id: string }) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ICONS[id]}
  </svg>
)

export const CASES: CaseInfo[] = [
  {
    id: 'non_detenzione',
    title: 'Non detieni una TV',
    points: [
      'In nessuna delle abitazioni della tua famiglia anagrafica c\'è un televisore, né tuo né di chi vive con te.',
      'PC, tablet o monitor senza sintonizzatore TV non contano: puoi guardare la TV in streaming e non devi comunque il canone.',
      'Vale anche se il canone della tua famiglia è già pagato da un altro componente su un\'altra utenza elettrica: tu, intestatario di una seconda utenza, non lo paghi due volte.',
    ],
    tag: 'Va confermato ogni anno',
    docUrl:
      'https://www.agenziaentrate.gov.it/portale/aree-tematiche/canone-tv/casi-di-esonero/cittadini-che-non-detengono-tv',
  },
  {
    id: 'over75',
    title: 'Hai più di 75 anni',
    points: [
      'Hai compiuto 75 anni.',
      'Il reddito tuo e del coniuge, insieme, non supera 8.000 € l\'anno.',
      'In casa non vive nessun altro con un proprio reddito (badante e colf non contano).',
      'Il televisore, se presente, è nella tua residenza.',
    ],
    tag: 'Una tantum · nessun rinnovo',
    docUrl:
      'https://www.agenziaentrate.gov.it/portale/aree-tematiche/canone-tv/casi-di-esonero/ultrasettantacinquenni',
  },
  {
    id: 'diplomat',
    title: 'Diplomatico o militare straniero',
    points: [
      'Sei un agente diplomatico o consolare.',
      'Oppure un funzionario di un\'organizzazione internazionale.',
      'Oppure un militare straniero di stanza in Italia (es. basi NATO).',
    ],
    tag: 'Esente per legge',
    docUrl:
      'https://www.agenziaentrate.gov.it/portale/web/guest/aree-tematiche/canone-tv/casi-di-esonero/diplomatici-e-militari-stranieri',
  },
]

interface Props {
  selected: string[]
  onToggle: (id: string) => void
}

export const EligibilityCases = ({ selected, onToggle }: Props) => (
  <section className={styles.section}>
    <h2 className={styles.heading}>Seleziona il tuo caso</h2>
    <div className={styles.grid}>
      {CASES.map((c) => {
        const on = selected.includes(c.id)
        return (
          <label
            key={c.id}
            className={on ? `${styles.card} ${styles.selected}` : styles.card}
          >
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={on}
              onChange={() => onToggle(c.id)}
            />
            <span className={styles.check} aria-hidden="true">
              ✓
            </span>
            <span className={styles.icon}>
              <CaseIcon id={c.id} />
            </span>
            <h3 className={styles.cardTitle}>{c.title}</h3>
            <ul className={styles.points}>
              {c.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <div className={styles.cardFoot}>
              <a
                className={styles.docLink}
                href={c.docUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Doc. ufficiale ↗
              </a>
              <span className={styles.tag}>{c.tag}</span>
            </div>
          </label>
        )
      })}
    </div>
  </section>
)

import type { JSX, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './EligibilityCases.module.scss'

export interface CaseInfo {
  id: string
  title: string
  // Whether the points below are ALL required (cumulative) or ANY of them.
  lead: string
  points: ReactNode[]
  tag: string
  // Optional FAQ deep link for the frequency meta line (e.g. "/faq#ogni-quanto").
  metaHref?: string
  docUrl: string
}

const ICONS: Record<string, JSX.Element> = {
  // crossed-out TV (non-detention)
  non_detenzione: (
    <>
      <path d="M8 7l4-4 4 4" />
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <line x1="4" y1="21" x2="20" y2="4" />
    </>
  ),
  // person (over 75)
  over75: (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  // globe (foreign diplomats / military)
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
    lead: 'Servono tutte queste:',
    points: [
      'Sei l\'intestatario dell\'utenza elettrica residenziale.',
      <>
        Nessun componente della tua famiglia anagrafica detiene un televisore o altro
        apparecchio con sintonizzatore.{' '}
        <Link to="/faq#televisore" className={styles.inlineLink} onClick={(e) => e.stopPropagation()}>
          Cosa conta di preciso?
        </Link>
      </>,
    ],
    tag: 'Va confermato ogni anno',
    metaHref: '/faq#ogni-quanto',
    docUrl:
      'https://www.agenziaentrate.gov.it/portale/aree-tematiche/canone-tv/casi-di-esonero/cittadini-che-non-detengono-tv',
  },
  {
    id: 'over75',
    title: 'Hai più di 75 anni',
    lead: 'Servono tutte queste:',
    points: [
      'Sei l\'intestatario dell\'utenza elettrica residenziale.',
      'Hai compiuto 75 anni.',
      'Reddito tuo e del coniuge insieme non oltre 8.000 € l\'anno.',
      'Nessun altro convivente ha un reddito proprio (colf e badanti esclusi).',
    ],
    tag: 'Una tantum · nessun rinnovo',
    metaHref: '/faq#ogni-quanto',
    docUrl:
      'https://www.agenziaentrate.gov.it/portale/aree-tematiche/canone-tv/casi-di-esonero/ultrasettantacinquenni',
  },
  {
    id: 'diplomat',
    title: 'Diplomatico o militare straniero',
    lead: 'Servono tutte queste:',
    points: [
      'Sei l\'intestatario dell\'utenza elettrica residenziale.',
      'Rientri in una di queste categorie: agente diplomatico o consolare; funzionario di un\'organizzazione internazionale; militare o personale civile straniero delle forze NATO in Italia.',
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
    <h2 className={styles.heading}>Seleziona uno o più casi</h2>
    <p className={styles.sub}>Tocca quelli che ti riguardano, poi iscriviti qui sotto.</p>
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
            <span className={styles.icon}>
              <CaseIcon id={c.id} />
            </span>
            <h3 className={styles.cardTitle}>{c.title}</h3>
            {c.metaHref ? (
              <Link
                to={c.metaHref}
                className={styles.metaLink}
                onClick={(e) => e.stopPropagation()}
              >
                {c.tag}
              </Link>
            ) : (
              <p className={styles.meta}>{c.tag}</p>
            )}
            <p className={styles.pointsLead}>{c.lead}</p>
            <ul className={styles.points}>
              {c.points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            <div className={styles.cardFoot}>
              <a
                className={styles.docChip}
                href={c.docUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Documentazione ufficiale ↗
              </a>
            </div>
            <span className={styles.toggleBtn} aria-hidden="true">
              {on ? '✓ Selezionato' : 'Seleziona questo caso'}
            </span>
          </label>
        )
      })}
    </div>
  </section>
)

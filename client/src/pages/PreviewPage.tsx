import { Layout } from '../components/Layout'
import styles from './Page.module.scss'
import { STORIES } from './previewStories'

// Dev-only gallery of scaled story thumbnails. "apri" opens each story
// full-screen (with header/footer) at /preview/:id. Registered only in DEV.
export const PreviewPage = () => (
  <div className={styles.preview}>
    <div className={styles.previewGrid}>
      {STORIES.map((s) => (
        <div key={s.id} className={styles.previewRow}>
          <p className={styles.previewLabel}>{s.label}</p>
          <a className={styles.previewTile} href={`/preview/${s.id}`} target="_blank" rel="noreferrer">
            <div className={styles.previewStage}>
              <Layout contained>{s.node}</Layout>
            </div>
          </a>
        </div>
      ))}
    </div>
  </div>
)

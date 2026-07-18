import type { ReactNode } from 'react'
import styles from './Card.module.scss'

export const Card = ({ children }: { children: ReactNode }) => (
  <div className={styles.card}>{children}</div>
)

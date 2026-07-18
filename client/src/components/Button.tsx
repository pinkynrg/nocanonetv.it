import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.scss'

type Variant = 'primary' | 'secondary' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export const Button = ({ variant = 'primary', className, ...rest }: Props) => {
  const cls = [styles.btn, styles[variant], className].filter(Boolean).join(' ')
  return <button className={cls} {...rest} />
}

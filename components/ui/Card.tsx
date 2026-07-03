import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import styles from './Card.module.css'

type CardVariant = 'public' | 'admin'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  interactive?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'public', interactive = false, className, children, ...rest },
  ref
) {
  const classes = [styles.card, styles[variant], interactive && styles.interactive, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={ref} className={classes} {...rest}>
      {children}
    </div>
  )
})

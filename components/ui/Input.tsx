import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error = false, className, ...rest },
  ref
) {
  const classes = [styles.input, error && styles.error, className].filter(Boolean).join(' ')
  return <input ref={ref} className={classes} {...rest} />
})

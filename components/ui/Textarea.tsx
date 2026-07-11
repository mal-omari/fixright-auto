import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import styles from './Input.module.css'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { error = false, className, ...rest },
  ref
) {
  const classes = [styles.input, styles.textarea, error && styles.error, className]
    .filter(Boolean)
    .join(' ')
  return <textarea ref={ref} className={classes} {...rest} />
})

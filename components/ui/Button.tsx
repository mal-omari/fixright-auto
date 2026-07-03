import Link from 'next/link'
import { forwardRef } from 'react'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'ghost'
type ButtonSize = 'default' | 'compact'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  className?: string
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { href?: undefined }

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> & { href: string }

export type ButtonProps = ButtonAsButton | ButtonAsLink

function isExternalHref(href: string) {
  return /^(https?:|tel:|mailto:|#)/.test(href)
}

export const Button = forwardRef<HTMLAnchorElement | HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const { variant = 'primary', size = 'default', children, className, ...rest } = props
    const sizeClass = variant === 'primary' ? styles[size] : ''
    const classes = [styles.btn, styles[variant], sizeClass, className].filter(Boolean).join(' ')

    if (props.href) {
      const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
      if (isExternalHref(href)) {
        return (
          <a ref={ref as Ref<HTMLAnchorElement>} href={href} className={classes} {...anchorRest}>
            {children}
          </a>
        )
      }
      return (
        <Link ref={ref as Ref<HTMLAnchorElement>} href={href} className={classes} {...anchorRest}>
          {children}
        </Link>
      )
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        className={classes}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    )
  }
)

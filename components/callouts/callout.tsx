import React, { useState } from 'react'
import styles from './style.module.css'

const TypeToEmoji = {
  default: '🪶',
  note: '✏️',
  abstract: '📔',
  info: 'ℹ️',
  tip: '🔥',
  success: '✔️',
  question: '❔',
  warning: '⚠️',
  error: '❌',
  danger: '💣',
  bug: '🐞',
  example: '👾',
  quote: '🪽',
}

type CalloutType = keyof typeof TypeToEmoji

type CalloutProps = {
  type?: CalloutType
  emoji?: string | React.ReactNode
  title?: string
  collapsible?: boolean
  children: React.ReactNode
}

export function Callout({
  children,
  type = 'default',
  emoji = TypeToEmoji[type],
  title,
  collapsible = false,
}: CalloutProps): React.ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(collapsible)
  const [maxHeight, setMaxHeight] = useState<string | number>(0)

  const contentRef = React.useRef<HTMLDivElement>(null)

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const [initialMaxHeight, setInitialMaxHeight] = useState(null)

  React.useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight
      if (initialMaxHeight === null) {
        if (collapsible) {
          setMaxHeight(0)
        } else {
          setMaxHeight(contentHeight)
        }
        setInitialMaxHeight(collapsible ? 0 : contentHeight)
      } else {
        setMaxHeight(isCollapsed ? 0 : contentHeight)
      }
    }
  }, [isCollapsed, collapsible, initialMaxHeight])

  const contentStyle = {
    maxHeight: initialMaxHeight === null ? (collapsible ? 0 : 'auto') : `${maxHeight}px`,
    overflow: 'hidden',
    transition: 'max-height 0.8s ease',
  }

  return (
    <div className={`${styles.callout} ${styles[`callout-${type}`]}`}>
      <div className={styles['callout-header']}>
        <div className={styles['callout-emoji']}>{emoji}</div>
        <div
          className={`${styles['callout-title']} ${collapsible ? styles.collapsible : ''}`}
          onClick={collapsible ? toggleCollapse : undefined}
        >
          {title ? (
            <span className={styles['title-text']}>{title}</span>
          ) : (
            <span className={styles['title-spacer']} style={{ flexGrow: 1 }}></span>
          )}
          {collapsible && <span className={styles.arrow}>{isCollapsed ? '▷' : '▽'}</span>}
        </div>
      </div>
      <div style={contentStyle}>
        <div className={styles['callout-content']} ref={contentRef}>
          {children}
        </div>
      </div>
    </div>
  )
}

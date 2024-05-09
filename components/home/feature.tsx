import React from 'react'
import styles from './feature.module.css'

interface FeatureProps {
  locate: string
}

export default function Feature({ locate }: FeatureProps) {
  return (
    <div className={styles.container}>
      <div className={`${styles.panel} ${styles['feature-table']}`}>
        <div className={styles['feature-plan']}>
          <a href={`${locate}/docs`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
            </svg>
            <h2 className={styles['feature-header']}>Docs</h2>
          </a>
          <ul className={styles['feature-desc']}>
            <li key="1" className={styles['feature-desc-item']}>
              Everything you need to know
            </li>
          </ul>
        </div>
        <div className={styles['feature-plan']}>
          <a href={`${locate}/blog`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              <path d="M8 12h.01" />
              <path d="M12 12h.01" />
              <path d="M16 12h.01" />
            </svg>
            <h2 className={styles['feature-header']}>Blog</h2>
          </a>
          <ul className={styles['feature-desc']}>
            <li key="1" className={styles['feature-desc-item']}>
              Stay up to date with the latest news
            </li>
          </ul>
        </div>
        <div className={styles['feature-plan']}>
          <a href={`${locate}/changelog`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
            <h2 className={styles['feature-header']}>Changelog</h2>
          </a>
          <ul className={styles['feature-desc']}>
            <li key="1" className={styles['feature-desc-item']}>
              Tracking Progress, One Update at a Time
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

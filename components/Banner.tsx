import { useState, useEffect } from 'react'

interface BannerProps {
  storageKey: string
}

/** Dismissible announcement banner persisted via localStorage. */
export function Banner({ storageKey }: BannerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(`nextra-banner-${storageKey}`)
    if (!dismissed) {
      setIsVisible(true)
    }
  }, [storageKey])

  const handleDismiss = () => {
    localStorage.setItem(`nextra-banner-${storageKey}`, 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="nextra-banner-container">
      <div className="nextra-banner-content">
        <div className="nextra-banner-text">
          LibreChat is joining <span className="clickhouse-highlight">ClickHouse</span> to power the
          open-source Agentic Data Stack 🎉{' '}
          <a
            href="https://clickhouse.com/blog/librechat-open-source-agentic-data-stack"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn More ↗
          </a>
        </div>
        <button className="nextra-banner-close" onClick={handleDismiss} aria-label="Dismiss banner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <style jsx>{`
        .nextra-banner-container {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: #ffffff;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
          padding: 12px 16px;
          position: relative;
          z-index: 1000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .nextra-banner-content {
          max-width: 90rem;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          position: relative;
        }
        .nextra-banner-text {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .nextra-banner-text :global(.clickhouse-highlight) {
          background-color: rgb(250, 255, 105);
          color: rgb(21, 21, 21);
          font-weight: 700;
          padding: 2px 6px;
          clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%);
          display: inline-block;
        }
        .nextra-banner-text :global(a) {
          color: #ffffff;
          text-decoration: underline;
          font-weight: 600;
          transition: opacity 0.2s;
        }
        .nextra-banner-text :global(a:hover) {
          opacity: 0.7;
        }
        .nextra-banner-close {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          opacity: 0.7;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }
        .nextra-banner-close:hover {
          opacity: 1;
        }
        @media (max-width: 768px) {
          .nextra-banner-container {
            font-size: 13px;
            padding: 10px 12px;
          }
          .nextra-banner-content {
            gap: 12px;
          }
        }
      `}</style>
    </div>
  )
}

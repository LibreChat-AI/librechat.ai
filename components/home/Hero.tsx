import Link from 'next/link'
import cn from 'clsx'

import styles from './hero.module.css'

export function Hero() {
  const heroMap = {
    headlineOne: 'LibreChat',
    headlineTwo: 'Every AI for Everyone',
    headlineThree: 'The Original, Open-Source AI Chat',
    subtitleOne:
      'LibreChat is a free, open source AI chat platform. This Web UI offers vast customization, supporting numerous AI providers, services, and integrations. Serves all AI Conversations in one place with a familiar interface, innovative enhancements, for as many users as you need.',
    // subtitleTwo: '',
    // subtitleThree: '',
    // subtitleFour: '',
    cta: 'Get Started',
  }

  return (
    <div className={styles.root}>
      <div className="overlay">
        <div className={styles.grid}>
          <div className={styles.gridfade}></div>
          <div className={styles.gridlines}></div>
        </div>
      </div>
      <div className={styles.content}>
        <h1 className={styles.headline}>
          <p className={styles.head}>
            <span></span>
            <span>
              <span className={styles.headlineOne}>{heroMap.headlineOne}</span>
              <br className="max-md:_hidden" />
              <span className={styles.headlineTwo}>{heroMap.headlineTwo}</span>
              <span className={cn(styles.headlineThree, 'text-xl')}>{heroMap.headlineThree}</span>
              <span className="text-lg block">{"est. Jan '23"}</span>
              <br className="max-md:_hidden" />
              <span className={styles.pops}>
                <span className={styles.pop}></span>
                <span className={styles.pop}></span>
                <span className={styles.pop}></span>
                <span className={styles.pop}></span>
                <span className={styles.pop}></span>
              </span>
            </span>
            <span></span>
          </p>
        </h1>
        <p className={styles.subtitle}>
          {heroMap.subtitleOne}
          <br className="max-md:_hidden" />
          {/* {heroMap.subtitleTwo}
          <br className="max-md:_hidden" />
          {heroMap.subtitleThree}
          {heroMap.subtitleFour} */}
        </p>
        <br className="max-md:_hidden" />
        <div className={styles.actions}>
          <Link className={styles.cta} href="/docs/features">
            ✨ Features
          </Link>
          <Link className={styles.cta} href={`/docs`}>
            {heroMap.cta} <span>→</span>
          </Link>
          <a
            className={styles.secondaryAction}
            href="https://github.com/danny-avila/LibreChat"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  )
}

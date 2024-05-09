// Carousel.tsx
import React, { useEffect, useRef } from 'react'
import Glide from '@glidejs/glide'
import '@glidejs/glide/dist/css/glide.core.min.css'
import styles from './style.module.css'

// TODO: Fix "showControls" and "showBullets" + theme detection and dynamic style (broke when moving to nextra v3)

const Carousel = ({ children, ...props }) => {
  const carouselRef = useRef(null)

  const {
    autoplay = false,
    animationDuration = '1000',
    showControls = false,
    showBullets = false,
    perView = '1',
  } = props

  useEffect(() => {
    if (carouselRef.current) {
      const glide = new Glide(carouselRef.current, {
        type: 'carousel',
        perView: parseInt(perView, 10),
        animationDuration: parseInt(animationDuration, 10),
        autoplay: autoplay ? 3000 : false,
        // Other Glide configuration options can be added here
      })

      glide.mount()

      return () => {
        glide.destroy()
      }
    }
  }, [autoplay, animationDuration, perView])

  const slides = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return <li className={styles.glide__slide}>{child}</li>
    }
    return null
  })

  return (
    <div className="glide" ref={carouselRef}>
      <div className="glide__track" data-glide-el="track">
        <ul className="glide__slides">{slides}</ul>
      </div>
      {showControls && (
        <div className={styles.glide__arrows} data-glide-el="controls">
          <button className={`${styles.glide__arrow} glide__arrow--left}`} data-glide-dir="<">
            ←
          </button>
          <button className={`${styles.glide__arrow} glide__arrow--right}`} data-glide-dir=">">
            →
          </button>
        </div>
      )}
      {showBullets && (
        <div className={styles.glide__bullets} data-glide-el="controls[nav]">
          {React.Children.map(children, (_, index) => (
            <button className={styles.glide__bullets} data-glide-dir={`=${index}`}></button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Carousel

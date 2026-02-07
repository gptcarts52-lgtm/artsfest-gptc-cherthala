'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './home.module.css'
import { Cinzel } from 'next/font/google'
import Link from 'next/link'

const cinzel = Cinzel({ subsets: ['latin'] })

import { ProgramWithStats } from '@/types'
import { useConfig } from '@/context/ConfigContext'

export default function Home() {
  const { config } = useConfig()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [programs, setPrograms] = useState<ProgramWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  // Chunk images into layouts
  const [slides, setSlides] = useState<string[][]>([])

  useEffect(() => {
    if (!config.galleryImages || config.galleryImages.length === 0) return

    // Shuffle images for randomness
    const shuffled = [...config.galleryImages].sort(() => 0.5 - Math.random())

    const newSlides: string[][] = []
    let i = 0

    while (i < shuffled.length) {
      // Randomly pick layout size: Prefer 3 and 4, fewer 2 and 1
      const options = [3, 4, 3, 4, 2, 2, 1]
      const count = options[Math.floor(Math.random() * options.length)]

      const chunk = shuffled.slice(i, i + count)

      if (chunk.length > 0) {
        newSlides.push(chunk)
      }

      i += count
    }
    setSlides(newSlides)
  }, [config.galleryImages])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide(curr => (curr + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides])

  useEffect(() => {
    // Fetch programs
    fetch('/api/programs')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPrograms(data.data)
        }
      })
      .catch(err => console.error('Failed to load programs', err))
      .finally(() => setLoading(false))

    // Check login status
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const nextSlide = () => setCurrentSlide(c => (c + 1) % slides.length)
  const prevSlide = () => setCurrentSlide(c => (c - 1 + slides.length) % slides.length)

  return (
    <div className={styles.container}>
      {/* Header removed, using global Navbar */}

      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}>
            <Image
              src="/kerala_hero.webp"
              alt="Kerala Arts Festival"
              fill
              style={{ objectFit: 'cover' }}
              quality={100}
              priority
            />
          </div>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1 className={`${styles.title} ${cinzel.className}`}>
              Celebrating Culture & Creativity
            </h1>
            <p className={styles.subtitle}>
              <span className={styles.festivalName}>{config.festivalName}</span>
              <span className={styles.festivalYear}>{config.festivalYear}</span>
            </p>
            {isLoggedIn ? (
              <Link href="/dashboard" className={styles.ctaButton}>
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/register" className={styles.ctaButton}>
                Register Now
              </Link>
            )}
          </div>
        </section>

        {/* Gallery Section - Futuristic Collage */}
        {slides.length > 0 && (
          <section className={styles.features} style={{ padding: '2rem 5%' }}>
            <h2 className={`${styles.sectionTitle} ${cinzel.className}`} style={{ marginBottom: '1rem' }}>
              Gallery
            </h2>

            <div className={styles.galleryWrapper}>
              {/* Tech Deco */}
              <div className={`${styles.techCorner} ${styles.tl}`}></div>
              <div className={`${styles.techCorner} ${styles.tr}`}></div>
              <div className={`${styles.techCorner} ${styles.bl}`}></div>
              <div className={`${styles.techCorner} ${styles.br}`}></div>

              {/* Overlay Text */}
              {config.galleryText && (
                <div className={styles.galleryOverlay}>
                  <h3 className={`${styles.galleryText} ${cinzel.className}`}>{config.galleryText}</h3>
                </div>
              )}

              {/* Slides */}
              {slides.map((slideImgs, idx) => {
                let layoutClass = styles.layoutSingle
                if (slideImgs.length === 2) layoutClass = styles.layoutSplit
                else if (slideImgs.length === 3) layoutClass = styles.layoutTri
                else if (slideImgs.length >= 4) layoutClass = styles.layoutQuad

                return (
                  <div
                    key={idx}
                    className={`${styles.gallerySlide} ${idx === currentSlide ? styles.active : ''} ${layoutClass}`}
                  >
                    {slideImgs.map((img, imgIdx) => (
                      <div key={imgIdx} className={styles.galleryImgWrapper}>
                        <Image
                          src={img}
                          alt="Gallery"
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                )
              })}

              {/* Navigation */}
              <button className={`${styles.galleryNavBtn} ${styles.prevBtn}`} onClick={prevSlide}>&#10094;</button>
              <button className={`${styles.galleryNavBtn} ${styles.nextBtn}`} onClick={nextSlide}>&#10095;</button>

              {/* Indicators */}
              <div className={styles.galleryIndicators}>
                {slides.map((_, idx) => (
                  <div
                    key={idx}
                    className={`${styles.indicator} ${idx === currentSlide ? styles.active : ''}`}
                    onClick={() => setCurrentSlide(idx)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Programs List Section */}
        {/* Programs List Section */}
        <section className={styles.features}>
          <h2 className={`${styles.sectionTitle} ${cinzel.className}`}>
            Event List
          </h2>
          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading events...</p>
          ) : (
            <div className={styles.grid}>
              {programs.length > 0 ? (
                programs.map(program => (
                  <div key={program.id} className={styles.card}>
                    <h3>{program.name}</h3>
                    <div className={styles.cardMeta}>
                      <span className={`${styles.badge} ${styles.badgeCategory}`}>
                        {program.category.replace('_', ' ')}
                      </span>
                      <span className={`${styles.badge} ${styles.badgeType}`}>
                        {program.type}
                      </span>
                    </div>
                    <p>{program.description || 'No description available.'}</p>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No events scheduled yet.</p>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} GPTC Cherthala. All rights reserved.</p>
      </footer>
    </div>
  )
}
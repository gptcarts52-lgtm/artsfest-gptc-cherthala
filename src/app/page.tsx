import Image from 'next/image'
import styles from './home.module.css'
import { Cinzel, Inter } from 'next/font/google'
import Link from 'next/link'

const cinzel = Cinzel({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <div className={`${styles.container} ${inter.className}`}>
      <header className={styles.header}>
        <div className={`${styles.logo} ${cinzel.className}`}>
          ArtsFest GPTC
        </div>
        <nav className={styles.nav}>
          <Link href="/programs">Programs</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/register">Register</Link>
          <Link href="/login">Login</Link>
        </nav>
      </header>

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
              GPTC Cherthala Arts Festival 2024
            </p>
            <Link href="/register" className={styles.ctaButton}>
              Register Now
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <h2 className={`${styles.sectionTitle} ${cinzel.className}`}>
            Festival Highlights
          </h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>Traditional Arts</h3>
              <p>Experience the mesmerizing performances of Kathakali, Mohiniyattam, and Thiruvathira, showcasing the rich heritage of Kerala through vibrant costumes and graceful movements.</p>
            </div>
            <div className={styles.card}>
              <h3>Modern Competitions</h3>
              <p>Showcase your talent in modern dance, music, and literary events. A platform for students to express their creativity and compete with the best.</p>
            </div>
            <div className={styles.card}>
              <h3>Live Events</h3>
              <p>Join us for live musical concerts, drama enactments, and artistic displays that bring the campus to life with energy and enthusiasm.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} GPTC Cherthala. All rights reserved.</p>
      </footer>
    </div>
  )
}
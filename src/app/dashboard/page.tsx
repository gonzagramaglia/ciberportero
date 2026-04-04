'use client'

import { useSession } from "next-auth/react"
import Link from 'next/link'
import { useState, useEffect } from "react"
import { SignOutButton } from "@/components/AuthButtons"
import { ProgressList } from "./components/ProgressList"
import { Github, Youtube, ArrowLeft, Zap, CheckCircle, Info, Book, Calendar } from 'lucide-react'
import { useLanguage } from "@/context/LanguageContext"
import { translations } from "@/lib/translations"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import NotificationBanners from "@/components/NotificationBanners"

export default function DashboardPage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const dt = translations[lang].dashboard
  const { data: session, status } = useSession()
  const [isGuest, setIsGuest] = useState(false)
  const [stats, setStats] = useState({ autoevaluaciones: 0, parciales: 0, trabajosPracticos: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const guest = localStorage.getItem("ciberportero_guest") === "true"
    setIsGuest(guest)
    
    // Load stats from localStorage for guest
    const saved = localStorage.getItem("ciberportero_progress")
    if (saved) {
      try {
        const progress = JSON.parse(saved)
        setStats({
          autoevaluaciones: progress.filter((p: any) => p.type === 'autoevaluacion').length,
          parciales: progress.filter((p: any) => p.type === 'parcial').length,
          trabajosPracticos: progress.filter((p: any) => p.type === 'tp').length,
        })
      } catch (e) {
        console.error(e)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    document.title = 'Ciberportero | Dashboard'
  }, [])

  const [isFinished, setIsFinished] = useState(false);
  const [isClassesFinished, setIsClassesFinished] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [classesCountdown, setClassesCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
      const enrollmentTarget = new Date('2026-04-01T23:59:59-03:00').getTime();
      const classesTarget = new Date('2026-04-06T09:00:00-03:00').getTime();
      
      const updateCountdowns = () => {
          const now = new Date().getTime();
          
          // Enrollment Countdown
          const eDistance = enrollmentTarget - now;
          if (eDistance < 0) {
              setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
              setIsFinished(true);
          } else {
              setCountdown({
                  days: Math.floor(eDistance / (1000 * 60 * 60 * 24)),
                  hours: Math.floor((eDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                  mins: Math.floor((eDistance % (1000 * 60 * 60)) / (1000 * 60)),
                  secs: Math.floor((eDistance % (1000 * 60)) / 1000)
              });
              setIsFinished(false);
          }

          // Classes Countdown
          const cDistance = classesTarget - now;
          if (cDistance < 0) {
              setClassesCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
              setIsClassesFinished(true);
          } else {
              setClassesCountdown({
                  days: Math.floor(cDistance / (1000 * 60 * 60 * 24)),
                  hours: Math.floor((cDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                  mins: Math.floor((cDistance % (1000 * 60 * 60)) / (1000 * 60)),
                  secs: Math.floor((cDistance % (1000 * 60)) / 1000)
              });
              setIsClassesFinished(false);
          }
      };
      
      const timer = setInterval(updateCountdowns, 1000);
      updateCountdowns();
      return () => clearInterval(timer);
  }, []);

  if (status === "loading" || !isLoaded) {
    return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>{dt.loading}</div>
  }

  const userName = session?.user?.name || dt.guestUser

  return (
    <div className="container fade-in page-container">
      {/* Widget de Inscripciones (Izquierda) */}
      <div className={`sidebar-widget sidebar-widget-left`}>
          <div className="countdown-header">
              <Calendar size={14} />
              <span>{t.countdown.ivuTitle}</span>
          </div>
          {!isFinished ? (
              <>
                  <div className="countdown-timer">
                      <div className="countdown-unit">
                          <span className="countdown-number">{countdown.hours}</span>
                          <span className="countdown-label">{t.countdown.hours}</span>
                      </div>
                      <span className="countdown-sep">:</span>
                      <div className="countdown-unit">
                          <span className="countdown-number">{countdown.mins}</span>
                          <span className="countdown-label">{t.countdown.minutes}</span>
                      </div>
                      <span className="countdown-sep">:</span>
                      <div className="countdown-unit">
                          <span className="countdown-number">{countdown.secs}</span>
                          <span className="countdown-label">{t.countdown.seconds}</span>
                      </div>
                  </div>
                  <p className="countdown-desc" style={{ color: '#fff', opacity: 0.9 }}>
                      Cierre de inscripciones <strong>Hoy</strong> a las <strong>23:59hs</strong>.
                  </p>
              </>
          ) : (
              <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, lineHeight: '1.2', color: '#fff' }}>{t.countdown.enrollmentClosed}</p>
                  <p style={{ fontSize: '0.7rem', opacity: 0.9, margin: 0, lineHeight: '1.4', color: '#fff' }}>{t.countdown.enrollmentClosedDesc}</p>
              </div>
          )}
      </div>

      {/* Widget de Inicio de Clases (Derecha) */}
      <div className={`sidebar-widget sidebar-widget-right`} style={{ 
          background: 'linear-gradient(135deg, #1a4a6e 0%, #103253 100%)',
          boxShadow: '0 8px 24px rgba(16, 50, 83, 0.35)',
          padding: '1.1rem'
      }}>
          <div className="countdown-header">
              <Zap size={14} />
              <span>{t.countdown.classesTitle}</span>
          </div>
          {!isClassesFinished ? (
              <>
                  <div className="countdown-timer">
                      {classesCountdown.days > 0 && (
                          <>
                              <div className="countdown-unit">
                                  <span className="countdown-number">{classesCountdown.days}</span>
                                  <span className="countdown-label">{t.countdown.days}</span>
                              </div>
                              <span className="countdown-sep">:</span>
                          </>
                      )}
                      <div className="countdown-unit">
                          <span className="countdown-number">{classesCountdown.hours}</span>
                          <span className="countdown-label">{t.countdown.hours}</span>
                      </div>
                      <span className="countdown-sep">:</span>
                      <div className="countdown-unit">
                          <span className="countdown-number">{classesCountdown.mins}</span>
                          <span className="countdown-label">{t.countdown.minutes}</span>
                      </div>
                      <span className="countdown-sep">:</span>
                      <div className="countdown-unit">
                          <span className="countdown-number">{classesCountdown.secs}</span>
                          <span className="countdown-label">{t.countdown.seconds}</span>
                      </div>
                  </div>
                  <p className="countdown-desc" style={{ color: '#fff', opacity: 0.9 }}>
                      {t.countdown.classesDesc}
                  </p>
              </>
          ) : (
              <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, lineHeight: '1.2', color: '#fff' }}>{t.countdown.classesStarted}</p>
                  <p style={{ fontSize: '0.7rem', opacity: 0.9, margin: 0, lineHeight: '1.4', color: '#fff' }}>{t.countdown.classesStartedDesc}</p>
              </div>
          )}
      </div>

      <NotificationBanners />

      <header style={{ marginBottom: '3rem' }}>
        <div className="nav-header-row">
          <Link href="/" className="back-link">
            <ArrowLeft size={18} /> {translations[lang].back}
          </Link>
          <LanguageSwitcher />
        </div>
        
        <div style={{ marginTop: '0.5rem' }}>
          <h1 className="dashboard-title" style={{ margin: 0, fontSize: '3rem', fontWeight: '900', color: '#000', letterSpacing: '-0.03em' }}>{dt.title}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '0.5rem', fontWeight: '500' }} dangerouslySetInnerHTML={{ __html: dt.description || '' }} />
        </div>

        {/* Unified Stats Bar */}
        <div className="stats-bar">
          <div className="stats-item">
             <div className="stats-icon-wrapper" style={{ background: 'rgba(8, 145, 178, 0.06)' }}>
                <Book size={22} color="#0891b2" />
             </div>
             <div className="stats-item-content">
                <span style={{ color: '#0891b2' }}>{stats.trabajosPracticos}</span>
                <span>{dt.stats.trabajosPracticos}</span>
             </div>
          </div>
          <div className="stats-divider"></div>
          <div className="stats-item">
             <div className="stats-icon-wrapper" style={{ background: 'rgba(217, 119, 6, 0.06)' }}>
                <Zap size={22} color="#d97706" fill="#d97706" />
             </div>
             <div className="stats-item-content">
                <span style={{ color: '#d97706' }}>{stats.autoevaluaciones}</span>
                <span>{dt.stats.autoevaluaciones}</span>
             </div>
          </div>
          <div className="stats-divider"></div>
          <div className="stats-item">
             <div className="stats-icon-wrapper" style={{ background: 'rgba(198, 11, 30, 0.06)' }}>
                <CheckCircle size={22} color="#C60B1E" />
             </div>
             <div className="stats-item-content">
                <span style={{ color: '#C60B1E' }}>{stats.parciales}</span>
                <span>{dt.stats.parciales}</span>
             </div>
          </div>
          <div className="stats-notice">
             <Info size={14} />
             <span>{translations[lang].plan.storageNotice}</span>
          </div>
        </div>
      </header>

      <main>
        <section>
          <ProgressList />
        </section>

        {/* Beta Disclaimer Card */}
        <div className="contact-container" style={{ 
          marginTop: '4rem', 
          padding: '1.5rem 2rem', 
          background: 'rgba(0, 112, 243, 0.04)', 
          borderRadius: '20px', 
          border: '1px solid rgba(0, 112, 243, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <p className="contact-container-inner" style={{ margin: 0, fontWeight: '800', color: 'var(--accent)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {dt.beta.title}
          </p>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', fontWeight: '500', whiteSpace: 'pre-line' }}>
            {dt.beta.desc}
          </p>
        </div>
      </main>
      
      <footer className="footer-main" style={{ marginTop: '5rem', padding: '2.5rem 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', color: 'var(--muted)' }}>
            <Github size={20} />
        </a>
        <span style={{ fontSize: '0.9rem', opacity: 0.6, color: 'var(--muted)', fontWeight: '500' }}>{translations[lang].footer}</span>
        <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', color: 'var(--muted)' }}>
            <Youtube size={22} />
        </a>
      </footer>
    </div>
  )
}

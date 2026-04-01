"use client"

import { useSession } from "next-auth/react"
import Link from 'next/link'
import { useState, useEffect } from "react"
import { SignOutButton } from "@/components/AuthButtons"
import { ProgressList } from "./components/ProgressList"
import { Github, Youtube, ArrowLeft, Zap, CheckCircle, Info, Book } from 'lucide-react'
import { useLanguage } from "@/context/LanguageContext"
import { translations } from "@/lib/translations"
import LanguageSwitcher from "@/components/LanguageSwitcher"

export default function DashboardPage() {
  const { lang } = useLanguage()
  const t = translations[lang].dashboard
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

  if (status === "loading" || !isLoaded) {
    return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>{t.loading}</div>
  }


  const userName = session?.user?.name || t.guestUser

  return (
    <div className="container fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="back-link" style={{ textDecoration: 'none', color: 'var(--muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> {translations[lang].back}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             <LanguageSwitcher />
          </div>
        </div>
        
        <div style={{ marginTop: '2.5rem' }}>
          <h1 className="dashboard-title" style={{ margin: 0, fontSize: '3rem', fontWeight: '900', color: '#000', letterSpacing: '-0.03em' }}>{t.title}</h1>
        </div>

        {/* Unified Stats Bar */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          background: 'white', 
          borderRadius: '24px', 
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ padding: '0.6rem', background: 'rgba(8, 145, 178, 0.06)', borderRadius: '12px' }}>
                <Book size={22} color="#0891b2" />
             </div>
             <div>
                <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: '900', color: '#0891b2' }}>{stats.trabajosPracticos}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase' }}>{t.stats.trabajosPracticos}</span>
             </div>
          </div>

          <div style={{ width: '1px', height: '30px', background: 'var(--border)' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ padding: '0.6rem', background: 'rgba(217, 119, 6, 0.06)', borderRadius: '12px' }}>
                <Zap size={22} color="#d97706" fill="#d97706" />
             </div>
             <div>
                <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: '900', color: '#d97706' }}>{stats.autoevaluaciones}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase' }}>{t.stats.autoevaluaciones}</span>
             </div>
          </div>

          <div style={{ width: '1px', height: '30px', background: 'var(--border)' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ padding: '0.6rem', background: 'rgba(198, 11, 30, 0.06)', borderRadius: '12px' }}>
                <CheckCircle size={22} color="#C60B1E" />
             </div>
             <div>
                <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: '900', color: '#C60B1E' }}>{stats.parciales}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase' }}>{t.stats.parciales}</span>
             </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted)', fontSize: '0.74rem', fontWeight: '600', width: '100%', justifyContent: 'center', marginTop: '-0.8rem', opacity: 0.8 }}>
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
        <div style={{ 
          marginTop: '4rem', 
          padding: '1.5rem 2rem', 
          background: 'rgba(0, 112, 243, 0.04)', 
          borderRadius: '20px', 
          border: '1px solid rgba(0, 112, 243, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontWeight: '800', color: 'var(--accent)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {t.beta.title}
          </p>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', fontWeight: '500', whiteSpace: 'pre-line' }}>
            {t.beta.desc}
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

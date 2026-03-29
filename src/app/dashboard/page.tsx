"use client"

import { useSession } from "next-auth/react"
import Link from 'next/link'
import { useState, useEffect } from "react"
import { SignOutButton } from "@/components/AuthButtons"
import { ProgressList } from "./components/ProgressList"
import { Github, Youtube } from 'lucide-react'
import { useLanguage } from "@/context/LanguageContext"
import { translations } from "@/lib/translations"
import LanguageSwitcher from "@/components/LanguageSwitcher"

export default function DashboardPage() {
  const { lang } = useLanguage()
  const t = translations[lang].dashboard
  const { data: session, status } = useSession()
  const [isGuest, setIsGuest] = useState(false)
  const [stats, setStats] = useState({ autoevaluaciones: 0, parciales: 0 })
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

  // Redirect if not authenticated (either via session or guest)
  if (!session && !isGuest) {
    window.location.href = "/"
    return null
  }

  const userName = session?.user?.name || t.guestUser

  return (
    <div className="container fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="back-link" style={{ textDecoration: 'none', color: 'var(--muted)', fontWeight: '600' }}>{t.back}</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <SignOutButton />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: '#000' }}>{t.title}</h1>
          <LanguageSwitcher />
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '0.5rem' }}>{t.welcome}, {userName}</p>
      </header>

      <main>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1.5rem', 
          marginBottom: '3rem',
          marginTop: '2.5rem'
        }}>
          <div style={{ 
            padding: '2rem', 
            borderRadius: '16px', 
            background: 'white', 
            border: '1px solid var(--border)',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
          }}>
            <span style={{ fontSize: '3rem', fontWeight: '800', display: 'block', color: 'var(--accent)' }}>{stats.autoevaluaciones}</span>
            <span style={{ fontSize: '0.9rem', color: "var(--muted)", textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.1em' }}>{t.stats.autoevaluaciones}</span>
          </div>
          <div style={{ 
            padding: '2rem', 
            borderRadius: '16px', 
            background: 'white', 
            border: '1px solid var(--border)',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
          }}>
            <span style={{ fontSize: '3rem', fontWeight: '800', display: 'block', color: '#C60B1E' }}>{stats.parciales}</span>
            <span style={{ fontSize: '0.9rem', color: "var(--muted)", textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.1em' }}>{t.stats.parciales}</span>
          </div>
        </div>

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
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>
            {t.beta.desc}
          </p>
        </div>
      </main>
      
      <footer style={{ marginTop: '5rem', padding: '2rem 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', color: 'inherit' }}>
            <Youtube size={22} />
        </a>
        <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>{translations[lang].footer}</span>
        <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', color: 'inherit' }}>
            <Github size={18} />
        </a>
      </footer>
    </div>
  )
}

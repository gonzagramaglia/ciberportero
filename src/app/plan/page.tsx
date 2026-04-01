"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"
import { translations } from "@/lib/translations"
import { curriculum, Subject } from "@/data/curriculum"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { CheckCircle, Info, Lock, ArrowLeft, Layers, Star, Zap, Github, Youtube, Search, X } from "lucide-react"

export default function PlanPage() {
  const { lang } = useLanguage()
  const t = translations[lang].plan
  const [completed, setCompleted] = useState<number[]>([])
  const [objective, setObjective] = useState<'intermediate' | 'degree'>('degree')
  const [search, setSearch] = useState('')
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ciberportero_completed_subjects")
    if (saved) {
      try {
        setCompleted(JSON.parse(saved))
      } catch (e) {
        console.error("Error loading completed subjects", e)
      }
    }

    const savedObj = localStorage.getItem("ciberportero_plan_objective")
    if (savedObj === 'intermediate' || savedObj === 'degree') {
      setObjective(savedObj)
    }
    setIsLoaded(true)
  }, [])

  // Sync to localStorage
  const toggleCompleted = (id: number) => {
    const newCompleted = completed.includes(id)
      ? completed.filter(c => c !== id)
      : [...completed, id]
    setCompleted(newCompleted)
    localStorage.setItem("ciberportero_completed_subjects", JSON.stringify(newCompleted))
  }

  const changeObjective = (obj: 'intermediate' | 'degree') => {
    setObjective(obj)
    localStorage.setItem("ciberportero_plan_objective", obj)
  }

  // Filtering Logic
  const currentCurriculum = objective === 'intermediate' 
    ? curriculum.filter(s => s.id <= 23) 
    : curriculum

  const searchedCurriculum = currentCurriculum.filter(s => {
    const localizedName = t.subjectNames[s.id as keyof typeof t.subjectNames] || s.name
    const searchNorm = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return (
      s.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchNorm) || 
      localizedName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchNorm) ||
      s.id.toString() === search
    )
  })

  const filteredYears = Array.from(new Set(searchedCurriculum.map(s => s.year)))

  // Relations helpers
  const getPrerequisites = (id: number) => {
    const subject = curriculum.find(s => s.id === id)
    return subject?.prerequisites || []
  }

  const getUnlocks = (id: number) => {
    return currentCurriculum.filter(s => s.prerequisites.includes(id)).map(s => s.id)
  }

  const isRelatated = (id: number): { type: "prerequisite" | "unlock", depth: number } | false => {
    if (!hoveredId || hoveredId === id) return false
    
    // Check direct
    const directPrereqs = getPrerequisites(hoveredId)
    if (directPrereqs.includes(id)) return { type: "prerequisite", depth: 1 }
    
    const directUnlocks = getUnlocks(hoveredId)
    if (directUnlocks.includes(id)) return { type: "unlock", depth: 1 }

    // Check level 2
    for (const p of directPrereqs) {
      if (getPrerequisites(p).includes(id)) return { type: "prerequisite", depth: 2 }
    }
    for (const u of directUnlocks) {
      if (getUnlocks(u).includes(id)) return { type: "unlock", depth: 2 }
    }

    return false
  }

  // Localized Labels
  const getOrdinalLabel = (num: number, type: 'year' | 'term') => {
    if (lang === 'en') {
      const suffixes = ["th", "st", "nd", "rd"]
      const suffix = (num <= 3) ? suffixes[num] : suffixes[0]
      return `${num}${suffix} ${type === 'year' ? t.year : t.term}`
    }
    return `${num}º ${type === 'year' ? t.year : t.term}`
  }

  // Statistics
  const completedInObjective = completed.filter(id => currentCurriculum.some(s => s.id === id))
  const progressPercent = Math.round((completedInObjective.length / currentCurriculum.length) * 100)

  if (!isLoaded) return null

  return (
    <div className="container fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="back-link" style={{ textDecoration: 'none', color: 'var(--muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> {translations[lang].back}
          </Link>
          <LanguageSwitcher />
        </div>
        
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: '900', color: '#000', letterSpacing: '-0.03em' }}>{t.title}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '0.5rem', fontWeight: '500' }}>{t.subtitle}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
            {/* Objective Selector */}
            <div style={{ 
              background: '#f1f5f9', 
              padding: '4px', 
              borderRadius: '14px', 
              display: 'flex',
              gap: '4px',
              border: '1px solid var(--border)'
            }}>
              <button 
                onClick={() => changeObjective('intermediate')}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: objective === 'intermediate' ? 'white' : 'transparent',
                  color: objective === 'intermediate' ? '#000' : 'var(--muted)',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: objective === 'intermediate' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {t.intermediate}
              </button>
              <button 
                onClick={() => changeObjective('degree')}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: objective === 'degree' ? 'white' : 'transparent',
                  color: objective === 'degree' ? '#000' : 'var(--muted)',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: objective === 'degree' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {t.full}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          background: 'white', 
          borderRadius: '24px', 
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#000' }}>{t.stats.progress}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted)', fontSize: '0.7rem', fontWeight: '500', opacity: 0.8 }}>
                  <Info size={12} />
                  <span>{t.storageNotice}</span>
                </div>
              </div>
              <span style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--accent)' }}>{progressPercent}%</span>
            </div>
            <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '900' }}>{completedInObjective.length}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase' }}>{t.stats.completed}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '900' }}>{currentCurriculum.length - completedInObjective.length}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase' }}>{t.stats.remaining}</span>
            </div>
          </div>
        </div>

        {/* Search Input - Relocated below stats */}
        <div style={{ position: 'relative', width: '100%', marginTop: '1.5rem' }}>
          <input 
            type="text"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem 1rem 1rem 3rem',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              fontSize: '1rem',
              background: 'white',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
            }}
          />
          <Search size={22} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', opacity: 0.5 }} />
          {search && (
            <button 
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

      </header>

      <main style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${filteredYears.length}, 1fr)`, 
        gap: '2rem', 
        alignItems: 'start',
        overflowX: 'auto',
        padding: '1rem',
        paddingBottom: '4rem',
        margin: '0 -1rem' // Compensate container padding
      }}>
        {filteredYears.map(year => (
          <section key={year} style={{ minWidth: '280px', padding: '0.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ background: '#000', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem' }}>{getOrdinalLabel(year, 'year')}</span>
              <div style={{ height: '2px', flex: 1, background: 'var(--border)', opacity: 0.5 }}></div>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem' }}>
              {searchedCurriculum.filter(s => s.year === year).map(subject => {
                const relation = isRelatated(subject.id)
                const isCompleted = completed.includes(subject.id)
                const isLocked = subject.prerequisites.some(p => !completed.includes(p))
                const isHovered = hoveredId === subject.id

                let cardStyle: React.CSSProperties = {
                  padding: '0.8rem',
                  borderRadius: '14px',
                  background: isLocked ? '#f1f5f9' : 'white',
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  opacity: isLocked ? 0.5 : (hoveredId ? (relation ? 1 : 0.8) : 1),
                  transform: isHovered ? 'scale(1.04)' : 'none',
                  boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
                  zIndex: isHovered ? 100 : (relation ? 50 : 1)
                }

                if (relation && relation.type === "prerequisite") {
                  cardStyle.borderColor = '#ef4444'
                  cardStyle.borderWidth = '2.5px'
                  cardStyle.background = '#fef2f2'
                  cardStyle.boxShadow = '0 0 25px rgba(239, 68, 68, 0.25)'
                } else if (relation && relation.type === "unlock") {
                  cardStyle.borderColor = '#0070f3'
                  cardStyle.borderWidth = '2.5px'
                  cardStyle.background = 'rgba(0, 112, 243, 0.08)'
                  cardStyle.boxShadow = '0 0 25px rgba(0, 112, 243, 0.25)'
                } else if (isCompleted) {
                  cardStyle.borderColor = '#10b981'
                  cardStyle.background = 'rgba(16, 185, 129, 0.05)'
                }

                return (
                  <div 
                    key={subject.id} 
                    style={cardStyle}
                    onMouseEnter={() => setHoveredId(subject.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => toggleCompleted(subject.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.6rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#000', opacity: 0.9 }}>
                          #{subject.id} <span style={{ color: 'var(--muted)', opacity: 0.7 }}>• {getOrdinalLabel(subject.term, 'term')}</span>
                        </span>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: '0.9rem', 
                          fontWeight: relation ? '900' : '800', 
                          lineHeight: 1.2, 
                          color: relation ? (relation.type === 'prerequisite' ? '#ef4444' : '#0070f3') : (isCompleted ? '#059669' : (isLocked ? 'var(--muted)' : '#000'))
                        }}>
                          {t.subjectNames[subject.id as keyof typeof t.subjectNames] || subject.name}
                        </h3>
                      </div>
                      <div 
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          border: `1.5px solid ${isCompleted ? '#10b981' : (isLocked ? '#e2e8f0' : 'var(--border)')}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isCompleted ? '#10b981' : (isLocked ? '#f1f5f9' : 'transparent'),
                          color: 'white',
                          transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                      >
                        {isCompleted ? <CheckCircle size={14} /> : (isLocked ? <Lock size={12} style={{ color: 'var(--muted)', opacity: 0.8 }} /> : null)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.3rem', flexDirection: 'column' }}>
                        {getUnlocks(subject.id).length > 0 && isHovered && (
                          <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', marginTop: '0.2rem' }}>
                             <Star size={10} style={{ color: 'var(--accent)' }} />
                             <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: '800' }}>
                               {t.unlocks}: {getUnlocks(subject.id).map(p => `#${p}`).join(', ')}
                             </span>
                          </div>
                        )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </main>

      <footer style={{ marginTop: '5rem', padding: '2rem 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="https://github.com/zzzNata/Mapa-Interactivo-CiberDefensa-UNDEF" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '500', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Star size={14} style={{ color: '#fbbf24', fill: '#fbbf24', opacity: 0.9 }} />
          {translations[lang].credits}
        </a>
        <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>{translations[lang].footer}</span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', color: 'inherit' }}>
              <Youtube size={20} />
          </a>
          <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', color: 'inherit' }}>
              <Github size={18} />
          </a>
        </div>
      </footer>
    </div>
  )
}

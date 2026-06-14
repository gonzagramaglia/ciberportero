'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"
import { translations } from "@/lib/translations"
import { curriculum, Subject } from "@/data/curriculum"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { CheckCircle, Info, Lock, ChevronLeft, Layers, Star, Zap, Github, Youtube, Search, X, Calendar, ExternalLink } from "lucide-react"
import NotificationBanners from "@/components/NotificationBanners"
import CountdownWidget from "@/components/CountdownWidget"
import { normalizeString } from "@/lib/string-utils"
import { useSession } from "next-auth/react"
import { getUserProgress, updateUserProgress } from "@/lib/actions"
import SyncedBadge from "@/components/SyncedBadge"
import { SignInButton, SignOutButton } from "@/components/AuthButtons"
import CommentSection from "@/components/CommentSection"

export default function PlanPage() {
  const { lang } = useLanguage()
  const { data: session, status } = useSession()
  const t = translations[lang]
  const pt = translations[lang].plan
  const [completed, setCompleted] = useState<number[]>([])
  const [inProgress, setInProgress] = useState<number[]>([])
  const [objective, setObjective] = useState<'intermediate' | 'degree'>('degree')
  const [search, setSearch] = useState('')
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage and Sync with Cloud
  useEffect(() => {
    const isGuest = status === 'unauthenticated' || !session;
    const completedKey = isGuest ? "ciberportero_completed_subjects" : "ciberportero_user_completed_subjects";
    const inProgressKey = isGuest ? "ciberportero_inprogress_subjects" : "ciberportero_user_inprogress_subjects";
    const objectiveKey = isGuest ? "ciberportero_plan_objective" : "ciberportero_user_plan_objective";

    const savedCompleted = localStorage.getItem(completedKey)
    if (savedCompleted) {
      try { setCompleted(JSON.parse(savedCompleted)) } catch (e) { setCompleted([]) }
    } else {
      setCompleted([])
    }

    const savedInProgress = localStorage.getItem(inProgressKey)
    if (savedInProgress) {
      try { setInProgress(JSON.parse(savedInProgress)) } catch (e) { setInProgress([]) }
    } else {
      setInProgress([])
    }

    const savedObj = localStorage.getItem(objectiveKey)
    if (savedObj === 'intermediate' || savedObj === 'degree') {
      setObjective(savedObj)
    } else {
      setObjective('degree')
    }

    // Cloud Sync ONLY for users
    if (session?.user?.id) {
      getUserProgress().then(data => {
        if (data) {
          setCompleted(data.completed)
          setInProgress(data.inProgress)
          localStorage.setItem("ciberportero_user_completed_subjects", JSON.stringify(data.completed))
          localStorage.setItem("ciberportero_user_inprogress_subjects", JSON.stringify(data.inProgress))
        }
      })
    }

    setIsLoaded(true)
  }, [session, status])

  useEffect(() => {
    document.title = `Ciberportero | ${pt.title}`
  }, [lang, pt.title])


  // Cycle through states: Pending (0) -> In Progress (1) -> Completed (2) -> Pending (0)
  const toggleSubjectState = (id: number) => {
    // Prevent toggling locked subjects
    const subject = curriculum.find(s => s.id === id)
    const isLocked = subject?.prerequisites.some(p => !completed.includes(p))
    if (isLocked) return

    const isCompleted = completed.includes(id)
    const isInProgress = inProgress.includes(id)

    const isGuest = !session;
    const completedKey = isGuest ? "ciberportero_completed_subjects" : "ciberportero_user_completed_subjects";
    const inProgressKey = isGuest ? "ciberportero_inprogress_subjects" : "ciberportero_user_inprogress_subjects";

    if (!isInProgress && !isCompleted) {
      // Transition to In Progress
      const nextInProgress = [...inProgress, id]
      setInProgress(nextInProgress)
      localStorage.setItem(inProgressKey, JSON.stringify(nextInProgress))
      if (session?.user?.id) updateUserProgress(completed, nextInProgress);
    } else if (isInProgress) {
      // Transition to Completed
      const nextInProgress = inProgress.filter(i => i !== id)
      const nextCompleted = [...completed, id]
      setInProgress(nextInProgress)
      setCompleted(nextCompleted)
      localStorage.setItem(inProgressKey, JSON.stringify(nextInProgress))
      localStorage.setItem(completedKey, JSON.stringify(nextCompleted))
      if (session?.user?.id) updateUserProgress(nextCompleted, nextInProgress);
    } else {
      // Transition to Pending
      const nextCompleted = completed.filter(c => c !== id)
      setCompleted(nextCompleted)
      localStorage.setItem(completedKey, JSON.stringify(nextCompleted))
      if (session?.user?.id) updateUserProgress(nextCompleted, inProgress);
    }
  }

  const changeObjective = (obj: 'intermediate' | 'degree') => {
    const isGuest = !session;
    const objectiveKey = isGuest ? "ciberportero_plan_objective" : "ciberportero_user_plan_objective";
    setObjective(obj)
    localStorage.setItem(objectiveKey, obj)
  }

  // Filtering Logic
  const currentCurriculum = objective === 'intermediate'
    ? curriculum.filter(s => s.id <= 23)
    : curriculum

  const searchedCurriculum = currentCurriculum.filter(s => {
    const localizedName = pt.subjectNames[s.id as keyof typeof pt.subjectNames] || s.name
    const searchNorm = normalizeString(search)
    return (
      normalizeString(s.name).includes(searchNorm) ||
      normalizeString(localizedName).includes(searchNorm) ||
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
      return `${num}${suffix} ${type === 'year' ? pt.year : pt.term}`
    }
    return `${num}º ${type === 'year' ? pt.year : pt.term}`
  }

  // Statistics
  const completedInObjective = completed.filter(id => currentCurriculum.some(s => s.id === id))
  const inProgressInObjective = inProgress.filter(id => currentCurriculum.some(s => s.id === id))
  const totalSubjects = currentCurriculum.length
  const progressPercent = Math.round((completedInObjective.length / totalSubjects) * 100)
  const inProgressPercent = Math.round((inProgressInObjective.length / totalSubjects) * 100)

  if (!isLoaded) {
    return (
      <div className="container" style={{ paddingTop: '12vh' }}>
        <div className="space-y-12">
          <div style={{ marginBottom: '4rem' }}>
            <div style={{ height: '3.5rem', width: '250px', background: '#f1f5f9', borderRadius: '12px', marginBottom: '1rem', animation: 'pulse 2.5s infinite' }} />
            <div style={{ height: '1.2rem', width: '400px', background: '#f8fafc', borderRadius: '8px', animation: 'pulse 2.5s infinite' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} style={{ height: '180px', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', padding: '1.5rem', animation: 'pulse 2.5s infinite', animationDelay: `${i * 0.15}s` }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#f1f5f9', flexShrink: 0 }} />
                  <div style={{ flex: 1, paddingTop: '0.25rem' }}>
                    <div style={{ height: '1.2rem', width: '80%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '0.5rem' }} />
                    <div style={{ height: '0.8rem', width: '40%', background: '#f8fafc', borderRadius: '4px' }} />
                  </div>
                </div>
                <div style={{ height: '12px', width: '100%', background: '#f8fafc', borderRadius: '4px', marginBottom: '0.75rem' }} />
                <div style={{ height: '12px', width: '90%', background: '#f8fafc', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .6; } }
          .space-y-12 > * + * { margin-top: 3rem; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container fade-in page-container">
      <CountdownWidget />

      <NotificationBanners />


      <header style={{ marginBottom: '3rem' }}>
        <div className="nav-header-row">
          <Link href="/" className="back-link">
            <ChevronLeft size={18} /> {translations[lang].back}
          </Link>
          <div className="mobile-only">
            <LanguageSwitcher />
          </div>
        </div>

        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.5rem' }}>
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.2rem' }}>
              <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: '900', color: '#000', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                {pt.title}
                <div style={{
                  opacity: status === 'loading' ? 0 : 1,
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {status !== 'loading' && (session ? <SignOutButton /> : <SignInButton />)}
                </div>
              </h1>
              <div className="mobile-hide">
                  <LanguageSwitcher />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <p style={{ color: 'var(--muted)', fontSize: '1.2rem', margin: 0, fontWeight: '500' }}>
                {session?.user ? (
                  <>
                    <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{t.dashboard.welcome}, {session.user.name?.split(' ')[0] || 'Estudiante'}!</span>{' '}
                    <span dangerouslySetInnerHTML={{ __html: pt.description }} />
                  </>
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: pt.description }} />
                )}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                {pt.full}
              </button>
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
                {pt.intermediate}
              </button>
            </div>

            {/* PDF Link — always next to the switch */}
            <a
              href="https://undef.edu.ar/fadena/wp-content/uploads/2025/10/Plan-de-estudios-CIBERDEFENSA.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="pdf-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                color: 'var(--accent)',
                fontWeight: '700',
                padding: '0.4rem 0.8rem',
                background: 'rgba(0, 112, 243, 0.05)',
                borderRadius: '10px',
                textDecoration: 'none',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <ExternalLink size={16} />
              Plan Oficial (PDF)
            </a>
          </div>
        </div>

        {/* Combined Stats & Search Card */}
        <div style={{
          marginTop: '2rem',
          background: 'white',
          borderRadius: '24px',
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}>
          {/* Stats Bar */}
          <div style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '1rem', color: '#000', opacity: 0.8 }}>{pt.stats.progress}:</span>
                    <span style={{ fontWeight: '900', fontSize: '1.25rem', color: '#000' }}>{progressPercent}%</span>
                  </div>
                  <div className="storage-notice-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--muted)', fontSize: '0.7rem', fontWeight: '500', opacity: 0.6 }}>
                    <Info size={11} />
                    <span>{pt.storageNotice}</span>
                  </div>
                </div>
              </div>
              <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--success)', transition: 'width 0.5s' }}></div>
                <div style={{ width: `${inProgressPercent}%`, height: '100%', background: '#fbbf24', transition: 'width 0.5s' }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '900', color: '#fbbf24' }}>{inProgressInObjective.length}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase' }}>{pt.inProgress}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '900', color: 'var(--success)' }}>{completedInObjective.length}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  {completedInObjective.length === 1 ? pt.completed : (pt.completedPlural || pt.completed)}
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '900' }}>{totalSubjects - completedInObjective.length}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase' }}>{pt.stats.remaining}</span>
              </div>
            </div>
          </div>

          {/* Integrated Search Input */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder={pt.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '1.25rem 1rem 1.25rem 3.5rem',
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                background: '#f8fafc',
                transition: 'all 0.2s',
                fontWeight: '600'
              }}
            />
            <Search size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', opacity: 0.6 }} />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

      </header>

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#000' }}>
          <Layers size={22} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          {objective === 'intermediate' 
            ? (lang === 'en' ? 'University Analyst in Cyber Risk Management' : lang === 'pt' ? 'Analista Universitário em Gestão de Riscos Cibernéticos' : 'Analista Universitario en Gestión de Riesgos Cibernéticos')
            : (lang === 'en' ? 'Bachelor in Cyberdefense' : lang === 'pt' ? 'Licenciatura em Ciberdefesa' : 'Licenciatura en Ciberdefensa')
          }
        </h2>
      </div>

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
                const isInProgress = inProgress.includes(subject.id)
                const isLocked = subject.prerequisites.some(p => !completed.includes(p))
                const isHovered = hoveredId === subject.id

                let cardStyle: React.CSSProperties = {
                  padding: '0.8rem',
                  borderRadius: '14px',
                  background: isLocked ? '#f1f5f9' : 'white',
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
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
                } else if (isInProgress) {
                  cardStyle.borderColor = '#fbbf24'
                  cardStyle.background = 'rgba(251, 191, 36, 0.12)'
                  cardStyle.boxShadow = 'inset 0 0 15px rgba(251, 191, 36, 0.05)'
                }

                return (
                  <div
                    key={subject.id}
                    style={cardStyle}
                    onMouseEnter={() => setHoveredId(subject.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => toggleSubjectState(subject.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.6rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#000', opacity: 0.9 }}>
                          [{subject.id.toString().padStart(2, '0')}] <span style={{ color: 'var(--muted)', opacity: 0.7 }}>• {getOrdinalLabel(subject.term, 'term')}</span>
                        </span>
                        <h3 style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          fontWeight: relation ? '900' : '800',
                          lineHeight: 1.2,
                          color: relation ? (relation.type === 'prerequisite' ? '#ef4444' : '#0070f3') : (isCompleted ? '#059669' : (isLocked ? 'var(--muted)' : (isInProgress ? '#d97706' : '#000')))
                        }}>
                          {pt.subjectNames[subject.id as keyof typeof pt.subjectNames] || subject.name}
                        </h3>
                        {isInProgress && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                            <Zap size={10} fill="#fbbf24" style={{ color: '#fbbf24' }} />
                            <span style={{ fontSize: '0.6rem', fontWeight: '900', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{pt.inProgress}</span>
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: `1.5px solid ${isCompleted ? '#10b981' : (isInProgress ? '#fbbf24' : (isLocked ? '#e2e8f0' : 'var(--border)'))}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isCompleted ? '#10b981' : (isInProgress ? '#fbbf24' : (isLocked ? '#f1f5f9' : 'transparent')),
                          color: 'white',
                          transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                      >
                        {isCompleted ? <CheckCircle size={14} /> : (isInProgress ? <Zap size={12} fill="white" /> : (isLocked ? <Lock size={12} style={{ color: 'var(--muted)', opacity: 0.8 }} /> : null))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.3rem', flexDirection: 'column' }}>
                      {getUnlocks(subject.id).length > 0 && isHovered && (
                        <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center', marginTop: '0.2rem' }}>
                          <Star size={10} style={{ color: 'var(--accent)' }} />
                          <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: '800' }}>
                            {pt.unlocks}: {getUnlocks(subject.id).map(p => `[${p.toString().padStart(2, '0')}]`).join(', ')}
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
      <CommentSection postSlug="plan" lang={lang} />

      <footer className="footer-main footer-stacked">
        <a href="https://github.com/zzzNata/Mapa-Interactivo-CiberDefensa-UNDEF" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '500', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Star size={14} style={{ color: '#fbbf24', fill: '#fbbf24', opacity: 0.9 }} />
          {translations[lang].credits}
        </a>
        <span style={{ fontSize: '0.9rem', opacity: 0.6, color: 'var(--muted)' }}>{translations[lang].footer}</span>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          <a href="https://github.com/gonzagramaglia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', color: 'var(--muted)' }}>
            <Github size={18} />
          </a>
          <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', color: 'var(--muted)' }}>
            <Youtube size={20} />
          </a>
        </div>
      </footer>
    </div>
  )
}

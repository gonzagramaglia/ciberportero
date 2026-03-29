"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, CheckCircle, Clock, Star, ExternalLink, Book, MessageSquare, Check } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { translations } from "@/lib/translations"

const MATERIAS_1CUAT = [
    "[01] Análisis Matemático I",
    "[02] Álgebra I",
    "[03] Gestión de Servicios de Información",
    "[04] Inglés I",
    "[05] Sistemas Operativos I"
]

export function ProgressList() {
  const { lang } = useLanguage()
  const t = translations[lang].dashboard
  
  const [examTitle, setExamTitle] = useState("")
  const [type, setType] = useState("autoevaluacion")
  const [materia, setMateria] = useState(MATERIAS_1CUAT[0])
  const [campusLink, setCampusLink] = useState("")
  const [calificacion, setCalificacion] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [progress, setProgress] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [filterMateria, setFilterMateria] = useState("Todas")
  
  // Deletion Confirmation States
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)
  const [deleteTimer, setDeleteTimer] = useState<any>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("ciberportero_progress")
    if (saved) {
      try {
        setProgress(JSON.parse(saved))
      } catch (e) {
        console.error("Error loading progress", e)
        setProgress([])
      }
    } else {
      setProgress([])
    }
  }, [])

  // Sync to localStorage
  const saveProgress = (newList: any[]) => {
    setProgress(newList)
    localStorage.setItem("ciberportero_progress", JSON.stringify(newList))
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setIsAdding(true)
    
    const newItem = {
      id: Date.now().toString(),
      examTitle,
      type,
      subject: materia,
      campusLink,
      calificacion,
      observaciones,
      fecha,
      createdAt: new Date().toISOString()
    }
    
    const newList = [newItem, ...progress]
    saveProgress(newList)
    
    setExamTitle("")
    setCampusLink("")
    setCalificacion("")
    setObservaciones("")
    setIsAdding(false)
  }

  function handleDeleteClick(id: string) {
    if (confirmingDelete === id) {
      const newList = progress.filter(item => item.id !== id)
      saveProgress(newList)
      setConfirmingDelete(null)
      if (deleteTimer) clearTimeout(deleteTimer)
    } else {
      setConfirmingDelete(id)
      if (deleteTimer) clearTimeout(deleteTimer)
      const timer = setTimeout(() => {
        setConfirmingDelete(null)
      }, 1500)
      setDeleteTimer(timer)
    }
  }

  // Filter and dynamic grouping
  const filteredProgress = filterMateria === "Todas" 
    ? progress 
    : progress.filter(p => p.subject === filterMateria)

  const grouped = filteredProgress.reduce((acc: any, item: any) => {
    if (!acc[item.subject]) acc[item.subject] = []
    acc[item.subject].push(item)
    return acc
  }, {})

  return (
    <div className="progress-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#000' }}>{t.tracking.title}</h2>
      </div>

      {/* Entry Form */}
      <form onSubmit={handleAdd} style={{ 
        display: 'flex', 
        gap: '1.5rem', 
        marginBottom: '2.5rem', 
        background: 'white', 
        padding: '2.5rem', 
        borderRadius: '24px',
        border: '1px solid var(--border)',
        flexDirection: 'column',
        boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--muted)' }}>{t.tracking.materia}</label>
                <select 
                    value={materia} 
                    onChange={e => setMateria(e.target.value)}
                    style={{ padding: '1.1rem', borderRadius: '14px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' }}
                >
                    {MATERIAS_1CUAT.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--muted)' }}>{t.tracking.tipo}</label>
                    <select 
                        value={type} 
                        onChange={e => setType(e.target.value)}
                        style={{ padding: '1.1rem', borderRadius: '14px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem', cursor: 'pointer' }}
                    >
                        <option value="autoevaluacion">📚 {t.list.autoevaluacion}</option>
                        <option value="parcial">🎯 {t.list.parcial}</option>
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--muted)' }}>{t.tracking.nombre}</label>
                    <input type="text" placeholder={t.tracking.placeholderTarea} value={examTitle} onChange={e => setExamTitle(e.target.value)} required style={{ padding: '1.1rem', borderRadius: '14px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr 1fr', gap: '1.2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--muted)' }}>{t.tracking.link}</label>
                    <input type="url" placeholder="https://campus.fadena.undef.edu.ar/..." value={campusLink} onChange={e => setCampusLink(e.target.value)} style={{ padding: '1.1rem', borderRadius: '14px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--muted)' }}>{t.tracking.calificacion}</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input type="number" min="0" max="100" placeholder="0" value={calificacion} onChange={e => {
                                const val = parseInt(e.target.value)
                                if (isNaN(val)) setCalificacion("")
                                else if (val > 100) setCalificacion("100")
                                else if (val < 0) setCalificacion("0")
                                else setCalificacion(val.toString())
                            }} style={{ padding: '1.1rem', paddingRight: '2.5rem', borderRadius: '14px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem', textAlign: 'center', width: '100%', cursor: 'pointer', fontWeight: '700' }} />
                        <span style={{ position: 'absolute', right: '1.2rem', fontWeight: '900', color: 'var(--muted)', pointerEvents: 'none' }}>%</span>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--muted)' }}>{t.tracking.fecha}</label>
                    <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required style={{ padding: '1.1rem', borderRadius: '14px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem', cursor: 'pointer' }} />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--muted)' }}>{t.tracking.observaciones}</label>
                <textarea 
                    placeholder={t.tracking.placeholderObservaciones} 
                    value={observaciones} 
                    onChange={e => setObservaciones(e.target.value)}
                    style={{ 
                        padding: '1.1rem', 
                        borderRadius: '14px', 
                        border: '1px solid var(--border)', 
                        background: '#f8fafc', 
                        fontSize: '1rem', 
                        fontFamily: 'inherit',
                        minHeight: '80px', 
                        resize: 'vertical' 
                    }} 
                />
            </div>
        </div>

        <button type="submit" disabled={isAdding} style={{ marginTop: '0.5rem', padding: '1.2rem', borderRadius: '18px', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', transition: 'all 0.2s', boxShadow: '0 10px 25px rgba(0, 112, 243, 0.25)' }}>
          {isAdding ? t.tracking.isAdding : <><Plus size={24} /> {t.tracking.submit}</>}
        </button>
      </form>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '2.2rem' }}>
        <button 
          onClick={() => setFilterMateria("Todas")}
          style={{ padding: '0.7rem 1.4rem', borderRadius: '100px', background: filterMateria === "Todas" ? 'var(--accent)' : 'white', color: filterMateria === "Todas" ? 'white' : 'var(--muted)', border: '1px solid var(--border)', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
        >
          {t.filters.all}
        </button>
        {MATERIAS_1CUAT.map(m => (
          <button 
            key={m} 
            onClick={() => setFilterMateria(m)}
            style={{ padding: '0.7rem 1.4rem', borderRadius: '100px', background: filterMateria === m ? 'var(--accent)' : 'white', color: filterMateria === m ? 'white' : 'var(--muted)', border: '1px solid var(--border)', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
          >
            {m.split('] ')[1] || m}
          </button>
        ))}
      </div>

      <div className="grouped-list">
        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--muted)', background: 'white', border: '2px dashed var(--border)', borderRadius: '30px' }}>
            <Book size={64} style={{ marginBottom: '1.5rem', opacity: 0.1 }} />
            <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>{t.list.empty}</p>
          </div>
        ) : (
          Object.entries(grouped).map(([subject, items]: [string, any]) => (
            <div key={subject} style={{ 
              marginBottom: '3.5rem', 
              background: '#ffffff', 
              padding: '2.5rem', 
              borderRadius: '35px',
              border: '1px solid var(--border)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.02)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                marginBottom: '2.2rem', 
                paddingBottom: '1.2rem',
                borderBottom: '2px dashed var(--border)'
              }}>
                <div style={{ background: 'rgba(0,112,243,0.08)', padding: '0.8rem', borderRadius: '16px', color: 'var(--accent)' }}>
                  <Book size={26} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.02em' }}>{subject}</h3>
                <span style={{ marginLeft: 'auto', fontSize: '0.9rem', background: '#f1f5f9', color: 'var(--muted)', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: '800' }}>{items.length} {t.list.records}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {items.map((item: any) => {
                  const scoreVal = parseInt(item.calificacion || "0")
                  const isHigh = scoreVal >= 70
                  const isMid = scoreVal >= 50
                  
                  const scoreColor = isHigh ? '#059669' : isMid ? '#d97706' : '#dc2626'
                  const scoreBg = isHigh ? '#f0fdf4' : isMid ? '#fffbeb' : '#fef2f2'
                  const scoreBorder = isHigh ? '#bcf0da' : isMid ? '#fde68a' : '#fecaca'
                  
                  const typeColor = item.type === 'parcial' ? '#6366f1' : '#0d9488'
                  const typeBg = item.type === 'parcial' ? '#e0e7ff' : '#ccfbf1'
                  
                  return (
                    <div key={item.id} style={{ 
                      display: 'flex', flexDirection: 'column', padding: '1.8rem', border: '1px solid var(--border)', borderRadius: '28px', background: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.01)', gap: '1.5rem', position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.2rem' }}>
                          <div style={{ marginTop: '0.3rem', color: typeColor }}><CheckCircle size={30} /></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.75rem', color: typeColor, background: typeBg, padding: '0.3rem 0.8rem', borderRadius: '100px', fontWeight: '900', textTransform: 'uppercase', width: 'fit-content', letterSpacing: '0.05em' }}>
                              {item.type === 'parcial' ? t.list.parcial : t.list.autoevaluacion}
                            </span>
                            <h3 style={{ fontWeight: '800', fontSize: '1.4rem', color: '#111827', margin: '0.4rem 0' }}>{item.examTitle}</h3>
                            
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                              {item.campusLink && (
                                <a href={item.campusLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: '700' }}>
                                  <ExternalLink size={16} /> {t.list.campus}
                                </a>
                              )}
                              <span style={{ fontSize: '0.9rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                                <Clock size={16} /> {new Date(item.fecha + 'T12:00:00').toLocaleDateString(lang === 'es' ? 'es-AR' : lang === 'pt' ? 'pt-BR' : 'en-US')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                          {item.calificacion && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: scoreBg, padding: '0.8rem 1.2rem', borderRadius: '20px', border: `1.5px solid ${scoreBorder}` }}>
                              <Star size={18} fill={scoreColor} color={scoreColor} />
                              <span style={{ fontWeight: '900', color: scoreColor, fontSize: '1.3rem' }}>{item.calificacion}%</span>
                            </div>
                          )}
                          <button 
                            onClick={() => handleDeleteClick(item.id)} 
                            style={{ 
                                padding: '0.8rem', 
                                borderRadius: '16px', 
                                background: confirmingDelete === item.id ? '#fef2f2' : '#f8fafc', 
                                color: confirmingDelete === item.id ? '#dc2626' : '#94a3b8', 
                                border: `1px solid ${confirmingDelete === item.id ? '#fecaca' : 'var(--border)'}`, 
                                cursor: 'pointer', 
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '46px'
                            }}
                          >
                            {confirmingDelete === item.id ? <Check size={24} /> : <Trash2 size={24} />}
                          </button>
                        </div>
                      </div>

                      {item.observaciones && (
                        <div style={{ background: '#f9fafb', padding: '1.2rem', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          <MessageSquare size={18} style={{ color: '#94a3b8', marginTop: '0.2rem' }} />
                          <p style={{ margin: 0, fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.5', fontWeight: '500' }}>{item.observaciones}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

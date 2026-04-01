"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, CheckCircle, Clock, Star, ExternalLink, Book, MessageSquare, Check, Zap } from "lucide-react"
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
        gap: '2rem', 
        marginBottom: '2.5rem', 
        background: 'white', 
        padding: '2.5rem', 
        borderRadius: '30px',
        border: '1px solid var(--border)',
        flexDirection: 'column',
        boxShadow: '0 8px 40px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Row 1: Primary Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1.2fr) 1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--muted)' }}>{t.tracking.materia}</label>
                    <select 
                        value={materia} 
                        onChange={e => setMateria(e.target.value)}
                        style={{ padding: '1.1rem', borderRadius: '16px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                        {MATERIAS_1CUAT.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--muted)' }}>{t.tracking.tipo}</label>
                    <select 
                        value={type} 
                        onChange={e => setType(e.target.value)}
                        style={{ padding: '1.1rem', borderRadius: '16px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem', cursor: 'pointer' }}
                    >
                        <option value="tp">📖 {t.list.tp}</option>
                        <option value="autoevaluacion">📚 {t.list.autoevaluacion}</option>
                        <option value="parcial">🎯 {t.list.parcial}</option>
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--muted)' }}>{t.tracking.fecha}</label>
                    <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required style={{ padding: '1.1rem', borderRadius: '16px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem', cursor: 'pointer' }} />
                </div>
            </div>

            {/* Row 2: Secondary Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 2fr 1.2fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--muted)' }}>{t.tracking.nombre}</label>
                    <input type="text" placeholder={t.tracking.placeholderTarea} value={examTitle} onChange={e => setExamTitle(e.target.value)} required style={{ padding: '1.1rem', borderRadius: '16px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--muted)' }}>{t.tracking.link}</label>
                    <input type="url" placeholder="https://campus.fadena.undef.edu.ar/..." value={campusLink} onChange={e => setCampusLink(e.target.value)} style={{ padding: '1.1rem', borderRadius: '16px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1rem' }} />
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
                            }} style={{ padding: '1.1rem', paddingRight: '2.5rem', borderRadius: '16px', border: '1px solid var(--border)', background: '#f8fafc', fontSize: '1.1rem', textAlign: 'center', width: '100%', cursor: 'pointer', fontWeight: '900', color: 'var(--accent)' }} />
                        <span style={{ position: 'absolute', right: '1.2rem', fontWeight: '900', color: 'var(--muted)', pointerEvents: 'none', opacity: 0.5 }}>%</span>
                    </div>
                </div>
            </div>

            {/* Row 3: Observaciones + Submit */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--muted)' }}>{t.tracking.observaciones}</label>
                    <input 
                        type="text"
                        placeholder={t.tracking.placeholderObservaciones} 
                        value={observaciones} 
                        onChange={e => setObservaciones(e.target.value)}
                        style={{ 
                            padding: '1.1rem', 
                            borderRadius: '16px', 
                            border: '1px solid var(--border)', 
                            background: '#f8fafc', 
                            fontSize: '1rem'
                        }} 
                    />
                </div>
                <button type="submit" disabled={isAdding} style={{ height: '54px', padding: '0 2.5rem', borderRadius: '16px', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', transition: 'all 0.2s', boxShadow: '0 10px 25px rgba(0, 112, 243, 0.25)' }}>
                  {isAdding ? t.tracking.isAdding : <><Plus size={22} /> {t.tracking.submit}</>}
                </button>
            </div>
        </div>
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

      <div className="grouped-list" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '4rem'
      }}>
        {Object.keys(grouped).length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem', color: 'var(--muted)', background: 'white', border: '2px dashed var(--border)', borderRadius: '30px' }}>
            <Book size={64} style={{ marginBottom: '1.5rem', opacity: 0.1 }} />
            <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>{t.list.empty}</p>
          </div>
        ) : (
          Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([subject, items]: [string, any]) => (
            <div key={subject} style={{ 
              background: '#ffffff', 
              padding: '1.8rem', 
              borderRadius: '28px',
              border: '1px solid var(--border)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.8rem', 
                marginBottom: '1.8rem', 
                paddingBottom: '1rem',
                borderBottom: '2px dashed var(--border)'
              }}>
                <div style={{ background: 'rgba(0,112,243,0.08)', padding: '0.6rem', borderRadius: '12px', color: 'var(--accent)' }}>
                  <Book size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.02em', flex: 1 }}>{subject}</h3>
                <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: 'var(--muted)', padding: '0.4rem 0.8rem', borderRadius: '100px', fontWeight: '800', whiteSpace: 'nowrap' }}>{items.length}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {items
                  .sort((a: any, b: any) => {
                    const priority: any = { tp: 1, autoevaluacion: 2, parcial: 3 }
                    return priority[a.type] - priority[b.type]
                  })
                  .map((item: any) => {
                  const scoreVal = parseInt(item.calificacion || "0")
                  const isHigh = scoreVal >= 70
                  const isMid = scoreVal >= 50
                  
                  const scoreColor = isHigh ? '#059669' : isMid ? '#d97706' : '#dc2626'
                  const scoreBg = isHigh ? '#f0fdf4' : isMid ? '#fffbeb' : '#fef2f2'
                  const scoreBorder = isHigh ? '#bcf0da' : isMid ? '#fde68a' : '#fecaca'
                  
                  const typeColor = item.type === 'tp' ? '#0891b2' : item.type === 'autoevaluacion' ? '#d97706' : '#C60B1E'
                  const typeBg = item.type === 'tp' ? '#ecfeff' : item.type === 'autoevaluacion' ? '#fffbeb' : '#fef2f2'
                  const TypeIcon = item.type === 'tp' ? Book : item.type === 'autoevaluacion' ? Zap : CheckCircle
                  
                  return (
                    <div key={item.id} style={{ 
                      display: 'flex', flexDirection: 'column', padding: '1.2rem', border: '1px solid var(--border)', borderRadius: '20px', background: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.01)', gap: '1rem', position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                          <div style={{ marginTop: '0.2rem', color: typeColor }}><TypeIcon size={24} /></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <span style={{ fontSize: '0.65rem', color: typeColor, background: typeBg, padding: '0.2rem 0.6rem', borderRadius: '100px', fontWeight: '900', textTransform: 'uppercase', width: 'fit-content', letterSpacing: '0.05em' }}>
                              {item.type === 'parcial' ? t.list.parcial : item.type === 'tp' ? t.list.tp : t.list.autoevaluacion}
                            </span>
                            <h4 style={{ fontWeight: '800', fontSize: '1.1rem', color: '#111827', margin: '0.2rem 0', lineHeight: 1.2 }}>{item.examTitle}</h4>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.1rem', flexWrap: 'wrap' }}>
                              {item.campusLink && (
                                <a href={item.campusLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontWeight: '700' }}>
                                  <ExternalLink size={14} /> Campus
                                </a>
                              )}
                              <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                                <Clock size={14} /> {new Date(item.fecha + 'T12:00:00').toLocaleDateString(lang === 'es' ? 'es-AR' : lang === 'pt' ? 'pt-BR' : 'en-US')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.8rem' }}>
                          {item.calificacion && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: scoreBg, padding: '0.5rem 0.8rem', borderRadius: '14px', border: `1.5px solid ${scoreBorder}` }}>
                              <span style={{ fontWeight: '900', color: scoreColor, fontSize: '1.1rem' }}>{item.calificacion}%</span>
                            </div>
                          )}
                          <button 
                            onClick={() => handleDeleteClick(item.id)} 
                            style={{ 
                                padding: '0.5rem', 
                                borderRadius: '10px', 
                                background: confirmingDelete === item.id ? '#fef2f2' : '#f8fafc', 
                                color: confirmingDelete === item.id ? '#dc2626' : '#94a3b8', 
                                border: `1px solid ${confirmingDelete === item.id ? '#fecaca' : 'var(--border)'}`, 
                                cursor: 'pointer', 
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                          >
                            {confirmingDelete === item.id ? <Check size={18} /> : <Trash2 size={18} />}
                          </button>
                        </div>
                      </div>

                      {item.observaciones && (
                        <div style={{ background: '#f9fafb', padding: '0.8rem', borderRadius: '14px', border: '1px solid #f1f5f9', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                          <MessageSquare size={14} style={{ color: '#94a3b8', marginTop: '0.1rem' }} />
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.4', fontWeight: '500' }}>{item.observaciones}</p>
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

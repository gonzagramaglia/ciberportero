"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Plus, Trash2, CheckCircle, Clock, Star, ExternalLink, Book, MessageSquare, Check, Zap, Search } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { translations } from "@/lib/translations"

import { curriculum, Subject } from "@/data/curriculum"
import { normalizeString } from "@/lib/string-utils"

const DASHBOARD_CURRICULUM = curriculum.filter(s => s.year <= 2);
const ALL_TERMS = Array.from(new Set(DASHBOARD_CURRICULUM.map(s => `${s.year}.${s.term}`))).sort();

export function ProgressList() {
  const { lang } = useLanguage()
  const t = translations[lang].dashboard
  const { data: session } = useSession()
  
  const [examTitle, setExamTitle] = useState("")
  const [type, setType] = useState("autoevaluacion")
  const [selectedTerm, setSelectedTerm] = useState("1.1")
  const [materia, setMateria] = useState("")
  const [campusLink, setCampusLink] = useState("")
  const [calificacion, setCalificacion] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [progress, setProgress] = useState<any[]>([])
  const [isAdding, setIsAdding] = useState(false)
  
  // Advanced Filter State
  const [filterYear, setFilterYear] = useState<string | "Todas">("1")
  const [filterTerm, setFilterTerm] = useState<string | "Todas">("1")
  const [filterMateria, setFilterMateria] = useState("Todas")
  
  // Deletion Confirmation States
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)
  const [deleteTimer, setDeleteTimer] = useState<any>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getSubjectName = (s: Subject) => {
    const pt = translations[lang].plan;
    const name = pt.subjectNames[s.id as keyof typeof pt.subjectNames] || s.name;
    return `[${s.id.toString().padStart(2, '0')}] ${name}`;
  };

  const getSubjectTerm = (subjectName: string) => {
    const idMatch = subjectName.match(/(\d+)/);
    if (!idMatch) return null;
    const id = parseInt(idMatch[1]);
    const subject = curriculum.find(s => s.id === id);
    return subject ? `${subject.year}.${subject.term}` : null;
  };

  const getTermLabel = (termKey: string) => {
    if (termKey === "Todas") return t.filters.all;
    const [y, t_num] = termKey.split('.');
    return `${y}º Año - ${t_num}º Cuatri`;
  };

  const [materiaSearch, setMateriaSearch] = useState("")
  const [isMateriaDropdownOpen, setIsMateriaDropdownOpen] = useState(false)
  
  // Subjects for the FORM (Searchable across all 1st and 2nd year)
  const subjectsInForm = DASHBOARD_CURRICULUM.map(getSubjectName);

  const filteredSubjectsInForm = subjectsInForm.filter(s => 
    normalizeString(s).includes(normalizeString(materiaSearch))
  );

  // Set default materia when term changes or component mounts
  useEffect(() => {
    const subjectsInTerm = DASHBOARD_CURRICULUM
      .filter(s => `${s.year}.${s.term}` === selectedTerm)
      .map(getSubjectName);
      
    if (subjectsInTerm.length > 0 && (!materia || !subjectsInTerm.includes(materia))) {
        // Only auto-change if user hasn't typed anything or item is totally different
        if (!materiaSearch || !DASHBOARD_CURRICULUM.some(s => getSubjectName(s) === materiaSearch)) {
          setMateria(subjectsInTerm[0]);
          setMateriaSearch(subjectsInTerm[0]);
        }
    }
  }, [selectedTerm, lang]);

  // Load from localStorage on mount
  useEffect(() => {
    const isGuest = !session;
    const progressKey = isGuest ? "ciberportero_progress" : "ciberportero_user_progress";
    const saved = localStorage.getItem(progressKey)
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
  }, [session])

  // Sync to localStorage
  const saveProgress = (newList: any[]) => {
    const isGuest = !session;
    const progressKey = isGuest ? "ciberportero_progress" : "ciberportero_user_progress";
    setProgress(newList)
    localStorage.setItem(progressKey, JSON.stringify(newList))
  }

  // Handle Close Search Dropdown on Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMateriaDropdownOpen(false);
        // If we have a selected materia, make sure search text matches it
        if (materia) setMateriaSearch(materia);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [materia]);

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
    setMateria("")
    setMateriaSearch("")
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

  // REFINED FILTERING LOGIC
  const currentFilterTermKey = (filterYear === "Todas" || filterTerm === "Todas") ? "Todas" : `${filterYear}.${filterTerm}`;

  const progressByTerm = filterYear === "Todas"
      ? progress
      : progress.filter(p => {
          const term = getSubjectTerm(p.subject);
          if (!term) return false;
          const [y, t] = term.split('.');
          if (filterTerm === "Todas") return y === filterYear;
          return term === `${filterYear}.${filterTerm}`;
      });

  const filteredProgress = filterMateria === "Todas" 
    ? progressByTerm 
    : progressByTerm.filter(p => p.subject === filterMateria);

  const grouped = filteredProgress.reduce((acc: any, item: any) => {
    if (!acc[item.subject]) acc[item.subject] = []
    acc[item.subject].push(item)
    return acc
  }, {})

  // Dynamic Subjects for current selection
  const subjectsInSelection = DASHBOARD_CURRICULUM
      .filter(s => {
          if (filterYear === "Todas") return true;
          if (filterTerm === "Todas") return s.year === parseInt(filterYear);
          return s.year === parseInt(filterYear) && s.term === parseInt(filterTerm);
      })
      .map(getSubjectName);

  // Counts
  const getMateriaCount = (m: string) => progress.filter(p => p.subject === m).length;
  const getYearCount = (y: string) => progress.filter(p => getSubjectTerm(p.subject)?.startsWith(y)).length;
  const getTermCount = (y: string, t: string) => progress.filter(p => getSubjectTerm(p.subject) === `${y}.${t}`).length;

  return (
    <div className="progress-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#000' }}>{t.tracking.title}</h2>
      </div>

      {/* Entry Form */}
      <form onSubmit={handleAdd} className="progress-form">
        <div className="form-container">
            {/* Row 1: Primary Selection */}
            <div className="form-row">
                <div className="form-group">
                    <label>{translations[lang].plan.year} / {translations[lang].plan.term}</label>
                    <select 
                        value={selectedTerm} 
                        onChange={e => setSelectedTerm(e.target.value)}
                    >
                        {ALL_TERMS.map(term => (
                            <option key={term} value={term}>{getTermLabel(term)}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group flex-1-2" style={{ position: 'relative' }} ref={dropdownRef}>
                    <label>{t.tracking.materia}</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Book size={18} style={{ position: 'absolute', left: '1.2rem', color: 'var(--muted)', opacity: 0.5, zIndex: 1 }} />
                        <input 
                            type="text"
                            placeholder={translations[lang].plan.search}
                            value={materiaSearch}
                            onFocus={() => {
                                setMateriaSearch("");
                                setIsMateriaDropdownOpen(true);
                            }}
                            onChange={(e) => {
                                setMateriaSearch(e.target.value);
                                setMateria(""); // Clear selection to force pick from list
                                setIsMateriaDropdownOpen(true);
                            }}
                            style={{ paddingLeft: '3.2rem' }}
                        />
                    </div>
                    
                    {isMateriaDropdownOpen && (
                        <div 
                          className="subject-dropdown" 
                          style={{ 
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, 
                            background: 'white', borderRadius: '16px', marginTop: '0.5rem',
                            border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            maxHeight: '250px', overflowY: 'auto', padding: '0.5rem'
                          }}
                        >
                            {filteredSubjectsInForm.map(s => (
                                <div 
                                    key={s}
                                    onClick={() => {
                                        setMateria(s);
                                        setMateriaSearch(s);
                                        setIsMateriaDropdownOpen(false);
                                        
                                        // Auto-update term for user convenience
                                        const term = getSubjectTerm(s);
                                        if (term) setSelectedTerm(term);
                                    }}
                                    style={{ 
                                        padding: '0.8rem 1rem', borderRadius: '10px', cursor: 'pointer',
                                        background: materia === s ? 'black' : 'transparent',
                                        color: materia === s ? 'white' : 'inherit',
                                        fontSize: '0.9rem', fontWeight: 600,
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => { if (materia !== s) e.currentTarget.style.background = '#f8fafc' }}
                                    onMouseLeave={(e) => { if (materia !== s) e.currentTarget.style.background = 'transparent' }}
                                >
                                    {s}
                                </div>
                            ))}
                            {filteredSubjectsInForm.length === 0 && (
                                <div style={{ padding: '1rem', color: 'var(--muted)', textAlign: 'center', fontSize: '0.85rem' }}>
                                    {t.list.empty}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="form-group">
                    <label>{t.tracking.tipo}</label>
                    <select 
                        value={type} 
                        onChange={e => setType(e.target.value)}
                    >
                        <option value="tp">📖 {t.list.tp}</option>
                        <option value="autoevaluacion">📚 {t.list.autoevaluacion}</option>
                        <option value="parcial">🎯 {t.list.parcial}</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>{t.tracking.fecha}</label>
                    <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
                </div>
            </div>

            {/* Row 2: Secondary Info */}
            <div className="form-row">
                <div className="form-group flex-2-5">
                    <label>{t.tracking.nombre}</label>
                    <input type="text" placeholder={t.tracking.placeholderTarea} value={examTitle} onChange={e => setExamTitle(e.target.value)} required />
                </div>
                <div className="form-group flex-2">
                    <label>{t.tracking.link}</label>
                    <input type="url" placeholder="https://campus.fadena.undef.edu.ar/..." value={campusLink} onChange={e => setCampusLink(e.target.value)} />
                </div>
                <div className="form-group flex-1-2">
                    <label>{t.tracking.calificacion}</label>
                    <div className="input-with-icon">
                        <input type="number" min="0" max="100" placeholder="0" value={calificacion} onChange={e => {
                                const val = parseInt(e.target.value)
                                if (isNaN(val)) setCalificacion("")
                                else if (val > 100) setCalificacion("100")
                                else if (val < 0) setCalificacion("0")
                                else setCalificacion(val.toString())
                            }} />
                        <span className="input-suffix">%</span>
                    </div>
                </div>
            </div>

            {/* Row 3: Observaciones + Submit */}
            <div className="form-row-last">
                <div className="form-group flex-1">
                    <label>{t.tracking.observaciones}</label>
                    <input 
                        type="text"
                        placeholder={t.tracking.placeholderObservaciones} 
                        value={observaciones} 
                        onChange={e => setObservaciones(e.target.value)}
                    />
                </div>
                <button type="submit" disabled={isAdding} className="form-submit-button">
                  {isAdding ? t.tracking.isAdding : <><Plus size={22} /> {t.tracking.submit}</>}
                </button>
            </div>
        </div>
      </form>

      {/* Modern Filter Dashboard */}
      <div className="filter-dashboard" style={{ 
          background: 'white', 
          borderRadius: '24px', 
          padding: '1.5rem', 
          border: '1px solid var(--border)', 
          marginBottom: '3rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="filter-group">
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'block' }}>{translations[lang].plan.year}</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {["Todas", "1", "2"].map(y => (
                        <button 
                            key={y}
                            onClick={() => { setFilterYear(y); setFilterTerm("Todas"); setFilterMateria("Todas"); }}
                            style={{ 
                                padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                background: filterYear === y ? 'black' : '#f1f5f9',
                                color: filterYear === y ? 'white' : '#475569',
                                border: 'none'
                            }}
                        >
                            {y === "Todas" ? t.filters.all : `${y}º ${translations[lang].plan.year}`}
                        </button>
                    ))}
                </div>
            </div>

            {filterYear !== "Todas" && (
                <div className="filter-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'block' }}>{translations[lang].plan.term}</label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {["Todas", "1", "2"].map(term => (
                            <button 
                                key={term}
                                onClick={() => { setFilterTerm(term); setFilterMateria("Todas"); }}
                                style={{ 
                                    padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                    background: filterTerm === term ? 'black' : '#f8fafc',
                                    color: filterTerm === term ? 'white' : '#64748b',
                                    border: 'none'
                                }}
                            >
                                {term === "Todas" ? t.filters.all : `${term}º ${translations[lang].plan.term}`}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="filter-subjects">
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>{t.tracking.materia}</label>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => setFilterMateria("Todas")}
                    style={{ 
                        padding: '0.5rem 1.2rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                        background: filterMateria === "Todas" ? 'black' : 'white',
                        color: filterMateria === "Todas" ? 'white' : '#64748b',
                        border: '1px solid #e2e8f0'
                    }}
                >
                    {t.filters.all} ({progressByTerm.length})
                </button>
                {subjectsInSelection.map(m => {
                    const count = getMateriaCount(m);
                    // Only show subjects with records OR if a specific semester is picked
                    if (count === 0 && filterTerm === "Todas" && filterYear === "Todas") return null;
                    
                    const isBlocked = count === 0;

                    return (
                        <button 
                            key={m} 
                            onClick={() => !isBlocked && setFilterMateria(m)}
                            disabled={isBlocked}
                            style={{ 
                                padding: '0.5rem 1.2rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700, cursor: isBlocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                                background: filterMateria === m ? 'black' : 'white',
                                color: filterMateria === m ? 'white' : isBlocked ? '#94a3b8' : '#64748b',
                                border: `1px solid ${filterMateria === m ? 'black' : isBlocked ? '#f1f5f9' : '#e2e8f0'}`,
                                opacity: isBlocked ? 0.7 : 1,
                                filter: isBlocked ? 'grayscale(1)' : 'none'
                            }}
                        >
                            {m} {count > 0 ? `(${count})` : ''}
                        </button>
                    );
                })}
            </div>
        </div>
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

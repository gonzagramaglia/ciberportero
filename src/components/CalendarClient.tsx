'use client'

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { translations } from "@/lib/translations"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { useSession } from "next-auth/react"
import { createPersonalEvent, deleteCalendarEvent } from "@/lib/actions"
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Bell, Github, Youtube, Search, Filter, Copy, Check, Info, Lock, Plus, Trash2, X as CloseIcon, GraduationCap } from "lucide-react"
import NotificationBanners from "@/components/NotificationBanners"
import SyncedBadge from "@/components/SyncedBadge"

interface AcademicEvent {
  id: string;
  date: string; // ISO format (YYYY-MM-DD)
  title: Record<string, string>;
  type: string;
  desc: Record<string, string>;
  subjectId?: string;
  userId?: string | null;
}

interface CalendarClientProps {
  initialEvents: AcademicEvent[];
  lang: string;
}

export default function CalendarClient({ initialEvents, lang }: CalendarClientProps) {
  const { data: session, status } = useSession()
  const t = translations[lang as keyof typeof translations]
  const ct = t.calendar
  const st = t.plan.subjectNames
  
  const [allEvents, setAllEvents] = useState(initialEvents)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'exam', subjectId: 'all' })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setAllEvents(initialEvents)
  }, [initialEvents])

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [emailCopied, setEmailCopied] = useState(false)

  const handleSaveEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    setIsSaving(true);
    const res = await createPersonalEvent(newEvent);
    if (res.success) {
      setIsAddModalOpen(false);
      setNewEvent({ title: '', date: '', type: 'exam', subjectId: 'all' });
      // The page will revalidate and refresh initialEvents because it's a server action
    }
    setIsSaving(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm(lang === 'es' ? '¿Eliminar este evento?' : 'Delete this event?')) return;
    await deleteCalendarEvent(id);
  };

  const handleCopyEmail = () => {
      const email = "ciberportero@gmail.com";
      navigator.clipboard.writeText(email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
  };

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const title = event.title[lang] || event.title['es'] || '';
      const desc = event.desc[lang] || event.desc['es'] || '';
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            desc.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = subjectFilter === 'all' || event.subjectId === subjectFilter;
      return matchesSearch && matchesSubject;
    });
  }, [allEvents, lang, searchTerm, subjectFilter]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    
    const days = []
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day-empty"></div>)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      const dayEvents = filteredEvents.filter(e => e.date === dateStr)
      const hasEvent = dayEvents.length > 0
      const hasPersonalEvent = dayEvents.some(e => e.userId)
      const isSelected = selectedDate && selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day
      const isToday = new Date().getFullYear() === year && new Date().getMonth() === month && new Date().getDate() === day

      days.push(
        <div 
          key={day} 
          className={`calendar-day ${hasEvent ? `event-${dayEvents[0].type}` : ''} ${hasPersonalEvent ? 'has-personal' : ''} ${isSelected ? 'selected' : ''} ${isSelected && hasEvent ? `selected-${dayEvents[0].type}` : ''} ${isToday ? 'today' : ''} ${!hasEvent && (searchTerm || subjectFilter !== 'all') ? 'dimmed' : ''}`}
          onClick={() => setSelectedDate(new Date(year, month, day))}
        >
          <span className="day-number">{day}</span>
          {hasEvent && (
              <div className="day-event-preview">
                  <span className="preview-dot"></span>
                  <span className="preview-text">{dayEvents[0].title[lang] || dayEvents[0].title['es']}</span>
              </div>
          )}
        </div>
      )
    }
    
    return days
  }

  const selectedEvents = filteredEvents.filter(e => {
    if (!selectedDate) return false
    const d = new Date(e.date + 'T00:00:00')
    return d.getFullYear() === selectedDate.getFullYear() && 
           d.getMonth() === selectedDate.getMonth() && 
           d.getDate() === selectedDate.getDate()
  })

  const upcomingEvents = filteredEvents.filter(e => {
      const d = new Date(e.date + 'T00:00:00');
      return d >= new Date();
  }).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  const availableSubjects = useMemo(() => {
      // Show all subjects for filtering
      return Object.entries(st).map(([id, name]) => ({ id, name }));
  }, [st]);

  return (
    <div className="container fade-in page-container">
      <NotificationBanners />

      <header style={{ marginBottom: '3rem' }}>
        <div className="nav-header-row">
          <Link href="/" className="back-link">
            <ArrowLeft size={18} /> {t.back}
          </Link>
          <LanguageSwitcher />
        </div>
        
        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: '900', color: '#000', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center' }}>
              {ct.title}
              <SyncedBadge />
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '0.5rem', fontWeight: '500' }} dangerouslySetInnerHTML={{ __html: ct.description }} />
          </div>
          {status === 'authenticated' && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="add-event-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#000',
                color: '#fff',
                padding: '0.8rem 1.5rem',
                borderRadius: '14px',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <Plus size={20} />
              {lang === 'es' ? 'Añadir evento' : lang === 'pt' ? 'Adicionar evento' : 'Add event'}
            </button>
          )}
        </div>
      </header>

      <div className="calendar-notice">
          <Info size={18} color="#eab308" />
          <p>{ct.notice}</p>
      </div>

      <div className="calendar-controls">
          <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder={lang === 'es' ? 'Buscar evento...' : lang === 'pt' ? 'Procurar evento...' : 'Search event...'} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="filter-box locked" title={ct.periodMessage} style={{ 
              background: '#f1f5f9', 
              borderColor: '#cbd5e1', 
              opacity: 0.7, 
              cursor: 'not-allowed',
              position: 'relative'
          }}>
              <Lock size={16} color="#64748b" />
              <select disabled style={{ 
                  cursor: 'not-allowed', 
                  color: '#64748b',
                  fontWeight: '600',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none'
              }}>
                <option>{ct.firstPeriod}</option>
              </select>
          </div>
          <div className="filter-box">
              <Filter size={18} />
              <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                <option value="all">{lang === 'es' ? 'Todas las materias' : lang === 'pt' ? 'Todas as matérias' : 'All subjects'}</option>
                {availableSubjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name as string}</option>
                ))}
              </select>
          </div>
      </div>

      <main className="calendar-layout">
        <div className="calendar-main-card">
          <div className="calendar-header">
            <div className="calendar-current-month">
              <CalendarIcon size={20} style={{ color: '#eab308' }} />
              <h2>{ct.months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            </div>
            <div className="calendar-nav-buttons">
              <button onClick={prevMonth} aria-label="Previous Month"><ChevronLeft size={20} /></button>
              <button onClick={nextMonth} aria-label="Next Month"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="calendar-weekdays">
            {ct.days.map((day : string) => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {renderCalendar()}
          </div>

          <div className="calendar-legend">
              <div className="legend-item"><div className="legend-dot exam"></div> <span>{lang === 'es' ? 'Exámenes' : lang === 'pt' ? 'Exames' : 'Exams'}</span></div>
              <div className="legend-item"><div className="legend-dot enrollment"></div> <span>{lang === 'es' ? 'Tareas/TPs' : lang === 'pt' ? 'Tarefas/TPs' : 'Assignments'}</span></div>
          </div>
        </div>

        <div className="calendar-sidebar">
          {selectedDate && (
            <div className="selection-card">
              <div className="selection-header">
                <Clock size={16} />
                <h3>
                  {lang === 'es' ? (
                    `${ct.fullDays[selectedDate.getDay()]} ${selectedDate.getDate()} de ${ct.months[selectedDate.getMonth()]}`
                  ) : lang === 'pt' ? (
                    `${ct.fullDays[selectedDate.getDay()]}, ${selectedDate.getDate()} de ${ct.months[selectedDate.getMonth()]}`
                  ) : (
                    `${ct.fullDays[selectedDate.getDay()]}, ${ct.months[selectedDate.getMonth()]} ${selectedDate.getDate()}`
                  )}
                </h3>
              </div>
              
              <div className="selection-content">
                {selectedEvents.length > 0 ? (
                  selectedEvents.map((event, idx) => (
                    <div key={idx} className={`event-detail-item type-${event.type}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="event-type-tag">
                            {(ct.events[event.type as keyof typeof ct.events] || event.type)}
                            {event.userId && ` (${lang === 'es' ? 'personal' : lang === 'pt' ? 'pessoal' : 'personal'})`}
                            {event.subjectId && (event.subjectId !== 'all') && ` • ${(st as any)[event.subjectId]}`}
                        </div>
                        {(session?.user?.id === event.userId || session?.user?.email === 'ciberportero@gmail.com') && (
                          <button 
                            onClick={() => handleDeleteEvent(event.id)}
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', opacity: 0.6, padding: '4px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <h4>{event.title[lang] || event.title['es']}</h4>
                      <p>{event.desc[lang] || event.desc['es']}</p>
                    </div>
                  ))
                ) : (
                  <div className="empty-selection">
                    <p>{searchTerm || subjectFilter !== 'all' ? (lang === 'es' ? 'No hay eventos que coincidan' : 'No matching events') : ct.events.empty}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="upcoming-card">
            <div className="upcoming-header">
              <Bell size={16} />
              <h3>{ct.events.upcoming}</h3>
            </div>
            <div className="upcoming-list">
              {upcomingEvents.length > 0 ? upcomingEvents.map((event, idx) => {
                  const d = new Date(event.date + 'T00:00:00');
                  return (
                    <div key={idx} className="upcoming-item" onClick={() => {
                        setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
                        setSelectedDate(d);
                    }}>
                        <div className="upcoming-date">
                            <span className="upcoming-day">{d.getDate()}</span>
                            <span className="upcoming-month">{ct.months[d.getMonth()].slice(0, 3)}</span>
                        </div>
                        <div className="upcoming-info">
                            <h4>{event.title[lang] || event.title['es']}</h4>
                            <span className={`upcoming-tag tag-${event.type}`}>
                                {ct.events[event.type as keyof typeof ct.events] || event.type}
                                {event.userId && ` (${lang === 'es' ? 'personal' : lang === 'pt' ? 'pessoal' : 'personal'})`}
                            </span>
                        </div>
                    </div>
                  );
              }) : (
                  <div className="empty-upcoming">
                      <p style={{ opacity: 0.5, fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>{lang === 'es' ? 'Sin eventos próximos' : 'No upcoming events'}</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="feedback-section" style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '1.5rem', opacity: 0.8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500, color: 'var(--muted)' }}>
              {t.reporting?.text}
          </p>
          <button 
            onClick={handleCopyEmail}
            className="feedback-email-btn"
            style={{ 
                background: 'none',
                border: 'none',
                color: '#eab308', 
                textDecoration: 'none', 
                fontWeight: 700, 
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                transition: 'all 0.2s'
            }}
          >
              {t.reporting?.cta}
              {emailCopied ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderLeft: '1px solid rgba(234, 179, 8, 0.3)', paddingLeft: '0.8rem' }}>
                      <span style={{ fontSize: '0.85rem' }}>{t.contact?.copied}</span>
                      <Check size={16} />
                  </div>
              ) : (
                  <Copy size={16} />
              )}
          </button>
      </div>

      <footer className="footer-main">
          <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
              <Github size={18} />
          </a>
          <span>{t.footer}</span>
          <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
              <Youtube size={22} />
          </a>
      </footer>

      {isAddModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="modal-content" style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: '900' }}>{lang === 'es' ? 'Nuevo evento personal' : 'New personal event'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <CloseIcon size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--muted)' }}>{lang === 'es' ? 'Título' : 'Title'}</label>
                <input 
                  type="text" 
                  value={newEvent.title} 
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Ej: Entrega de TP1"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--muted)' }}>{lang === 'es' ? 'Fecha' : 'Date'}</label>
                <input 
                  type="date" 
                  value={newEvent.date} 
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--muted)' }}>{lang === 'es' ? 'Tipo' : 'Type'}</label>
                <select 
                  value={newEvent.type} 
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                >
                  <option value="exam">{lang === 'es' ? 'Examen' : 'Exam'}</option>
                  <option value="enrollment">{lang === 'es' ? 'Tarea / Entrega' : 'Task / Assignment'}</option>
                  <option value="classes">{lang === 'es' ? 'Clase' : 'Class'}</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--muted)' }}>{lang === 'es' ? 'Materia (opcional)' : 'Subject (optional)'}</label>
                <select 
                  value={newEvent.subjectId} 
                  onChange={(e) => setNewEvent({...newEvent, subjectId: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                >
                  <option value="all">{lang === 'es' ? 'General / Todas' : 'General / All'}</option>
                  {availableSubjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name as string}</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={handleSaveEvent}
                disabled={isSaving}
                style={{
                  background: '#000',
                  color: '#fff',
                  padding: '1rem',
                  borderRadius: '14px',
                  border: 'none',
                  fontWeight: '800',
                  marginTop: '0.5rem',
                  cursor: 'pointer',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                {isSaving ? (lang === 'es' ? 'Guardando...' : 'Saving...') : (lang === 'es' ? 'Guardar' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-controls {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 2.5rem;
            background: white;
            padding: 1rem 1.5rem;
            border-radius: 20px;
            border: 1px solid var(--border);
            box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }

        .search-box, .filter-box {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            flex: 1;
            padding: 0.5rem 1rem;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid transparent;
            transition: all 0.2s;
            color: var(--muted);
        }

        .search-box:focus-within, .filter-box:focus-within {
            background: white;
            border-color: #eab308;
            box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.05);
            color: #eab308;
        }

        .search-box input, .filter-box select {
            border: none;
            background: transparent;
            width: 100%;
            outline: none;
            font-size: 0.95rem;
            font-weight: 500;
            color: #000;
        }

        .calendar-notice {
            background: rgba(234, 179, 8, 0.05);
            border: 1px solid rgba(234, 179, 8, 0.1);
            border-left: 4px solid #eab308;
            padding: 1rem 1.25rem;
            border-radius: 16px;
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
            animation: slideUp 0.5s ease-out;
        }

        .calendar-notice p {
            margin: 0;
            color: #854d0e;
            font-size: 0.95rem;
            font-weight: 600;
            line-height: 1.5;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .calendar-layout {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .calendar-main-card {
          background: white;
          border-radius: 30px;
          border: 1px solid var(--border);
          padding: 2.5rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.03);
          height: fit-content;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .calendar-current-month {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .calendar-current-month h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 800;
          color: #000;
        }

        .calendar-nav-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .calendar-nav-buttons button {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--muted);
        }

        .calendar-nav-buttons button:hover {
          background: #f8fafc;
          border-color: #eab308;
          color: #eab308;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          margin-bottom: 1rem;
        }

        .weekday {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          opacity: 0.6;
          letter-spacing: 0.05em;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.75rem;
        }

        :global(.calendar-day) {
          aspect-ratio: 1.2 / 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          padding: 0.6rem;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          background: #f8fafc;
          border: 1px solid transparent;
          overflow: hidden;
        }

        :global(.calendar-day.dimmed) {
            opacity: 0.3;
        }

        :global(.calendar-day:hover) {
          background: white;
          border-color: #eab308;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        :global(.calendar-day.selected) {
          background: #fefce8 !important;
          border-color: #eab308 !important;
          box-shadow: 0 8px 20px rgba(234, 179, 8, 0.15);
          z-index: 10;
        }

        :global(.calendar-day.has-personal) {
          border-color: rgba(139, 92, 246, 0.4);
          background: rgba(139, 92, 246, 0.03);
        }

        :global(.calendar-day.has-personal:hover) {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
        }

        :global(.calendar-day.selected.has-personal) {
          background: #f5f3ff !important;
          border-color: #8b5cf6 !important;
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.15);
        }

        :global(.day-number) {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--muted);
          margin-bottom: 4px;
        }

        :global(.calendar-day.selected .day-number) {
            color: #854d0e;
        }

        :global(.day-event-preview) {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 4px;
            background: white;
            padding: 3px 6px;
            border-radius: 6px;
            border: 1px solid rgba(0,0,0,0.05);
            margin-top: auto;
        }

        :global(.preview-dot) {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            flex-shrink: 0;
            background: #eab308;
        }

        :global(.event-enrollment .preview-dot) { background: #eab308; }
        :global(.event-classes .preview-dot) { background: #0070f3; }
        :global(.event-holiday .preview-dot) { background: #ef4444; }
        :global(.event-exam .preview-dot) { background: #8b5cf6; }

        :global(.preview-text) {
            font-size: 0.6rem;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #1a1a1a;
            letter-spacing: -0.01em;
        }

        .calendar-legend {
            margin-top: 2rem;
            display: flex;
            gap: 1.5rem;
            border-top: 1px solid var(--border);
            padding-top: 1.5rem;
            flex-wrap: wrap;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--muted);
        }

        .legend-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }

        .legend-dot.enrollment { background: #eab308; }
        .legend-dot.classes { background: #0070f3; }
        .legend-dot.holiday { background: #ef4444; }
        .legend-dot.exam { background: #8b5cf6; }

        .calendar-sidebar {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          align-items: stretch;
        }

        .selection-card {
          background: #fefce8;
          border-radius: 24px;
          border: 1px solid #eab308;
          padding: 1.8rem;
          box-shadow: 0 8px 30px rgba(234, 179, 8, 0.08);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        .upcoming-card {
          background: white;
          border-radius: 24px;
          border: 1px solid var(--border);
          padding: 1.8rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
        }

        .selection-header, .upcoming-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1.5rem;
          color: #000;
        }

        .selection-header h3, .upcoming-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .event-detail-item {
          padding: 1.2rem;
          border-radius: 20px;
          background: white;
          border-left: 5px solid var(--border);
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }

        .event-detail-item.type-enrollment { border-left-color: #eab308; }
        .event-detail-item.type-classes { border-left-color: #0070f3; }
        .event-detail-item.type-holiday { border-left-color: #ef4444; }
        .event-detail-item.type-exam { border-left-color: #8b5cf6; }

        .event-type-tag {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          opacity: 0.5;
          margin-bottom: 0.5rem;
        }

        .event-detail-item h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 800;
          color: #000;
        }

        .event-detail-item p {
          margin: 0;
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.5;
        }

        .selection-content, .upcoming-list {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .selection-content {
          justify-content: center;
        }

        .empty-selection {
          text-align: center;
          padding: 1rem 0;
          color: var(--muted);
          font-size: 1rem;
          font-weight: 500;
          opacity: 0.6;
        }

        .upcoming-list {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .upcoming-item {
          display: flex;
          gap: 1.2rem;
          align-items: center;
          cursor: pointer;
          padding: 0.8rem;
          border-radius: 18px;
          transition: all 0.2s;
        }

        .upcoming-item:hover {
          background: #f8fafc;
          transform: translateX(4px);
        }

        .upcoming-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #000;
          color: white;
          padding: 0.6rem;
          border-radius: 12px;
          min-width: 52px;
        }

        .upcoming-day {
          font-size: 1.3rem;
          font-weight: 900;
          line-height: 1;
        }

        .upcoming-month {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          opacity: 0.7;
        }

        .upcoming-info h4 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #000;
        }

        .upcoming-tag {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          display: inline-block;
          margin-top: 0.3rem;
        }

        .tag-enrollment { background: #fef08a; color: #854d0e; }
        .tag-classes { background: #bfdbfe; color: #1e40af; }
        .tag-holiday { background: #fecaca; color: #991b1b; }
        .tag-exam { background: #ddd6fe; color: #5b21b6; }

        .feedback-email-btn:hover {
            background: rgba(234, 179, 8, 0.05);
            transform: translateY(-1px);
        }

        @media (max-width: 900px) {
          .calendar-layout { gap: 1rem; }
          .calendar-sidebar { grid-template-columns: 1fr; }
          .calendar-day { aspect-ratio: 1; }
          .preview-text { display: none; }
          .day-event-preview { width: fit-content; background: transparent; border: none; padding: 0; margin: 0; }
          .preview-dot { width: 8px; height: 8px; }
        }
      `}</style>
    </div>
  )
}

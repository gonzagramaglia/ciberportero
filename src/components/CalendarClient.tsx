'use client'

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { translations, Locale } from "@/lib/translations"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { useLanguage } from "@/context/LanguageContext"
import { useSession } from "next-auth/react"
import { createPersonalEvent, deleteCalendarEvent } from "@/lib/actions"
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Bell, Github, Youtube, Search, Filter, Copy, Check, Info, Lock, Plus, Trash2, X as CloseIcon, GraduationCap, Zap, Tag, ExternalLink, FileText } from "lucide-react"
import NotificationBanners from "@/components/NotificationBanners"
import CountdownWidget from "@/components/CountdownWidget"
import SyncedBadge from "@/components/SyncedBadge"
import { SignInButton, SignOutButton } from "@/components/AuthButtons"
import CommentSection from "@/components/CommentSection"
import { Download, Share2 } from "lucide-react"

interface AcademicEvent {
  id: string;
  startDate: string; // ISO format (YYYY-MM-DD)
  endDate?: string | null;
  title: Record<string, string>;
  type: string;
  period?: string | null;
  subjectId?: string | null;
  desc: Record<string, string>;
  userId?: string | null;
}

interface CalendarClientProps {
  initialEvents: AcademicEvent[];
  lang: string;
}

export default function CalendarClient({ initialEvents, lang: langProp }: CalendarClientProps) {
  const { data: session, status } = useSession()
  const { lang: contextLang } = useLanguage()
  const lang = (contextLang || langProp || 'es') as Locale;
  const t = translations[lang]
  const ct = t.calendar
  const st = t.plan.subjectNames
  
  const [allEvents, setAllEvents] = useState(initialEvents)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', startDate: '', endDate: '', type: 'exam', subjectId: 'all', period: 'all' })
  const [isSaving, setIsSaving] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportConfig, setExportConfig] = useState({
    type: 'all',
    range: 'year',
    subjectId: 'all',
    eventType: 'all'
  })

  const getTypeStyle = (type: string) => {
    const styles: Record<string, { bg: string, border: string, text: string, hover: string }> = {
      exam: { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', hover: '#e0f2fe' },
      quiz_mandatory: { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9', hover: '#ede9fe' },
      enrollment: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', hover: '#dcfce7' },
      classes: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', hover: '#ffedd5' },
      admin: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', hover: '#fee2e2' },
      default: { bg: '#f8fafc', border: '#e2e8f0', text: '#475569', hover: '#f1f5f9' }
    };
    return styles[type] || styles.default;
  };
  

  useEffect(() => {
    setAllEvents(initialEvents)
  }, [initialEvents])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `Ciberportero | ${t.calendar.shortTitle}`;
    }
  }, [lang, t.calendar.shortTitle]);

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [emailCopied, setEmailCopied] = useState(false)

  const handleSaveEvent = async () => {
    if (!newEvent.title || !newEvent.startDate) return;
    setIsSaving(true);
    const res = await createPersonalEvent(newEvent);
    if (res.success) {
      setIsAddModalOpen(false);
      setNewEvent({ title: '', startDate: '', endDate: '', type: 'exam', subjectId: 'all', period: 'all' });
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
      const title = event.title['es'] || '';
      const desc = event.desc['es'] || '';
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            desc.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = subjectFilter === 'all' || event.subjectId === subjectFilter;
      const matchesType = typeFilter === 'all' || event.type === typeFilter;
      const matchesPeriod = periodFilter === 'all' || event.period === periodFilter;
      return matchesSearch && matchesSubject && matchesType && matchesPeriod;
    });
  }, [allEvents, lang, searchTerm, subjectFilter, typeFilter, periodFilter]);

  const formatEventDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const getGoogleCalendarUrl = (event: AcademicEvent) => {
    const title = encodeURIComponent(event.title['es'] || '');
    const details = encodeURIComponent(event.desc['es'] || '');
    
    // Format: YYYYMMDD
    const start = event.startDate.replace(/-/g, '');
    let end = start;
    
    if (event.endDate) {
      const d = new Date(event.endDate + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      end = d.toISOString().split('T')[0].replace(/-/g, '');
    } else {
      const d = new Date(event.startDate + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      end = d.toISOString().split('T')[0].replace(/-/g, '');
    }
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`;
  }

  const handleExport = () => {
    // Determine which events to export
    let toExport = [...allEvents];

    // Filter by type of events
    // Filter by type of events
    if (exportConfig.type === 'personal') {
      toExport = toExport.filter(e => e.userId === session?.user?.id);
    } else if (exportConfig.type === 'custom') {
      if (exportConfig.eventType !== 'all') {
        toExport = toExport.filter(e => e.type === exportConfig.eventType);
      }
      if (exportConfig.subjectId !== 'all') {
        toExport = toExport.filter(e => e.subjectId === exportConfig.subjectId);
      }
    }

    // Filter by time range
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const sixtyDaysLater = new Date(now);
    sixtyDaysLater.setDate(now.getDate() + 60);

    if (exportConfig.range === 'week') {
      toExport = toExport.filter(e => {
        const d = new Date(e.startDate + 'T00:00:00');
        return d >= startOfWeek && d <= endOfWeek;
      });
    } else if (exportConfig.range === 'month') {
      toExport = toExport.filter(e => {
        const d = new Date(e.startDate + 'T00:00:00');
        return d >= startOfMonth && d <= endOfMonth;
      });
    } else if (exportConfig.range === 'sixty') {
      toExport = toExport.filter(e => {
        const d = new Date(e.startDate + 'T00:00:00');
        return d >= now && d <= sixtyDaysLater;
      });
    }

    if (toExport.length === 0) {
      alert(lang === 'es' ? 'No hay eventos que coincidan con los filtros seleccionados.' : 'No events match the selected filters.');
      return;
    }

    // Generate ICS
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Ciberportero//Academic Calendar//ES\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";
    
    toExport.forEach(event => {
      const start = event.startDate.replace(/-/g, '');
      let end = start;
      if (event.endDate) {
        const d = new Date(event.endDate + 'T00:00:00');
        d.setDate(d.getDate() + 1);
        end = d.toISOString().split('T')[0].replace(/-/g, '');
      } else {
        const d = new Date(event.startDate + 'T00:00:00');
        d.setDate(d.getDate() + 1);
        end = d.toISOString().split('T')[0].replace(/-/g, '');
      }
      
      const title = event.title['es'] || '';
      const description = (event.desc['es'] || '').replace(/\n/g, '\\n');
      
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `SUMMARY:${title}\n`;
      icsContent += `DESCRIPTION:${description}\n`;
      icsContent += `DTSTART;VALUE=DATE:${start}\n`;
      icsContent += `DTEND;VALUE=DATE:${end}\n`;
      icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
      icsContent += `UID:${event.id}@ciberportero.com\n`;
      icsContent += "END:VEVENT\n";
    });
    
    icsContent += "END:VCALENDAR";
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ciberportero_${exportConfig.type}_${exportConfig.range}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setIsExportModalOpen(false);
  }

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
      const dayEvents = filteredEvents.filter(e => {
        if (e.startDate === dateStr) return true;
        if (e.endDate) {
          return dateStr >= e.startDate && dateStr <= e.endDate;
        }
        return false;
      })
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
                  <span className="preview-text">{dayEvents[0].title['es']}</span>
              </div>
          )}
        </div>
      )
    }
    
    return days
  }

  const selectedEvents = filteredEvents.filter(e => {
    if (!selectedDate) return false
    const dateStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`
    
    if (e.startDate === dateStr) return true;
    if (e.endDate) {
      return dateStr >= e.startDate && dateStr <= e.endDate;
    }
    return false;
  })

  const upcomingEvents = filteredEvents.filter(e => {
      const d = new Date(e.startDate + 'T00:00:00');
      return d >= new Date();
  }).sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 5);

  const availableSubjects = useMemo(() => {
    // Mapping periods to subject ID ranges
    const rangeMap: Record<string, { start: number; end: number }> = {
      '1.1': { start: 1, end: 5 },
      '1.2': { start: 6, end: 10 },
      '2.1': { start: 11, end: 15 },
      '2.2': { start: 16, end: 20 },
      'all': { start: 1, end: 37 }
    };

    const getSubjectsForPeriod = (p: string) => {
        let rangeKey = 'all';
        if (p === ct.firstPeriod) rangeKey = '1.1';
        else if (p === ct.secondPeriod) rangeKey = '1.2';
        else if (p === ct.thirdPeriod) rangeKey = '2.1';
        else if (p === ct.fourthPeriod) rangeKey = '2.2';
        else if (p === 'all') rangeKey = 'all';

        const { start, end } = rangeMap[rangeKey] || rangeMap['all'];

        return Object.entries(st)
          .filter(([id]) => {
            const numId = parseInt(id);
            return numId >= start && numId <= end;
          })
          .map(([id, name]) => ({ 
            id, 
            name: `[${id.padStart(2, '0')}] ${name}` 
          }));
    };

    return {
        main: getSubjectsForPeriod(periodFilter),
        modal: getSubjectsForPeriod(newEvent.period)
    };
  }, [st, periodFilter, ct, newEvent.period]);

  return (
    <div className="container fade-in page-container">
      <CountdownWidget />

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
            <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: '900', color: '#000', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              {ct.title}
              <div style={{ 
                  opacity: status === 'loading' ? 0 : 1,
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center'
              }}>
                  {status !== 'loading' && (session ? <SignOutButton /> : <SignInButton />)}
              </div>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '0.5rem', fontWeight: '500' }}>
              {session?.user ? (
                <>
                  <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{t.dashboard.welcome}, {session.user.name?.split(' ')[0] || 'Estudiante'}!</span>{' '}
                  <span dangerouslySetInnerHTML={{ __html: ct.description }} />
                </>
              ) : (
                <span dangerouslySetInnerHTML={{ __html: ct.description }} />
              )}
            </p>
          </div>
          {status === 'authenticated' && (
            (session?.user?.role === 'admin' || session?.user?.email === 'ciberportero@gmail.com') ? (
              <Link
                href="/admin/calendar/new"
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
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  textDecoration: 'none'
                }}
              >
                <Plus size={20} />
                {lang === 'es' ? 'Agregar evento' : lang === 'pt' ? 'Adicionar evento' : 'Add event'}
              </Link>
            ) : (
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
                {(translations[lang] as any).calendar.addPersonalized}
              </button>
            )
          )}
        </div>
      </header>

      <div className="calendar-notice">
          <Info size={18} color="#eab308" />
          <p>
            {session?.user ? (
              <>
                <span style={{ fontWeight: 700 }}>{session.user.name?.split(' ')[0] || 'Estudiante'},</span> {ct.notice}
              </>
            ) : ct.notice.charAt(0).toUpperCase() + ct.notice.slice(1)}
          </p>
      </div>

      <div className="calendar-controls">
          <div className="calendar-search-row">
              <div className="search-box">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder={lang === 'es' ? 'Buscar por título o materia...' : lang === 'pt' ? 'Procurar por título ou matéria...' : 'Search by title or subject...'} 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
          <div className="calendar-filters-row">
              <div className="filter-box" title={ct.periodMessage}>
                  <Lock size={16} color="#64748b" />
                  <select 
                    value={periodFilter} 
                    onChange={(e) => {
                      setPeriodFilter(e.target.value);
                      setSubjectFilter('all'); // Reset subject filter when period changes
                    }}
                    style={{ 
                      fontWeight: periodFilter === 'all' ? '800' : '500',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      color: '#1e293b'
                    }}
                  >
                    <option value="all">{ct.allPeriods}</option>
                    <option value={ct.firstPeriod}>{ct.firstPeriod}</option>
                    <option value={ct.secondPeriod}>{ct.secondPeriod}</option>
                    <option value={ct.thirdPeriod}>{ct.thirdPeriod}</option>
                    <option value={ct.fourthPeriod}>{ct.fourthPeriod}</option>
                  </select>
              </div>
              <div className="filter-box">
                  <Filter size={18} />
                  <select 
                value={subjectFilter} 
                onChange={(e) => setSubjectFilter(e.target.value)}
                style={{ fontWeight: subjectFilter === 'all' ? '800' : '500' }}
              >
                    <option value="all">{periodFilter === 'all' ? ct.allSubjects : ct.allSubjectsOfPeriod}</option>
                    {availableSubjects.main.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name as string}</option>
                    ))}
                  </select>
              </div>
              <div className="filter-box">
                  <Tag size={18} />
                  <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{ fontWeight: typeFilter === 'all' ? '800' : '500' }}
                  >
                    <option value="all">{ct.allTypes}</option>
                    <option value="exam">{ct.events.exam}</option>
                    <option value="quiz_mandatory">{ct.events.quizMandatory}</option>
                    <option value="enrollment">{ct.events.enrollment}</option>
                    <option value="classes">{ct.events.classes}</option>
                    <option value="event">{ct.events.others}</option>
                  </select>
              </div>
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

          <div className="calendar-legend" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
                <div className="legend-item"><div className="legend-dot exam"></div> <span>{ct.events.exam}</span></div>
                <div className="legend-item"><div className="legend-dot quiz_mandatory"></div> <span>{ct.events.quizMandatory}</span></div>
                <div className="legend-item"><div className="legend-dot enrollment"></div> <span>{ct.events.enrollment}</span></div>
                <div className="legend-item"><div className="legend-dot classes"></div> <span>{ct.events.classes}</span></div>
                <div className="legend-item"><div className="legend-dot event"></div> <span>{ct.events.others}</span></div>
              </div>

              <button 
                onClick={() => setIsExportModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.8rem 1.2rem',
                  borderRadius: '12px',
                  background: '#fffcf0',
                  color: '#854d0e',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  border: '1px solid #eab308',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  width: 'fit-content'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fef9c3';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 179, 8, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fffcf0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img 
                  src="/google-calendar-logo.png" 
                  alt="Google Calendar"
                  style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                />
                {(ct as any).batchExport.button}
              </button>
          </div>
        </div>

        <div className="calendar-sidebar">
          {selectedDate && (
            <div className={`selection-card ${selectedEvents.some(e => e.userId) ? 'is-personal' : ''}`}>
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
                    <div key={idx} className={`event-detail-item type-${event.type} ${event.userId ? 'is-personal' : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, opacity: 0.7 }}>
                          {lang === 'es' ? (
                            event.endDate 
                              ? `Del ${formatEventDate(event.startDate)} al ${formatEventDate(event.endDate)}:`
                              : `El ${formatEventDate(event.startDate)}:`
                          ) : lang === 'pt' ? (
                            event.endDate 
                              ? `De ${formatEventDate(event.startDate)} a ${formatEventDate(event.endDate)}:`
                              : `Em ${formatEventDate(event.startDate)}:`
                          ) : (
                            event.endDate 
                              ? `From ${formatEventDate(event.startDate)} to ${formatEventDate(event.endDate)}:`
                              : `On ${formatEventDate(event.startDate)}:`
                          )}
                        </span>
                        <div className={`upcoming-tag tag-${event.type}`} style={{ margin: 0, padding: '0.1rem 0.4rem' }}>
                            {(ct.events[event.type as keyof typeof ct.events] || event.type)}
                            {event.userId && ` (${lang === 'es' ? 'personal' : lang === 'pt' ? 'pessoal' : 'personal'})`}
                        </div>
                        {(session?.user?.id === event.userId || session?.user?.email === 'ciberportero@gmail.com') && (
                          <button 
                            onClick={() => handleDeleteEvent(event.id)}
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', opacity: 0.6, padding: '4px', marginLeft: 'auto' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      {event.subjectId && (event.subjectId !== 'all') && (
                        <div style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 800, marginBottom: '0.5rem', color: 'var(--accent)' }}>
                           [{event.subjectId.padStart(2, '0')}] {(st as any)[event.subjectId]}
                        </div>
                      )}
                      <h4 style={{ margin: 0 }}>{event.title['es']}</h4>
                      <p>{event.desc['es']}</p>
                      
                        {(() => {
                          const style = getTypeStyle(event.type);
                          return (
                            <a 
                              href={getGoogleCalendarUrl(event)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                marginTop: '1.2rem',
                                padding: '0.8rem 1.2rem',
                                borderRadius: '12px',
                                background: style.bg,
                                color: style.text,
                                fontSize: '0.85rem',
                                fontWeight: '800',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                border: `1px solid ${style.border}`,
                                width: 'fit-content'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = style.hover;
                                e.currentTarget.style.boxShadow = `0 4px 12px ${style.border}44`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = style.bg;
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <img 
                                src="/google-calendar-logo.png" 
                                alt="Google Calendar"
                                style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                              />
                              {(ct as any).exportToGoogleCalendar}
                            </a>
                          );
                        })()}
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
                  const d = new Date(event.startDate + 'T00:00:00');
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
                            <h4>{event.title['es']}</h4>
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

      <div className="cronogramas-section" style={{ 
          margin: '2rem 0 3rem 0', 
          width: '100%'
      }}>
          <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1rem',
              background: 'rgba(0,0,0,0.02)',
              padding: '1.5rem',
              borderRadius: '24px',
              border: '1px dashed var(--border)'
          }}>
              <a href="https://drive.google.com/file/d/1u18VHM9XDm9j-SedtkJkHy2vi_fv_rsK/view?usp=sharing" target="_blank" className="cronograma-link">
                  <FileText size={18} />
                  <span>
                    {(() => {
                      const [prefix, subject] = ct.schedules.math1.split(/(?=\[)/);
                      return (
                        <>
                          <span className="cronograma-prefix">{prefix.trim()} </span>
                          <span className="cronograma-subject">{subject}</span>
                        </>
                      );
                    })()}
                  </span>
                  <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </a>
              <a href="https://drive.google.com/file/d/1uW0lIVUwM6ElxiWtH3MR6xPxJY9AeQZg/view?usp=sharing" target="_blank" className="cronograma-link">
                  <FileText size={18} />
                  <span>
                    {(() => {
                      const [prefix, subject] = ct.schedules.algebra1.split(/(?=\[)/);
                      return (
                        <>
                          <span className="cronograma-prefix">{prefix.trim()} </span>
                          <span className="cronograma-subject">{subject}</span>
                        </>
                      );
                    })()}
                  </span>
                  <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </a>
              <a href="https://drive.google.com/file/d/195obq3YIJTYLhF__E_tscoEhzU-rNZ_j/view?usp=sharing" target="_blank" className="cronograma-link">
                  <FileText size={18} />
                  <span>
                    {(() => {
                      const [prefix, subject] = ct.schedules.management1.split(/(?=\[)/);
                      return (
                        <>
                          <span className="cronograma-prefix">{prefix.trim()} </span>
                          <span className="cronograma-subject">{subject}</span>
                        </>
                      );
                    })()}
                  </span>
                  <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </a>
              <a href="https://drive.google.com/file/d/1jUHLjjbVx1_D5UMWaCZszFIc25-00JSk/view?usp=sharing" target="_blank" className="cronograma-link">
                  <FileText size={18} />
                  <span>
                    {(() => {
                      const [prefix, subject] = ct.schedules.os1.split(/(?=\[)/);
                      return (
                        <>
                          <span className="cronograma-prefix">{prefix.trim()} </span>
                          <span className="cronograma-subject">{subject}</span>
                        </>
                      );
                    })()}
                  </span>
                  <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </a>
          </div>
      </div>

      <CommentSection postSlug="calendar" lang={lang} />

      <footer className="footer-main" style={{ marginTop: '3rem' }}>
          <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
              <Github size={18} />
          </a>
          <span>{t.footer}</span>
          <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
              <Youtube size={22} />
          </a>
      </footer>

      {/* Batch Export Modal */}
      {isExportModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="modal-content" style={{
            background: 'white',
            padding: '2.5rem',
            borderRadius: '32px',
            width: '100%',
            maxWidth: '550px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
            animation: 'modalFadeUp 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/google-calendar-logo.png" style={{ width: '24px' }} alt="" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>{(ct as any).batchExport.title}</h2>
                </div>
              </div>
              <button 
                onClick={() => setIsExportModalOpen(false)} 
                style={{ border: 'none', background: '#f1f5f9', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Events to Export Section */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ width: '6px', height: '20px', background: '#eab308', borderRadius: '3px' }}></div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{(ct as any).batchExport.eventsToExport}</h3>
                </div>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <label className="export-option">
                    <input type="radio" name="exportType" checked={exportConfig.type === 'all'} onChange={() => setExportConfig({...exportConfig, type: 'all'})} />
                    <div className="option-ui">
                      <span className="radio-dot"></span>
                      <span>{(ct as any).batchExport.allEvents}</span>
                    </div>
                  </label>
                  
                  <label className="export-option">
                    <input type="radio" name="exportType" checked={exportConfig.type === 'custom'} onChange={() => setExportConfig({...exportConfig, type: 'custom'})} />
                    <div className="option-ui">
                      <span className="radio-dot"></span>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <span style={{ fontWeight: 800 }}>{lang === 'es' ? 'Selección personalizada' : lang === 'pt' ? 'Seleção personalizada' : 'Custom selection'}</span>
                        {exportConfig.type === 'custom' && (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <select 
                              value={exportConfig.eventType} 
                              onChange={(e) => setExportConfig({...exportConfig, eventType: e.target.value})}
                              style={{ flex: 1, minWidth: '120px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}
                            >
                              <option value="all">{ct.allTypes}</option>
                              <option value="exam">{ct.events.exam}</option>
                              <option value="quiz_mandatory">{ct.events.quizMandatory}</option>
                              <option value="enrollment">{ct.events.enrollment}</option>
                              <option value="classes">{ct.events.classes}</option>
                            </select>
                            <select 
                              value={exportConfig.subjectId} 
                              onChange={(e) => setExportConfig({...exportConfig, subjectId: e.target.value})}
                              style={{ flex: 2, minWidth: '180px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}
                            >
                              <option value="all">{ct.allSubjects}</option>
                              {Object.entries(st).map(([id, name]) => (
                                <option key={id} value={id}>[{id.padStart(2, '0')}] {name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>

                  {session && (
                    <label className="export-option">
                      <input type="radio" name="exportType" checked={exportConfig.type === 'personal'} onChange={() => setExportConfig({...exportConfig, type: 'personal'})} />
                      <div className="option-ui">
                        <span className="radio-dot"></span>
                        <span>{(ct as any).batchExport.personalEvents}</span>
                      </div>
                    </label>
                  )}
                </div>
              </section>

              {/* Time Period Section */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ width: '6px', height: '20px', background: '#34a853', borderRadius: '3px' }}></div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{(ct as any).batchExport.timePeriod}</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <label className="export-option">
                    <input type="radio" name="exportRange" checked={exportConfig.range === 'week'} onChange={() => setExportConfig({...exportConfig, range: 'week'})} />
                    <div className="option-ui">
                      <span className="radio-dot"></span>
                      <span>{(ct as any).batchExport.thisWeek}</span>
                    </div>
                  </label>
                  <label className="export-option">
                    <input type="radio" name="exportRange" checked={exportConfig.range === 'month'} onChange={() => setExportConfig({...exportConfig, range: 'month'})} />
                    <div className="option-ui">
                      <span className="radio-dot"></span>
                      <span>{(ct as any).batchExport.thisMonth}</span>
                    </div>
                  </label>
                  <label className="export-option">
                    <input type="radio" name="exportRange" checked={exportConfig.range === 'sixty'} onChange={() => setExportConfig({...exportConfig, range: 'sixty'})} />
                    <div className="option-ui">
                      <span className="radio-dot"></span>
                      <span>{(ct as any).batchExport.sixtyDays}</span>
                    </div>
                  </label>
                  <label className="export-option">
                    <input type="radio" name="exportRange" checked={exportConfig.range === 'year'} onChange={() => setExportConfig({...exportConfig, range: 'year'})} />
                    <div className="option-ui">
                      <span className="radio-dot"></span>
                      <span>{(ct as any).batchExport.customRange}</span>
                    </div>
                  </label>
                </div>
              </section>

              {/* Action Section */}
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 1.2rem 0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}>
                  {(ct as any).batchExport.instructions}
                  {' '}
                  <a 
                    href="https://calendar.google.com/calendar/u/0/r/settings/export" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#eab308',
                      textDecoration: 'none',
                      fontWeight: '800',
                      transition: 'all 0.2s',
                      verticalAlign: 'middle'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <ExternalLink size={14} />
                    {lang === 'es' ? 'Abrir Configuración de Google Calendar' : lang === 'pt' ? 'Abrir Configurações do Google Agenda' : 'Open Google Calendar Settings'}
                  </a>
                </p>
                <button 
                  onClick={handleExport}
                  style={{
                    width: '100%',
                    background: '#eab308',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '16px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 8px 20px rgba(234, 179, 8, 0.25)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Download size={20} />
                  {(ct as any).batchExport.generateButton}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .export-option input {
          display: none;
        }
        .option-ui {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 0.8rem 1rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          font-weight: 700;
          color: #475569;
        }
        .export-option input:checked + .option-ui {
          background: #fffcf0;
          border-color: #eab308;
          color: #854d0e;
        }
        .radio-dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .export-option input:checked + .option-ui .radio-dot {
          border-color: #eab308;
          background: #fff;
        }
        .export-option input:checked + .option-ui .radio-dot::after {
          content: '';
          width: 8px;
          height: 8px;
          background: #eab308;
          border-radius: 50%;
        }
        @keyframes modalFadeUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 600px) {
          .floating-export-btn {
            bottom: 1.5rem !important;
            right: 1.5rem !important;
            width: 56px !important;
            height: 56px !important;
          }
          .modal-content {
            padding: 1.5rem !important;
            margin: 1rem;
            max-height: 90vh;
            overflow-y: auto;
          }
          section .export-option div {
            display: flex;
            flex-direction: column;
            align-items: flex-start !important;
            gap: 0.5rem;
          }
           section .export-option div select {
            width: 100%;
            max-width: none !important;
          }
        }
      `}</style>

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
              <h2 className="modal-title" style={{ fontWeight: 800 }}>
                {t.calendar.addPersonalizedTitle}
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <CloseIcon size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div className="form-group">
                  <label>{lang === 'es' ? 'Título' : lang === 'pt' ? 'Título' : 'Title'}</label>
                  <input 
                    type="text" 
                    value={newEvent.title} 
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder={lang === 'es' ? 'Ej: Entrega de TP' : lang === 'pt' ? 'Ex: Entrega de TP' : 'e.g. Project Delivery'}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>{lang === 'es' ? 'Desde' : lang === 'pt' ? 'Início' : 'From'}</label>
                    <input 
                      type="date" 
                      value={newEvent.startDate} 
                      onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>{lang === 'es' ? 'Hasta (Opcional)' : lang === 'pt' ? 'Fim (Opcional)' : 'To (Optional)'}</label>
                    <input 
                      type="date" 
                      value={newEvent.endDate} 
                      onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                      min={newEvent.startDate}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                    />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>{lang === 'es' ? 'Tipo' : lang === 'pt' ? 'Tipo' : 'Type'}</label>
                  <select 
                    value={newEvent.type} 
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                  >
                    <option value="exam">{ct.events.exam}</option>
                    <option value="quiz_mandatory">{ct.events.quizMandatory}</option>
                    <option value="enrollment">{ct.events.enrollment}</option>
                    <option value="classes">{ct.events.classes}</option>
                    <option value="event">{ct.events.others}</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>{ct.periodFilter || 'Cuatrimestre'}</label>
                  <select 
                    value={newEvent.period} 
                    onChange={(e) => setNewEvent({...newEvent, period: e.target.value, subjectId: 'all'})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                  >
                    <option value="all">{ct.allPeriods}</option>
                    <option value={ct.firstPeriod}>{ct.firstPeriod}</option>
                    <option value={ct.secondPeriod}>{ct.secondPeriod}</option>
                    <option value={ct.thirdPeriod}>{ct.thirdPeriod}</option>
                    <option value={ct.fourthPeriod}>{ct.fourthPeriod}</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>{lang === 'es' ? 'Materia (opcional)' : lang === 'pt' ? 'Matéria (opcional)' : 'Subject (optional)'}</label>
                  <select 
                    value={newEvent.subjectId} 
                    onChange={(e) => setNewEvent({...newEvent, subjectId: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                  >
                    <option value="all">{newEvent.period === 'all' ? ct.allSubjects : ct.allSubjectsOfPeriod}</option>
                    {availableSubjects.modal.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name as string}</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={handleSaveEvent}
                  disabled={isSaving}
                  style={{
                    width: '100%',
                    background: '#000',
                    color: '#fff',
                    padding: '1rem',
                    borderRadius: '14px',
                    border: 'none',
                    fontWeight: '800',
                    marginTop: '1.5rem',
                    cursor: 'pointer',
                    opacity: isSaving ? 0.7 : 1,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  {isSaving ? (lang === 'es' ? 'Guardando...' : lang === 'pt' ? 'Salvando...' : 'Saving...') : (lang === 'es' ? 'Guardar' : lang === 'pt' ? 'Salvar' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        )}

      <style jsx>{`
        .calendar-controls {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            margin-bottom: 2.5rem;
            background: white;
            padding: 1.5rem;
            border-radius: 20px;
            border: 1px solid var(--border);
            box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }

        .calendar-search-row {
            width: 100%;
        }

        .calendar-filters-row {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
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
          border-color: rgba(37, 99, 235, 0.4);
          background: rgba(37, 99, 235, 0.03);
        }

        :global(.calendar-day.has-personal:hover) {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.05);
        }

        :global(.calendar-day.selected.has-personal) {
          background: #f0f9ff !important;
          border-color: #2563eb !important;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.15);
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

        :global(.event-enrollment .preview-dot) { background: #10b981; }
        :global(.event-classes .preview-dot) { background: #f97316; }
        :global(.event-holiday .preview-dot) { background: #ef4444; }
        :global(.event-exam .preview-dot) { background: #2563eb; }
        :global(.event-quiz_mandatory .preview-dot) { background: #a855f7; }
        :global(.event-event .preview-dot), :global(.event-admin .preview-dot) { background: #64748b; }

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

        .legend-dot.enrollment { background: #10b981; }
        .legend-dot.classes { background: #f97316; }
        .legend-dot.holiday { background: #ef4444; }
        .legend-dot.exam { background: #2563eb; }
        .legend-dot.quiz_mandatory { background: #a855f7; }
        .legend-dot.event { background: #64748b; }

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

        .selection-card.is-personal {
          background: #f0f9ff;
          border-color: #2563eb;
          box-shadow: 0 8px 30px rgba(37, 99, 235, 0.08);
        }

        .selection-card.is-personal .selection-header {
          color: #1d4ed8;
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

        .event-detail-item.type-enrollment { border-left-color: #10b981; }
        .event-detail-item.type-classes { border-left-color: #f97316; }
        .event-detail-item.type-holiday { border-left-color: #ef4444; }
        .event-detail-item.type-exam { border-left-color: #2563eb; }
        .event-detail-item.type-quiz_mandatory { border-left-color: #a855f7; }
        .event-detail-item.is-personal { border-left-color: #0ea5e9 !important; }

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
          justify-content: flex-start;
        }

        .empty-selection {
          text-align: left;
          padding: 1rem 0 1rem 1.6rem;
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

        .tag-exam { background: #dbeafe; color: #1e40af; }
        .tag-quiz_mandatory { background: #f3e8ff; color: #7e22ce; }
        .tag-classes { background: #ffedd5; color: #9a3412; }
        .tag-enrollment { background: #dcfce7; color: #15803d; }
        .tag-admin { background: #fef2f2; color: #991b1b; }
        .tag-event { background: #f1f5f9; color: #475569; }

        .feedback-email-btn:hover {
            background: rgba(234, 179, 8, 0.05);
            transform: translateY(-1px);
        }

        .cronograma-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 16px;
            color: var(--foreground);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 600;
            transition: all 0.2s;
        }

        .cronograma-link:hover {
            border-color: #000;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .cronograma-link span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: flex;
            flex-direction: column;
        }

        .cronograma-subject {
          font-weight: 800;
          color: #000;
        }

        @media (min-width: 901px) {
          .cronograma-link span {
            flex-direction: row;
            gap: 0.3rem;
          }
          .cronograma-subject {
            font-weight: inherit;
            color: inherit;
          }
        }

        @media (max-width: 900px) {
          .synced-badge { display: none !important; }
          .calendar-controls { 
              padding: 1rem;
              gap: 1rem;
          }
          .calendar-filters-row {
              flex-direction: column;
              gap: 0.75rem;
          }
          .filter-box, .search-box {
              width: 100%;
              flex: none;
          }
          .calendar-main-card { 
            padding: 1.25rem; 
            border-radius: 20px;
          }
          .calendar-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          .calendar-layout { gap: 1rem; }
          .calendar-sidebar { grid-template-columns: 1fr; }
          .calendar-grid { gap: 0.4rem; }
          .cronogramas-section > div { grid-template-columns: 1fr !important; }
          :global(.calendar-day) { aspect-ratio: 1; padding: 0.4rem; border-radius: 12px; }
          :global(.day-number) { font-size: 0.75rem; }
          .weekday { font-size: 0.65rem; }
          .preview-text { display: none; }
          .day-event-preview { width: fit-content; background: transparent; border: none; padding: 0; margin: 0; }
          .preview-dot { width: 8px; height: 8px; }
          .calendar-legend { gap: 1rem; padding-top: 1rem; }
        }
      `}</style>
    </div>
  )
}

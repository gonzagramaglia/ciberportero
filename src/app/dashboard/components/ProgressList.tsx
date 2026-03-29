"use client"

import { useState } from "react"
import { addExamProgress, deleteProgress } from "../actions"
import { ExamProgress } from "@prisma/client"
import { Plus, Trash2, CheckCircle, Clock } from "lucide-react"

export function ProgressList({ initialProgress }: { initialProgress: any[] }) {
  const [examTitle, setExamTitle] = useState("")
  const [type, setType] = useState("autoevaluacion")
  const [isAdding, setIsAdding] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setIsAdding(true)
    
    const formData = new FormData()
    formData.append("examTitle", examTitle)
    formData.append("type", type)
    formData.append("subject", "Cyberdefense") // Default for now
    
    await addExamProgress(formData)
    setExamTitle("")
    setIsAdding(false)
  }

  return (
    <div className="progress-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Activity Tracking</h2>
      </div>

      <form onSubmit={handleAdd} style={{ 
        display: 'flex', 
        gap: '0.8rem', 
        marginBottom: '2rem', 
        background: 'rgba(0, 0, 0, 0.03)', 
        padding: '1.5rem', 
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Task Name</label>
          <input 
            type="text" 
            placeholder="e.g. Self-Assessment #1" 
            value={examTitle} 
            onChange={e => setExamTitle(e.target.value)}
            required
            style={{ 
              padding: '0.6rem 0.8rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border)',
              background: 'white'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Type</label>
          <select 
            value={type} 
            onChange={e => setType(e.target.value)}
            style={{ 
              padding: '0.6rem 0.8rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border)',
              background: 'white'
            }}
          >
            <option value="autoevaluacion">Self-Assessment</option>
            <option value="parcial">Midterm Exam</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isAdding}
          style={{ 
            marginTop: 'auto',
            padding: '0.6rem 1.2rem', 
            borderRadius: '8px', 
            background: 'var(--accent)', 
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          {isAdding ? 'Saving...' : <><Plus size={18} /> Add</>}
        </button>
      </form>

      <ul className="post-list">
        {initialProgress.length === 0 ? (
          <li style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', listStyle: 'none' }}>
            No progress tracked yet. Add your first record above!
          </li>
        ) : (
          initialProgress.map((item: any) => (
            <li key={item.id} className="post-item" style={{ marginBottom: '0.8rem', listStyle: 'none' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1.2rem',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                background: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: item.type === 'parcial' ? '#ef4444' : 'var(--success)' }}>
                    <CheckCircle size={20} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.type === 'parcial' ? 'Midterm Exam' : 'Self-Assessment'}
                    </span>
                    <span style={{ fontWeight: '600', fontSize: '1rem' }}>{item.examTitle}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                     <Clock size={14} />
                     {new Date(item.createdAt).toLocaleDateString()}
                   </span>
                  <button 
                    onClick={() => deleteProgress(item.id)}
                    style={{ 
                      padding: '0.4rem', 
                      borderRadius: '6px', 
                      background: 'transparent',
                      color: '#666',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#666')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

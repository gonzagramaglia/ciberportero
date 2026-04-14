"use client"

import { useSession } from "next-auth/react"
import { useLanguage } from "../context/LanguageContext"
import { Cloud, Check, Loader2 } from "lucide-react"

export default function SyncStatus() {
  const { data: session, status } = useSession()
  const { lang } = useLanguage()

  if (status !== 'authenticated' || !session?.user) return null

  const msg = lang === 'es' 
    ? `Sincronizado con la cuenta cloud de` 
    : lang === 'pt' 
      ? `Sincronizado com a conta cloud de` 
      : `Synced with cloud account of`

  return (
    <div 
      className="sync-status-badge fade-in"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '0.6rem 1rem',
        borderRadius: '100px',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        pointerEvents: 'none',
        userSelect: 'none'
      }}
    >
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#10b981',
        boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
        animation: 'pulse 2s infinite'
      }} />
      
      <span style={{ 
        fontSize: '0.85rem', 
        fontWeight: '600', 
        color: '#4b5563',
        letterSpacing: '-0.01em'
      }}>
        {msg} <span style={{ color: '#000', fontWeight: '800' }}>{session.user.name?.split(' ')[0]}</span>
      </span>

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .sync-status-badge {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 768px) {
          .sync-status-badge {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
